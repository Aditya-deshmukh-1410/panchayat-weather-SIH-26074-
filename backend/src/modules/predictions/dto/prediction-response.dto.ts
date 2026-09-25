import { ApiProperty } from '@nestjs/swagger';

export class PredictionResponseDto {
  @ApiProperty({ description: 'Downscaled precipitation prediction (mm/day, non-negative)', example: 8.564 })
  prediction_mm: number;

  @ApiProperty({ description: 'Active XGBoost model version', example: 'v0.1.0-alpha' })
  model_version: string;

  @ApiProperty({ description: 'Target meteorological variable', example: 'daily_precipitation_mm' })
  target: string;

  @ApiProperty({ description: 'Reference proxy provenance classification', example: 'ERA5-Land_reference_proxy' })
  reference_type: string;
}

export class PredictionWithUncertaintyResponseDto {
  @ApiProperty({ description: 'Downscaled point precipitation prediction (mm/day)', example: 8.564 })
  prediction_mm: number;

  @ApiProperty({ description: 'Split-conformal 80% lower bound (mm/day)', example: 0.3958 })
  lower_bound_80_mm: number;

  @ApiProperty({ description: 'Split-conformal 80% upper bound (mm/day)', example: 16.7322 })
  upper_bound_80_mm: number;

  @ApiProperty({ description: 'Split-conformal 90% lower bound (mm/day)', example: 0.0 })
  lower_bound_90_mm: number;

  @ApiProperty({ description: 'Split-conformal 90% upper bound (mm/day)', example: 21.8821 })
  upper_bound_90_mm: number;

  @ApiProperty({ description: '80% conformal interval width (mm/day)', example: 16.3364 })
  interval_width_80_mm: number;

  @ApiProperty({ description: '90% conformal interval width (mm/day)', example: 21.8821 })
  interval_width_90_mm: number;

  @ApiProperty({ description: 'Active XGBoost model version', example: 'v0.1.0-alpha' })
  model_version: string;

  @ApiProperty({ description: 'Statistical uncertainty methodology', example: 'split_conformal_prediction' })
  uncertainty_method: string;
}
