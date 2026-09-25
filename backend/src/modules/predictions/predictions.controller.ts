import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PredictionsService } from './predictions.service';
import { PredictDto } from './dto/predict.dto';
import {
  PredictionResponseDto,
  PredictionWithUncertaintyResponseDto,
} from './dto/prediction-response.dto';

@ApiTags('Predictions')
@Controller('predictions')
export class PredictionsController {
  constructor(private readonly predictionsService: PredictionsService) {}

  @Post()
  @ApiOperation({
    summary: 'Generate downscaled Panchayat daily precipitation prediction',
    description:
      'Accepts the 17 approved meteorological, topographical, and antecedent lag features, ' +
      'validates them against the canonical schema, and forwards to the frozen XGBoost downscaler.',
  })
  @ApiResponse({
    status: 200,
    description: 'Downscaled precipitation prediction in mm/day (non-negative)',
    type: PredictionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validation failed on feature payload',
  })
  @ApiResponse({
    status: 503,
    description: 'Service Unavailable - ML inference service is offline or not ready',
  })
  async predict(@Body() dto: PredictDto): Promise<PredictionResponseDto> {
    return this.predictionsService.predict(dto);
  }

  @Post('with-uncertainty')
  @ApiOperation({
    summary:
      'Generate downscaled precipitation with Split-Conformal prediction intervals',
    description:
      'Accepts the 17 approved features and returns the point prediction alongside ' +
      'statistically grounded 80% and 90% split-conformal prediction intervals.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Downscaled precipitation with split-conformal prediction bounds',
    type: PredictionWithUncertaintyResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Validation failed on feature payload',
  })
  @ApiResponse({
    status: 503,
    description: 'Service Unavailable - ML inference service is offline or not ready',
  })
  async predictWithUncertainty(
    @Body() dto: PredictDto,
  ): Promise<PredictionWithUncertaintyResponseDto> {
    return this.predictionsService.predictWithUncertainty(dto);
  }
}
