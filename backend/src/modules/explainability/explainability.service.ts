import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { ExplainabilityResponseDto, ShapFeatureDto } from './dto/explainability-response.dto';

export const FEATURE_LABEL_MAP: Record<string, string> = {
  block_rainfall: 'Block rainfall',
  block_temp_max: 'Block maximum temperature',
  block_temp_min: 'Block minimum temperature',
  block_humidity: 'Block humidity',
  block_wind_speed: 'Block wind speed',
  latitude: 'Latitude',
  longitude: 'Longitude',
  elevation_m: 'Elevation',
  area_sqkm: 'Panchayat area',
  dist_to_block_center_km: 'Distance from block center',
  rainfall_lag_1d: 'Previous-day rainfall',
  rainfall_lag_2d: 'Rainfall 2 days earlier',
  rainfall_lag_3d: 'Rainfall 3 days earlier',
  rainfall_rolling_7d_mean: '7-day rainfall average',
  rainfall_rolling_7d_max: '7-day rainfall maximum',
  day_of_year: 'Day of year',
  month: 'Month',
};

@Injectable()
export class ExplainabilityService {
  private readonly logger = new Logger(ExplainabilityService.name);
  private cachedExplainability: ExplainabilityResponseDto | null = null;
  private readonly MODEL_VERSION = 'v0.1.0-alpha';

  constructor() {
    this.loadShapSummary();
  }

  /**
   * Load and parse verified Phase 3/4A SHAP summary CSV artifact.
   */
  private loadShapSummary(): void {
    const possiblePaths = [
      path.resolve(__dirname, '../../../../data/processed/models/shap_summary.csv'),
      path.resolve(process.cwd(), '../data/processed/models/shap_summary.csv'),
      path.resolve(process.cwd(), 'data/processed/models/shap_summary.csv'),
      'C:\\Users\\ADMIN\\.gemini\\antigravity-ide\\scratch\\panchayat-weather\\data\\processed\\models\\shap_summary.csv',
    ];

    let csvPath = '';
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        csvPath = p;
        break;
      }
    }

    if (!csvPath) {
      this.logger.error('Could not locate shap_summary.csv in any candidate search path');
      return;
    }

    try {
      this.logger.log(`Loading authentic SHAP summary artifact from: ${csvPath}`);
      const content = fs.readFileSync(csvPath, 'utf-8');
      const lines = content.trim().split('\n');

      if (lines.length < 2) {
        this.logger.error('shap_summary.csv contains insufficient data');
        return;
      }

      // Expected header: feature,mean_abs_shap
      const features: ShapFeatureDto[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const parts = line.split(',');
        if (parts.length < 2) continue;

        const featureKey = parts[0].trim();
        const meanAbsVal = parseFloat(parts[1].trim());

        if (isNaN(meanAbsVal)) continue;

        features.push({
          feature: featureKey,
          label: FEATURE_LABEL_MAP[featureKey] || featureKey,
          mean_abs_shap: meanAbsVal,
        });
      }

      // Sort strictly by mean_abs_shap descending
      features.sort((a, b) => b.mean_abs_shap - a.mean_abs_shap);

      this.cachedExplainability = {
        model_version: this.MODEL_VERSION,
        type: 'global_shap_importance',
        scope: 'model_level',
        interpretation:
          'Mean absolute SHAP values summarize feature contribution magnitude across the evaluated dataset.',
        disclaimer:
          'SHAP values describe how features contributed to the model prediction. They are model attributions, not causal evidence.',
        total_features: features.length,
        features: features,
      };

      this.logger.log(
        `Successfully loaded ${features.length} model features from SHAP summary artifact. Top feature: ${features[0]?.label} (${features[0]?.mean_abs_shap})`,
      );
    } catch (err: any) {
      this.logger.error(`Error loading shap_summary.csv: ${err.message}`, err.stack);
    }
  }

  /**
   * Return model-level SHAP importance explainability response.
   */
  getGlobalExplainability(): ExplainabilityResponseDto {
    if (!this.cachedExplainability) {
      // Attempt reload in case files were initialized later
      this.loadShapSummary();
    }

    if (!this.cachedExplainability) {
      throw new ServiceUnavailableException(
        'Model explainability is currently unavailable. SHAP summary artifact could not be parsed.',
      );
    }

    return this.cachedExplainability;
  }
}
