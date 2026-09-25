import {
  PanchayatCollection,
  FeatureRecordResponse,
  Canonical17Features,
  PredictionWithUncertaintyResult,
  AdvisoryRequest,
  AdvisoryResponse,
  ExplainabilityResponse,
} from '../types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:4000/api';

/**
 * Fetch all 14 Panchayats in Baramati Block with PostGIS GeoJSON geometry.
 */
export async function fetchPanchayats(): Promise<PanchayatCollection> {
  const url = `${API_BASE_URL}/panchayats`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    const errorBody = await res.text().catch(() => '');
    throw new Error(`Failed to load Panchayats (${res.status}): ${errorBody || res.statusText}`);
  }
  return res.json();
}

/**
 * Fetch authentic 17 features for a selected Panchayat and date from the backend.
 */
export async function fetchPanchayatFeatures(
  panchayatId: string,
  date = '2024-09-01',
): Promise<FeatureRecordResponse> {
  const url = `${API_BASE_URL}/panchayats/${encodeURIComponent(panchayatId)}/features?date=${encodeURIComponent(date)}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`Feature data unavailable for ${panchayatId} on ${date}.`);
    }
    const errorBody = await res.text().catch(() => '');
    throw new Error(`Error fetching features (${res.status}): ${errorBody || res.statusText}`);
  }
  return res.json();
}

/**
 * Submit verified 17-feature vector to NestJS prediction gateway for inference with conformal uncertainty.
 */
export async function runPredictionWithUncertainty(
  features: Canonical17Features,
  metadata: {
    panchayat_id: string;
    panchayat_name: string;
    date: string;
    baseline_block_rainfall: number;
    reference_target_rainfall_mm: number;
  },
): Promise<PredictionWithUncertaintyResult> {
  const url = `${API_BASE_URL}/predictions/with-uncertainty`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(features),
  });

  if (!res.ok) {
    let message = 'Prediction service error';
    try {
      const data = await res.json();
      message = Array.isArray(data.message) ? data.message.join('; ') : data.message || message;
    } catch {
      message = `Server returned HTTP ${res.status}`;
    }

    if (res.status === 503) {
      throw new Error('Prediction service is temporarily unavailable or initializing. Please retry shortly.');
    }
    throw new Error(message);
  }

  const result = await res.json();
  return {
    ...result,
    panchayat_id: metadata.panchayat_id,
    panchayat_name: metadata.panchayat_name,
    date: metadata.date,
    baseline_block_rainfall: metadata.baseline_block_rainfall,
    reference_target_rainfall_mm: metadata.reference_target_rainfall_mm,
  };
}

/**
 * Check backend health probe.
 */
export async function checkBackendHealth() {
  const url = `${API_BASE_URL}/health`;
  const res = await fetch(url, { cache: 'no-store' });
  return res.json();
}

/**
 * Request deterministic agro-meteorological advisory from NestJS advisory engine.
 */
export async function fetchAgroAdvisory(
  payload: AdvisoryRequest,
): Promise<AdvisoryResponse> {
  const url = `${API_BASE_URL}/advisories`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let message = 'Advisory service error';
    try {
      const data = await res.json();
      message = Array.isArray(data.message) ? data.message.join('; ') : data.message || message;
    } catch {
      message = `Server returned HTTP ${res.status}`;
    }
    throw new Error(message);
  }

  return res.json();
}

/**
 * Fetch model-level feature contribution (SHAP) explainability metadata from NestJS.
 */
export async function fetchExplainability(): Promise<ExplainabilityResponse> {
  const url = `${API_BASE_URL}/explainability`;
  const res = await fetch(url, { cache: 'no-store' });

  if (!res.ok) {
    let message = 'Explainability service error';
    try {
      const data = await res.json();
      message = Array.isArray(data.message) ? data.message.join('; ') : data.message || message;
    } catch {
      message = `Server returned HTTP ${res.status}`;
    }
    throw new Error(message);
  }

  return res.json();
}


