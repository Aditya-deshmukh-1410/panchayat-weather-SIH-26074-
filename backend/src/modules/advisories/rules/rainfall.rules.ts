import { RainfallCategory, AdvisorySeverity } from '../interfaces/advisory.interface';

export interface RainfallRuleDefinition {
  category: RainfallCategory;
  label: string;
  min_mm: number;
  max_mm: number; // exclusive except for HEAVY
  severity: AdvisorySeverity;
  headline: string;
  recommendations: string[];
}

export const RAINFALL_RULES: Record<RainfallCategory, RainfallRuleDefinition> = {
  [RainfallCategory.VERY_LOW]: {
    category: RainfallCategory.VERY_LOW,
    label: 'DRY / VERY LOW RAINFALL',
    min_mm: 0,
    max_mm: 1,
    severity: AdvisorySeverity.INFO,
    headline: 'Dry / Very low rainfall signal',
    recommendations: [
      'Rainfall signal is low (< 1 mm); localized rainfall contribution to soil moisture is likely limited.',
      'Avoid assuming irrigation is strictly required without verifying local plot-level soil moisture.',
      'Monitor local field conditions and upcoming weather updates before scheduling farm operations.',
    ],
  },
  [RainfallCategory.LIGHT]: {
    category: RainfallCategory.LIGHT,
    label: 'LIGHT RAINFALL',
    min_mm: 1,
    max_mm: 5,
    severity: AdvisorySeverity.INFO,
    headline: 'Light rainfall signal',
    recommendations: [
      'Light precipitation (1–5 mm) is indicated for the Panchayat.',
      'Consider expected rainfall before scheduling irrigation or chemical spray operations.',
      'Monitor topsoil moisture and microclimatic conditions across fields.',
    ],
  },
  [RainfallCategory.MODERATE]: {
    category: RainfallCategory.MODERATE,
    label: 'MODERATE RAINFALL',
    min_mm: 5,
    max_mm: 20,
    severity: AdvisorySeverity.WATCH,
    headline: 'Moderate rainfall signal',
    recommendations: [
      'Moderate rainfall (5–20 mm) is indicated for the Panchayat.',
      'Consider postponing sensitive field operations (e.g. spraying, weeding, harvesting) that depend on dry foliage or soil.',
      'Monitor plot drainage channels and standing water in lower plot sections.',
    ],
  },
  [RainfallCategory.HEAVY]: {
    category: RainfallCategory.HEAVY,
    label: 'HEAVY RAINFALL',
    min_mm: 20,
    max_mm: Infinity,
    severity: AdvisorySeverity.CAUTION,
    headline: 'Heavy rainfall signal',
    recommendations: [
      'Heavy rainfall (≥ 20 mm) is indicated for the Panchayat.',
      'Monitor water accumulation, drainage channels, and bund integrity across plots.',
      'Consider avoiding field operations, fertilizer broadcasting, and chemical applications during and immediately following heavy rainfall.',
      'Monitor vulnerable low-lying fields for waterlogging risk.',
    ],
  },
};

const CATEGORY_ORDER: RainfallCategory[] = [
  RainfallCategory.VERY_LOW,
  RainfallCategory.LIGHT,
  RainfallCategory.MODERATE,
  RainfallCategory.HEAVY,
];

/**
 * Deterministically classifies rainfall in mm into the 4 approved prototype tiers:
 * 0 <= r < 1   -> very_low
 * 1 <= r < 5   -> light
 * 5 <= r < 20  -> moderate
 * r >= 20      -> heavy
 */
export function classifyRainfall(r: number): RainfallCategory {
  if (r < 1) {
    return RainfallCategory.VERY_LOW;
  }
  if (r < 5) {
    return RainfallCategory.LIGHT;
  }
  if (r < 20) {
    return RainfallCategory.MODERATE;
  }
  return RainfallCategory.HEAVY;
}

/**
 * Returns all distinct rainfall categories spanned by a closed interval [lower, upper].
 */
export function getCategoriesSpanned(lower: number, upper: number): RainfallCategory[] {
  const startCat = classifyRainfall(Math.max(0, lower));
  const endCat = classifyRainfall(Math.max(0, upper));

  const startIdx = CATEGORY_ORDER.indexOf(startCat);
  const endIdx = CATEGORY_ORDER.indexOf(endCat);

  if (startIdx === -1 || endIdx === -1) return [startCat];

  const minIdx = Math.min(startIdx, endIdx);
  const maxIdx = Math.max(startIdx, endIdx);

  return CATEGORY_ORDER.slice(minIdx, maxIdx + 1);
}

/**
 * Formats a user-friendly label for multiple categories spanned.
 */
export function formatCategorySpanNote(categories: RainfallCategory[]): string {
  if (categories.length <= 1) return '';
  const firstLabel = RAINFALL_RULES[categories[0]].label.toLowerCase();
  const lastLabel = RAINFALL_RULES[categories[categories.length - 1]].label.toLowerCase();
  return `Rainfall category has uncertainty: the calibrated interval spans ${firstLabel} through ${lastLabel}.`;
}

/**
 * Generates ancillary meteorological notices based on available optional parameters.
 * Note: Wording is cautious and avoids unfounded disease or outcome claims.
 */
export function getAncillaryNotices(params: {
  temperature_max?: number;
  humidity?: number;
  wind_speed?: number;
}): string[] {
  const notices: string[] = [];

  if (params.humidity !== undefined && params.humidity >= 85) {
    notices.push(
      'High relative humidity is indicated. Local crop and field conditions should be monitored, particularly where prolonged moisture is present.',
    );
  }

  if (params.temperature_max !== undefined && params.temperature_max >= 38) {
    notices.push(
      'Elevated maximum temperature is indicated; local crop and soil conditions may affect moisture demand.',
    );
  }

  if (params.wind_speed !== undefined && params.wind_speed >= 10) {
    notices.push(
      'Brisk wind speeds (≥ 10 m/s) indicated; consider delaying foliar or pesticide spraying to avoid drift.',
    );
  }

  return notices;
}
