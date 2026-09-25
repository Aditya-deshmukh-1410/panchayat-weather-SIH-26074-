import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ExplainabilityService } from './explainability.service';
import { ExplainabilityResponseDto } from './dto/explainability-response.dto';

@ApiTags('Explainability')
@Controller('explainability')
export class ExplainabilityController {
  constructor(private readonly explainabilityService: ExplainabilityService) {}

  @Get()
  @ApiOperation({
    summary: 'Get model-level feature contribution (SHAP)',
    description:
      'Returns global mean absolute SHAP feature importance evaluated across the historical dataset for the frozen XGBoost model.',
  })
  @ApiResponse({
    status: 200,
    description: 'Global model SHAP feature importance successfully retrieved',
    type: ExplainabilityResponseDto,
  })
  @ApiResponse({
    status: 503,
    description: 'Explainability artifact is unavailable',
  })
  getExplainability(): ExplainabilityResponseDto {
    return this.explainabilityService.getGlobalExplainability();
  }

  @Get('global')
  @ApiOperation({
    summary: 'Alias for global model-level feature contribution (SHAP)',
    description: 'Explicit endpoint identifying global model-level scope.',
  })
  @ApiResponse({
    status: 200,
    description: 'Global model SHAP feature importance successfully retrieved',
    type: ExplainabilityResponseDto,
  })
  getGlobalExplainability(): ExplainabilityResponseDto {
    return this.explainabilityService.getGlobalExplainability();
  }
}
