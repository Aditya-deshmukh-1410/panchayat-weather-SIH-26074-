import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import {
  ServiceUnavailableException,
  BadRequestException,
} from '@nestjs/common';
import { PredictionsService } from './predictions.service';
import { PredictDto } from './dto/predict.dto';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PredictionsService', () => {
  let service: PredictionsService;
  let mockHttpClient: { post: jest.Mock };

  const validPayload: PredictDto = {
    block_rainfall: 5.62,
    block_temp_max: 26.72,
    block_temp_min: 21.5,
    block_humidity: 90.61,
    block_wind_speed: 4.11,
    latitude: 18.27524,
    longitude: 74.37465,
    elevation_m: 598.0,
    area_sqkm: 13.56,
    dist_to_block_center_km: 25.36,
    rainfall_lag_1d: 9.6,
    rainfall_lag_2d: 1.0,
    rainfall_lag_3d: 0.5,
    rainfall_rolling_7d_mean: 4.46,
    rainfall_rolling_7d_max: 15.8,
    day_of_year: 245,
    month: 9,
  };

  beforeEach(async () => {
    mockHttpClient = {
      post: jest.fn(),
    };
    mockedAxios.create.mockReturnValue(mockHttpClient as any);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PredictionsService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('http://127.0.0.1:8000'),
          },
        },
      ],
    }).compile();

    service = module.get<PredictionsService>(PredictionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully map and return a prediction from FastAPI', async () => {
    const mockFastApiResponse = {
      data: {
        prediction_mm: 8.564,
        model_version: 'v0.1.0-alpha',
        target: 'daily_precipitation_mm',
        reference_type: 'ERA5-Land_reference_proxy',
      },
    };
    mockHttpClient.post.mockResolvedValueOnce(mockFastApiResponse);

    const result = await service.predict(validPayload);
    expect(mockHttpClient.post).toHaveBeenCalledWith('/predict', validPayload);
    expect(result).toEqual(mockFastApiResponse.data);
    expect(result.prediction_mm).toBe(8.564);
  });

  it('should successfully map and return uncertainty prediction intervals from FastAPI', async () => {
    const mockFastApiResponse = {
      data: {
        prediction_mm: 8.564,
        lower_bound_80_mm: 0.3958,
        upper_bound_80_mm: 16.7322,
        lower_bound_90_mm: 0.0,
        upper_bound_90_mm: 21.8821,
        interval_width_80_mm: 16.3364,
        interval_width_90_mm: 21.8821,
        model_version: 'v0.1.0-alpha',
        uncertainty_method: 'split_conformal_prediction',
      },
    };
    mockHttpClient.post.mockResolvedValueOnce(mockFastApiResponse);

    const result = await service.predictWithUncertainty(validPayload);
    expect(mockHttpClient.post).toHaveBeenCalledWith(
      '/predict-with-uncertainty',
      validPayload,
    );
    expect(result).toEqual(mockFastApiResponse.data);
    expect(result.lower_bound_90_mm).toBeLessThanOrEqual(result.prediction_mm);
    expect(result.prediction_mm).toBeLessThanOrEqual(result.upper_bound_90_mm);
  });

  it('should throw ServiceUnavailableException when FastAPI is offline / unreachable', async () => {
    const networkError = new Error('connect ECONNREFUSED 127.0.0.1:8000');
    (networkError as any).code = 'ECONNREFUSED';
    mockHttpClient.post.mockRejectedValueOnce(networkError);

    await expect(service.predict(validPayload)).rejects.toThrow(
      ServiceUnavailableException,
    );
  });

  it('should throw ServiceUnavailableException when FastAPI returns 503 (model not ready)', async () => {
    const error503 = {
      response: {
        status: 503,
        data: { detail: 'Model is not ready.' },
      },
    };
    mockHttpClient.post.mockRejectedValueOnce(error503);

    await expect(service.predict(validPayload)).rejects.toThrow(
      ServiceUnavailableException,
    );
  });

  it('should throw BadRequestException when FastAPI returns 422 validation failure', async () => {
    const error422 = {
      response: {
        status: 422,
        data: { detail: [{ msg: 'Field required', loc: ['body', 'month'] }] },
      },
    };
    mockHttpClient.post.mockRejectedValueOnce(error422);

    await expect(service.predict(validPayload)).rejects.toThrow(
      BadRequestException,
    );
  });
});
