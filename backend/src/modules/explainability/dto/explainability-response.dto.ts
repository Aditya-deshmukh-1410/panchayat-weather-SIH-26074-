import { ApiProperty } from '@nestjs/swagger';

export class ShapFeatureDto {
  @ApiProperty({ description: 'Raw model feature name', example: 'block_rainfall' })
  feature: string;

  @ApiProperty({ description: 'Human-readable feature label', example: 'Block rainfall' })
  label: string;

  @ApiProperty({ description: 'Mean absolute SHAP value across evaluated dataset', example: 1.5586 })
  mean_abs_shap: number;
}

export class ExplainabilityResponseDto {
  @ApiProperty({ description: 'ML model version', example: 'v0.1.0-alpha' })
  model_version: string;

  @ApiProperty({ description: 'Type of explainability artifact', example: 'global_shap_importance' })
  type: string;

  @ApiProperty({ description: 'Scope of SHAP values', example: 'model_level' })
  scope: string;

  @ApiProperty({
    description: 'Methodological interpretation of the values',
    example: 'Mean absolute SHAP values summarize feature contribution magnitude across the evaluated dataset.',
  })
  interpretation: string;

  @ApiProperty({
    description: 'Scientific and causal limitation disclaimer',
    example: 'SHAP values describe how features contributed to the model prediction. They are model attributions, not causal evidence.',
  })
  disclaimer: string;

  @ApiProperty({ description: 'Total number of evaluated model features', example: 17 })
  total_features: number;

  @ApiProperty({ type: [ShapFeatureDto], description: 'Model features ranked by mean absolute SHAP descending' })
  features: ShapFeatureDto[];
}
