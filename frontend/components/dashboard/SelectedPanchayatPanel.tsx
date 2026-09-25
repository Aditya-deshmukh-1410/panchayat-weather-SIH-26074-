'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  PanchayatFeature,
  FeatureRecordResponse,
  PredictionWithUncertaintyResult,
  AdvisoryRequest,
  AdvisoryResponse,
  ExplainabilityResponse,
} from '../../src/types';
import { fetchAgroAdvisory, fetchExplainability } from '../../src/lib/api';
import AdvisoryCard from './AdvisoryCard';
import ExplainabilityCard from './ExplainabilityCard';
import {
  Mountain,
  MapPin,
  Calendar,
  Sparkles,
  Droplets,
  Thermometer,
  Wind,
  Info,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  Compass,
} from 'lucide-react';

interface SelectedPanchayatPanelProps {
  selectedPanchayat: PanchayatFeature | null;
  featuresData: FeatureRecordResponse | null;
  featuresLoading: boolean;
  featuresError: string | null;
  prediction: PredictionWithUncertaintyResult | null;
  predictionLoading: boolean;
  predictionError: string | null;
  onRunDownscaling: () => void;
  historicalDate: string;
}

export default function SelectedPanchayatPanel({
  selectedPanchayat,
  featuresData,
  featuresLoading,
  featuresError,
  prediction,
  predictionLoading,
  predictionError,
  onRunDownscaling,
  historicalDate,
}: SelectedPanchayatPanelProps) {
  // Collapsible limitations state
  const [showMethodology, setShowMethodology] = useState(false);

  // Phase 6B Advisory state
  const [advisory, setAdvisory] = useState<AdvisoryResponse | null>(null);
  const [advisoryLoading, setAdvisoryLoading] = useState(false);
  const [advisoryError, setAdvisoryError] = useState<string | null>(null);

  // Phase 6C Explainability (SHAP) state
  const [explainability, setExplainability] = useState<ExplainabilityResponse | null>(null);
  const [explainabilityLoading, setExplainabilityLoading] = useState(false);
  const [explainabilityError, setExplainabilityError] = useState<string | null>(null);

  const p = selectedPanchayat?.properties;
  const isDownscaled = !!prediction && prediction.panchayat_id === p?.id;

  // Load advisory when prediction changes
  const loadAdvisory = useCallback(async () => {
    if (!prediction || !p || prediction.panchayat_id !== p.id || !featuresData) {
      setAdvisory(null);
      setAdvisoryError(null);
      setAdvisoryLoading(false);
      return;
    }

    try {
      setAdvisoryLoading(true);
      setAdvisoryError(null);

      const payload: AdvisoryRequest = {
        panchayat_id: prediction.panchayat_id,
        panchayat_name: prediction.panchayat_name || p.name,
        date: prediction.date || featuresData.date || historicalDate,
        rainfall_mm: prediction.prediction_mm,
        lower_80_mm: prediction.lower_bound_80_mm,
        upper_80_mm: prediction.upper_bound_80_mm,
        lower_90_mm: prediction.lower_bound_90_mm,
        upper_90_mm: prediction.upper_bound_90_mm,
        temperature_max: featuresData.features.block_temp_max,
        temperature_min: featuresData.features.block_temp_min,
        humidity: featuresData.features.block_humidity,
        wind_speed: featuresData.features.block_wind_speed,
        model_version: prediction.model_version,
        baseline_block_rainfall: prediction.baseline_block_rainfall,
      };

      const res = await fetchAgroAdvisory(payload);
      setAdvisory(res);
    } catch (err: any) {
      setAdvisoryError(err.message || 'Advisory generation failed.');
      setAdvisory(null);
    } finally {
      setAdvisoryLoading(false);
    }
  }, [prediction, p, featuresData, historicalDate]);

  useEffect(() => {
    if (isDownscaled && prediction && featuresData) {
      loadAdvisory();
    } else {
      setAdvisory(null);
      setAdvisoryError(null);
      setAdvisoryLoading(false);
    }
  }, [isDownscaled, prediction, featuresData, loadAdvisory]);

  // Load global SHAP explainability once
  const loadExplainability = useCallback(async () => {
    try {
      setExplainabilityLoading(true);
      setExplainabilityError(null);
      const data = await fetchExplainability();
      setExplainability(data);
    } catch (err: any) {
      setExplainabilityError(err.message || 'Failed to load model explainability.');
    } finally {
      setExplainabilityLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExplainability();
  }, [loadExplainability]);

  if (!selectedPanchayat || !p) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/90 p-8 shadow-xs text-center flex flex-col items-center justify-center min-h-[420px]">
        <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-3">
          <MapPin className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-900">Select a Gram Panchayat</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
          Click on any of the 14 Panchayat boundaries on the map or use the selector panel to inspect spatial downscaling.
        </p>
      </div>
    );
  }

  // Visual interval bar scaling: max boundary based on upper bound
  const maxScaleMm = Math.max(
    25,
    prediction ? Math.ceil(prediction.upper_bound_90_mm + 5) : 25
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col space-y-4 p-4 sm:p-5">
      {/* =========================================================================
          LEVEL 1: PANCHAYAT IDENTITY + RAINFALL ESTIMATE (PRIMARY FOCAL POINT)
          ========================================================================= */}
      <div className="border-b border-slate-100 pb-4 space-y-3">
        {/* Panchayat Identity Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 uppercase tracking-tight">
                {p.name}
              </h2>
              <span className="px-2 py-0.5 rounded bg-emerald-100/80 text-emerald-800 font-mono text-xs font-bold border border-emerald-300/60">
                {p.id}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center space-x-1.5">
              <span>Baramati Block · Pune</span>
              <span>·</span>
              <span>{p.elevation_m}m elevation</span>
              <span>·</span>
              <span>{p.area_sqkm} km²</span>
            </p>
          </div>

          <div className="text-right flex-shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Experiment Date
            </span>
            <div className="flex items-center space-x-1 mt-0.5 text-slate-700 justify-end">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-mono font-semibold">{historicalDate}</span>
            </div>
          </div>
        </div>

        {/* Level 1 Focal Point: ML Downscaled Rainfall */}
        {predictionLoading ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-center space-y-2 animate-pulse">
            <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-800">
              Calculating downscaled rainfall…
            </p>
            <p className="text-[11px] text-slate-500">
              Inferring localized topoclimatic precipitation from block baseline
            </p>
          </div>
        ) : predictionError ? (
          <div className="bg-red-50/80 border border-red-200 rounded-xl p-4 text-xs text-red-900 space-y-2">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-950">Prediction unavailable</p>
                <p className="text-[11px] text-red-700 mt-0.5 leading-relaxed">
                  The selected Panchayat feature data is available, but the downscaled estimate could not be retrieved.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onRunDownscaling}
              className="text-xs bg-white border border-red-200 hover:bg-red-100 text-red-800 font-medium px-3 py-1.5 rounded-lg flex items-center space-x-1.5 shadow-2xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        ) : isDownscaled && prediction ? (
          <div className="bg-gradient-to-br from-emerald-50/60 via-slate-50 to-blue-50/40 border border-emerald-200/90 rounded-2xl p-4 sm:p-5 relative shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
              <span className="font-bold uppercase tracking-wider text-[11px] text-emerald-900 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>ML Downscaled Rainfall</span>
              </span>
              <span className="px-2 py-0.5 bg-emerald-100/90 text-emerald-800 rounded font-semibold text-[11px] border border-emerald-200">
                {advisory ? advisory.category_label : 'Moderate rainfall'}
              </span>
            </div>

            {/* Massive Focal Value (8.56 mm) */}
            <div className="flex items-baseline space-x-2 my-1">
              <span className="text-4xl sm:text-5xl font-black text-slate-950 font-mono tracking-tight">
                {prediction.prediction_mm.toFixed(2)}
              </span>
              <span className="text-lg font-bold text-slate-600">mm</span>
            </div>

            {/* Spatial Disaggregation Context */}
            <div className="pt-2.5 mt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-600">
              <span>Coarse block input: <strong className="font-mono text-slate-800">{prediction.baseline_block_rainfall.toFixed(2)} mm</strong></span>
              <span className="font-mono font-medium text-emerald-700">
                {prediction.prediction_mm - prediction.baseline_block_rainfall >= 0 ? '+' : ''}
                {(prediction.prediction_mm - prediction.baseline_block_rainfall).toFixed(2)} mm spatial shift
              </span>
            </div>
          </div>
        ) : (
          /* Awaiting user click or auto-run */
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center space-y-3">
            <p className="text-xs text-slate-600">
              17 verified features loaded for <strong>{p.name}</strong>.
            </p>
            <button
              type="button"
              onClick={onRunDownscaling}
              disabled={predictionLoading || featuresLoading}
              className="w-full bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-semibold py-2.5 px-4 rounded-xl text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>Calculate Downscaled Rainfall</span>
            </button>
          </div>
        )}
      </div>

      {/* =========================================================================
          LEVEL 2: PREDICTION INTERVAL (UNCERTAINTY)
          ========================================================================= */}
      {isDownscaled && prediction && (
        <div className="bg-slate-50/90 border border-slate-200/90 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                80% prediction interval
              </h3>
              <p className="text-[11px] text-slate-500">
                Calibrated prediction uncertainty based on validation residuals.
              </p>
            </div>
            <span className="text-[10px] font-mono bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600 font-semibold">
              Split Conformal
            </span>
          </div>

          {/* 80% Prediction Interval Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">80% Interval</span>
              <span className="font-mono font-bold text-slate-900">
                {prediction.lower_bound_80_mm.toFixed(2)} ───────────── {prediction.upper_bound_80_mm.toFixed(2)} mm
              </span>
            </div>

            <div className="relative w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="absolute h-full bg-emerald-600 rounded-full transition-all duration-500"
                style={{
                  left: `${(prediction.lower_bound_80_mm / maxScaleMm) * 100}%`,
                  width: `${(prediction.interval_width_80_mm / maxScaleMm) * 100}%`,
                }}
              />
              {/* Point prediction indicator */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-amber-400 z-10"
                style={{
                  left: `${(prediction.prediction_mm / maxScaleMm) * 100}%`,
                }}
                title={`Point estimate: ${prediction.prediction_mm.toFixed(2)} mm`}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>Lower: {prediction.lower_bound_80_mm.toFixed(2)} mm</span>
              <span>Spread: {prediction.interval_width_80_mm.toFixed(2)} mm</span>
              <span>Upper: {prediction.upper_bound_80_mm.toFixed(2)} mm</span>
            </div>
          </div>

          {/* 90% Prediction Interval Reference */}
          <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-600">
            <span>90% prediction interval:</span>
            <span className="font-mono font-semibold text-slate-800">
              {prediction.lower_bound_90_mm.toFixed(2)} – {prediction.upper_bound_90_mm.toFixed(2)} mm
            </span>
          </div>
        </div>
      )}

      {/* =========================================================================
          LEVEL 2: AGRO-METEOROLOGICAL ADVISORY
          ========================================================================= */}
      <AdvisoryCard
        advisory={advisory}
        loading={advisoryLoading}
        error={advisoryError}
        predictionAvailable={isDownscaled}
        onRetry={loadAdvisory}
      />

      {/* =========================================================================
          LEVEL 3: WEATHER CONTEXT (COMPACT ROW)
          ========================================================================= */}
      {featuresData && (
        <div>
          <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Weather Context (Baramati Block)
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {/* Humidity */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-center space-y-1">
              <div className="flex items-center justify-center space-x-1 text-slate-500">
                <Droplets className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-[10px] font-semibold uppercase">Humidity</span>
              </div>
              <span className="text-sm sm:text-base font-bold text-slate-900 font-mono block">
                {featuresData.features.block_humidity.toFixed(1)}%
              </span>
            </div>

            {/* Max Temperature */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-center space-y-1">
              <div className="flex items-center justify-center space-x-1 text-slate-500">
                <Thermometer className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-[10px] font-semibold uppercase">Max Temp</span>
              </div>
              <span className="text-sm sm:text-base font-bold text-slate-900 font-mono block">
                {featuresData.features.block_temp_max.toFixed(1)}°C
              </span>
            </div>

            {/* Wind Speed */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-center space-y-1">
              <div className="flex items-center justify-center space-x-1 text-slate-500">
                <Wind className="w-3.5 h-3.5 text-teal-600" />
                <span className="text-[10px] font-semibold uppercase">Wind</span>
              </div>
              <span className="text-sm sm:text-base font-bold text-slate-900 font-mono block">
                {featuresData.features.block_wind_speed.toFixed(1)} m/s
              </span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          LEVEL 4: WHY THIS ESTIMATE? (MODEL EXPLANATION / SHAP)
          ========================================================================= */}
      <ExplainabilityCard
        explainability={explainability}
        loading={explainabilityLoading}
        error={explainabilityError}
        predictionAvailable={isDownscaled}
        onRetry={loadExplainability}
      />

      {/* =========================================================================
          LEVEL 5: METHODOLOGY & LIMITATIONS (COLLAPSIBLE TRANSPARENCY)
          ========================================================================= */}
      <div className="border border-slate-200/90 rounded-xl overflow-hidden bg-slate-50/60">
        <button
          type="button"
          onClick={() => setShowMethodology(!showMethodology)}
          className="w-full p-3 text-left flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100/70 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
        >
          <span className="flex items-center space-x-1.5">
            <Info className="w-3.5 h-3.5 text-slate-500" />
            <span>Methodology &amp; limitations</span>
          </span>
          {showMethodology ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>

        {showMethodology && (
          <div className="p-3.5 pt-1 text-[11px] text-slate-600 space-y-2 border-t border-slate-100 bg-white">
            <p>
              <strong>Retrospective Downscaling Experiment:</strong> Evaluation on frozen historical records (2023–2024). Not an official IMD forecast or real-time sensor array.
            </p>
            <p>
              <strong>Proxies &amp; Reference:</strong> Coarse weather features originate from NASA POWER / MERRA-2 (0.5° proxy). Ground-truth target references use ERA5-Land (0.1° reanalysis proxy), not physical rain gauges.
            </p>
            <p>
              <strong>Uncertainty calibration:</strong> Displayed bands are split-conformal prediction intervals, not event probabilities or chances of rain.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
