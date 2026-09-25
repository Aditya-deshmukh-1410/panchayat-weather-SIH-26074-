import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class AdvisoryRequestDto {
  @ApiProperty({ description: 'Gram Panchayat identifier (e.g. P01 to P14)', example: 'P01' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[A-Za-z0-9_-]+$/, { message: 'panchayat_id must be an alphanumeric identifier' })
  panchayat_id: string;

  @ApiPropertyOptional({ description: 'Gram Panchayat name', example: 'Baburdi' })
  @IsOptional()
  @IsString()
  panchayat_name?: string;

  @ApiProperty({ description: 'Historical experiment date (YYYY-MM-DD)', example: '2024-09-01' })
  @IsNotEmpty()
  @IsDateString({}, { message: 'date must be a valid ISO date string (YYYY-MM-DD)' })
  date: string;

  @ApiProperty({ description: 'Downscaled precipitation prediction (mm/day)', example: 8.564 })
  @IsNotEmpty()
  @IsNumber({ allowNaN: false, allowInfinity: false }, { message: 'rainfall_mm must be a finite number' })
  @Min(0, { message: 'rainfall_mm must not be negative' })
  @Max(1000, { message: 'rainfall_mm must not exceed 1000 mm' })
  rainfall_mm: number;

  @ApiPropertyOptional({ description: 'Split-conformal 80% lower bound (mm/day)', example: 0.3958 })
  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false }, { message: 'lower_80_mm must be a finite number' })
  @Min(0, { message: 'lower_80_mm must not be negative' })
  @Max(1000, { message: 'lower_80_mm must not exceed 1000 mm' })
  lower_80_mm?: number;

  @ApiPropertyOptional({ description: 'Split-conformal 80% upper bound (mm/day)', example: 16.7322 })
  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false }, { message: 'upper_80_mm must be a finite number' })
  @Min(0, { message: 'upper_80_mm must not be negative' })
  @Max(1000, { message: 'upper_80_mm must not exceed 1000 mm' })
  upper_80_mm?: number;

  @ApiPropertyOptional({ description: 'Split-conformal 90% lower bound (mm/day)', example: 0.0 })
  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false }, { message: 'lower_90_mm must be a finite number' })
  @Min(0, { message: 'lower_90_mm must not be negative' })
  @Max(1000, { message: 'lower_90_mm must not exceed 1000 mm' })
  lower_90_mm?: number;

  @ApiPropertyOptional({ description: 'Split-conformal 90% upper bound (mm/day)', example: 21.8821 })
  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false }, { message: 'upper_90_mm must be a finite number' })
  @Min(0, { message: 'upper_90_mm must not be negative' })
  @Max(1000, { message: 'upper_90_mm must not exceed 1000 mm' })
  upper_90_mm?: number;

  @ApiPropertyOptional({ description: 'Maximum temperature (°C)', example: 26.72 })
  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false }, { message: 'temperature_max must be a finite number' })
  @Min(-20, { message: 'temperature_max must not be below -20°C' })
  @Max(65, { message: 'temperature_max must not exceed 65°C' })
  temperature_max?: number;

  @ApiPropertyOptional({ description: 'Minimum temperature (°C)', example: 21.5 })
  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false }, { message: 'temperature_min must be a finite number' })
  @Min(-30, { message: 'temperature_min must not be below -30°C' })
  @Max(55, { message: 'temperature_min must not exceed 55°C' })
  temperature_min?: number;

  @ApiPropertyOptional({ description: 'Relative humidity (%)', example: 90.61 })
  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false }, { message: 'humidity must be a finite number' })
  @Min(0, { message: 'humidity must be at least 0%' })
  @Max(100, { message: 'humidity must not exceed 100%' })
  humidity?: number;

  @ApiPropertyOptional({ description: 'Wind speed (m/s)', example: 4.11 })
  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false }, { message: 'wind_speed must be a finite number' })
  @Min(0, { message: 'wind_speed must not be negative' })
  @Max(150, { message: 'wind_speed must not exceed 150 m/s' })
  wind_speed?: number;

  @ApiPropertyOptional({ description: 'Model version identifier', example: 'v0.1.0-alpha' })
  @IsOptional()
  @IsString()
  model_version?: string;

  @ApiPropertyOptional({ description: 'Coarse block-scale baseline rainfall (mm/day)', example: 5.62 })
  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false }, { message: 'baseline_block_rainfall must be a finite number' })
  @Min(0, { message: 'baseline_block_rainfall must not be negative' })
  @Max(1000, { message: 'baseline_block_rainfall must not exceed 1000 mm' })
  baseline_block_rainfall?: number;
}
