export interface PanchayatProperties {
  id: string;
  name: string;
  census_code: string;
  area_sqkm: number;
  elevation_m: number;
  latitude: number;
  longitude: number;
  dist_to_block_center_km: number;
  block_id: string;
  block_name: string;
  district_name: string;
  state_name: string;
}

export interface PanchayatFeature {
  type: 'Feature';
  id: string;
  properties: PanchayatProperties;
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
}

export interface PanchayatCollection {
  type: 'FeatureCollection';
  block?: {
    id: string;
    name: string;
    district_name: string;
    state_name: string;
    centroid_lat: number;
    centroid_lon: number;
  };
  total_panchayats: number;
  features: PanchayatFeature[];
}

export interface Canonical17Features {
  block_rainfall: number;
  block_temp_max: number;
  block_temp_min: number;
  block_humidity: number;
  block_wind_speed: number;
  latitude: number;
  longitude: number;
  elevation_m: number;
  area_sqkm: number;
  dist_to_block_center_km: number;
  rainfall_lag_1d: number;
  rainfall_lag_2d: number;
  rainfall_lag_3d: number;
  rainfall_rolling_7d_mean: number;
  rainfall_rolling_7d_max: number;
  day_of_year: number;
  month: number;
}

export interface FeatureRecordResponse {
  panchayat_id: string;
  panchayat_name: string;
  date: string;
  split: string;
  features: Canonical17Features;
  baseline_block_rainfall: number;
  reference_target_rainfall_mm: number;
  provenance: {
    coarse_weather: string;
    reference_target: string;
  };
}

export interface PredictionWithUncertaintyResult {
  prediction_mm: number;
  lower_bound_80_mm: number;
  upper_bound_80_mm: number;
  lower_bound_90_mm: number;
  upper_bound_90_mm: number;
  interval_width_80_mm: number;
  interval_width_90_mm: number;
  model_version: string;
  uncertainty_method: string;
  // Attached contextual metadata
  date: string;
  panchayat_id: string;
  panchayat_name: string;
  baseline_block_rainfall: number;
  reference_target_rainfall_mm: number;
}

// Phase 6 Agro-Meteorological Advisory Types
export type RainfallCategory = 'very_low' | 'light' | 'moderate' | 'heavy';
export type AdvisorySeverity = 'INFO' | 'WATCH' | 'CAUTION';

export interface AdvisoryRequest {
  panchayat_id: string;
  panchayat_name?: string;
  date: string;
  rainfall_mm: number;
  lower_80_mm?: number;
  upper_80_mm?: number;
  lower_90_mm?: number;
  upper_90_mm?: number;
  temperature_max?: number;
  temperature_min?: number;
  humidity?: number;
  wind_speed?: number;
  model_version?: string;
  baseline_block_rainfall?: number;
}

export interface AdvisoryUncertainty {
  level: string;
  lower_mm: number;
  upper_mm: number;
  interval_width_mm: number;
  spans_multiple_categories: boolean;
  categories_spanned: RainfallCategory[];
  uncertainty_note?: string;
}

export interface AdvisoryDataContext {
  historical_experiment: boolean;
  experiment_date: string;
  reference_proxy: string;
  input_proxy: string;
  model_version: string;
  disclaimer: string;
}

export interface AdvisoryResponse {
  panchayat_id: string;
  panchayat_name?: string;
  date: string;
  rainfall_mm: number;
  rainfall_category: RainfallCategory;
  category_label: string;
  severity: AdvisorySeverity;
  headline: string;
  recommendations: string[];
  ancillary_notices: string[];
  uncertainty?: AdvisoryUncertainty;
  basis: string[];
  data_context: AdvisoryDataContext;
}

// Phase 6C Model Explainability (SHAP) Types
export interface ShapFeatureContribution {
  feature: string;
  label: string;
  mean_abs_shap: number;
}

export interface ExplainabilityResponse {
  model_version: string;
  type: string;
  scope: string;
  interpretation: string;
  disclaimer: string;
  total_features: number;
  features: ShapFeatureContribution[];
}

