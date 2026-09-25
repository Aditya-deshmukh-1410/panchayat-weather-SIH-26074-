import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsInt, Min, Max, IsPositive } from 'class-validator';

/**
 * PredictDto validates the exact 17 approved non-leaking features
 * required for Panchayat-level precipitation downscaling.
 */
export class PredictDto {
  @ApiProperty({ description: 'Coarse block precipitation (mm/day)', example: 5.62, minimum: 0, maximum: 1000 })
  @IsNotEmpty()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Max(1000)
  block_rainfall: number;

  @ApiProperty({ description: 'Coarse maximum temperature (°C)', example: 26.72, minimum: -20, maximum: 65 })
  @IsNotEmpty()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(-20)
  @Max(65)
  block_temp_max: number;

  @ApiProperty({ description: 'Coarse minimum temperature (°C)', example: 21.5, minimum: -30, maximum: 55 })
  @IsNotEmpty()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(-30)
  @Max(55)
  block_temp_min: number;

  @ApiProperty({ description: 'Coarse relative humidity (%)', example: 90.61, minimum: 0, maximum: 100 })
  @IsNotEmpty()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Max(100)
  block_humidity: number;

  @ApiProperty({ description: 'Coarse wind speed at 2m (m/s)', example: 4.11, minimum: 0, maximum: 150 })
  @IsNotEmpty()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Max(150)
  block_wind_speed: number;

  @ApiProperty({ description: 'Panchayat centroid latitude (°N)', example: 18.27524, minimum: -90, maximum: 90 })
  @IsNotEmpty()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ description: 'Panchayat centroid longitude (°E)', example: 74.37465, minimum: -180, maximum: 180 })
  @IsNotEmpty()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiProperty({ description: 'Surface elevation in meters above sea level', example: 598.0, minimum: -500, maximum: 9000 })
  @IsNotEmpty()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(-500)
  @Max(9000)
  elevation_m: number;

  @ApiProperty({ description: 'Panchayat administrative boundary area (km²)', example: 13.56, minimum: 0.01, maximum: 10000 })
  @IsNotEmpty()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @IsPositive()
  @Max(10000)
  area_sqkm: number;

  @ApiProperty({ description: 'Geodesic distance to block centroid (km)', example: 25.36, minimum: 0, maximum: 1000 })
  @IsNotEmpty()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Max(1000)
  dist_to_block_center_km: number;

  @ApiProperty({ description: 'Localized reference precipitation at day t-1 (mm)', example: 9.6, minimum: 0, maximum: 1000 })
  @IsNotEmpty()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Max(1000)
  rainfall_lag_1d: number;

  @ApiProperty({ description: 'Localized reference precipitation at day t-2 (mm)', example: 1.0, minimum: 0, maximum: 1000 })
  @IsNotEmpty()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Max(1000)
  rainfall_lag_2d: number;

  @ApiProperty({ description: 'Localized reference precipitation at day t-3 (mm)', example: 0.5, minimum: 0, maximum: 1000 })
  @IsNotEmpty()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Max(1000)
  rainfall_lag_3d: number;

  @ApiProperty({ description: 'Antecedent 7-day rolling mean precipitation (mm)', example: 4.46, minimum: 0, maximum: 1000 })
  @IsNotEmpty()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Max(1000)
  rainfall_rolling_7d_mean: number;

  @ApiProperty({ description: 'Antecedent 7-day rolling maximum precipitation (mm)', example: 15.8, minimum: 0, maximum: 1000 })
  @IsNotEmpty()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  @Max(1000)
  rainfall_rolling_7d_max: number;

  @ApiProperty({ description: 'Ordinal day of year (1-366)', example: 245, minimum: 1, maximum: 366 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(366)
  day_of_year: number;

  @ApiProperty({ description: 'Calendar month (1-12)', example: 9, minimum: 1, maximum: 12 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;
}
