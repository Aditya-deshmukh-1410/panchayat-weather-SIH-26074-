export enum RainfallCategory {
  VERY_LOW = 'very_low',
  LIGHT = 'light',
  MODERATE = 'moderate',
  HEAVY = 'heavy',
}

export enum AdvisorySeverity {
  INFO = 'INFO',
  WATCH = 'WATCH',
  CAUTION = 'CAUTION',
}

export interface UncertaintyEvaluation {
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

export interface AgroAdvisory {
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
  uncertainty?: UncertaintyEvaluation;
  basis: string[];
  data_context: AdvisoryDataContext;
}
