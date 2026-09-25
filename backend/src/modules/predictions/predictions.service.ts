import {
  Injectable,
  Logger,
  ServiceUnavailableException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { PredictDto } from './dto/predict.dto';
import {
  PredictionResponseDto,
  PredictionWithUncertaintyResponseDto,
} from './dto/prediction-response.dto';

@Injectable()
export class PredictionsService {
  private readonly logger = new Logger(PredictionsService.name);
  private readonly httpClient: AxiosInstance;
  private readonly mlServiceUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.mlServiceUrl = this.configService.get<string>(
      'ML_SERVICE_URL',
      'http://127.0.0.1:8000',
    );
    this.httpClient = axios.create({
      baseURL: this.mlServiceUrl,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Forwards feature payload to FastAPI /predict
   */
  async predict(dto: PredictDto): Promise<PredictionResponseDto> {
    try {
      const response = await this.httpClient.post<PredictionResponseDto>(
        '/predict',
        dto,
      );
      return response.data;
    } catch (err: any) {
      this.handleError(err, 'predict');
    }
  }

  /**
   * Forwards feature payload to FastAPI /predict-with-uncertainty
   */
  async predictWithUncertainty(
    dto: PredictDto,
  ): Promise<PredictionWithUncertaintyResponseDto> {
    try {
      const response =
        await this.httpClient.post<PredictionWithUncertaintyResponseDto>(
          '/predict-with-uncertainty',
          dto,
        );
      return response.data;
    } catch (err: any) {
      this.handleError(err, 'predict-with-uncertainty');
    }
  }

  /**
   * Centralized structured error handling to prevent leaking server internals,
   * filesystem paths, or Python stack traces to API consumers.
   */
  private handleError(err: any, endpoint: string): never {
    if (!err.response) {
      this.logger.error(
        `Failed to reach ML service at ${this.mlServiceUrl} for ${endpoint}: ${err.message}`,
      );
      throw new ServiceUnavailableException({
        statusCode: 503,
        error: 'Service Unavailable',
        message: 'ML downscaling service is unreachable or not ready.',
      });
    }

    const status = err.response.status;
    const errorData = err.response.data;

    this.logger.warn(
      `ML service returned status ${status} for ${endpoint}: ${JSON.stringify(errorData)}`,
    );

    if (status === 503) {
      throw new ServiceUnavailableException({
        statusCode: 503,
        error: 'Service Unavailable',
        message: 'ML model artifacts are not ready for inference.',
      });
    }

    if (status === 422) {
      throw new BadRequestException({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Feature payload validation failed at ML service.',
        details: errorData?.detail || 'Unprocessable payload',
      });
    }

    throw new InternalServerErrorException({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Unexpected error from ML inference backend.',
    });
  }
}
