'use client';

import React from 'react';
import { ExplainabilityResponse } from '../../src/types';
import { BarChart3, Info, AlertTriangle, RotateCcw } from 'lucide-react';

interface ExplainabilityCardProps {
  explainability: ExplainabilityResponse | null;
  loading: boolean;
  error: string | null;
  predictionAvailable: boolean;
  onRetry?: () => void;
}

export default function ExplainabilityCard({
  explainability,
  loading,
  error,
  predictionAvailable,
  onRetry,
}: ExplainabilityCardProps) {
  // State 1: Prediction has not been run yet
  if (!predictionAvailable) {
    return (
      <div className="bg-slate-50/80 border border-dashed border-slate-300 rounded-xl p-4 text-center">
        <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto mb-2">
          <BarChart3 className="w-4 h-4" />
        </div>
        <h4 className="text-xs font-semibold text-slate-700">Why does the model use these features?</h4>
        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
          Execute ML downscaling to inspect global model-level SHAP importance.
        </p>
      </div>
    );
  }

  // State 2: Loading State with 5 horizontal skeleton bars as requested
  if (loading) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs space-y-3 animate-pulse">
        <div className="space-y-1">
          <div className="h-4 w-44 bg-slate-200 rounded" />
          <div className="h-3 w-52 bg-slate-100 rounded" />
        </div>
        <div className="space-y-2.5 pt-2">
          {[1, 2, 3, 4, 5].map((idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between">
                <div className="h-3 w-28 bg-slate-200 rounded" />
                <div className="h-3 w-10 bg-slate-200 rounded" />
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full" />
            </div>
          ))}
        </div>
        <p className="text-[10px] text-slate-400 italic pt-1">
          Loading global model-level SHAP feature contributions...
        </p>
      </div>
    );
  }

  // State 3: Explainability error (Isolated failure handling)
  if (error || !explainability) {
    return (
      <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-amber-950">Model explanation unavailable</p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                The rainfall estimate is still available.
              </p>
            </div>
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="text-[11px] bg-white border border-amber-200 hover:bg-amber-100 text-amber-900 font-medium px-2.5 py-1 rounded-md flex items-center space-x-1 shadow-2xs transition-colors flex-shrink-0"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // State 4: Render top 5 global SHAP features with horizontal bars
  const topFeatures = explainability.features.slice(0, 5);
  const maxShap = topFeatures[0]?.mean_abs_shap || 1.56;

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs space-y-3.5">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
        <div className="space-y-0.5">
          <div className="flex items-center space-x-1.5">
            <span className="p-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
              <BarChart3 className="w-3.5 h-3.5" />
            </span>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Why does the model use these features?
            </h4>
          </div>
          <p className="text-[11px] font-medium text-slate-500">
            Global model-level SHAP importance
          </p>
        </div>

        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-semibold border border-slate-200 flex-shrink-0">
          Model {explainability.model_version}
        </span>
      </div>

      {/* Top 5 Feature Importance List (Horizontal Bars) */}
      <div className="space-y-2.5">
        {topFeatures.map((feat, index) => {
          const widthPercent = Math.max(8, Math.min(100, (feat.mean_abs_shap / maxShap) * 100));

          return (
            <div key={feat.feature} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-800 flex items-center space-x-1.5">
                  <span className="text-[10px] font-mono text-slate-400">#{index + 1}</span>
                  <span>{feat.label}</span>
                </span>
                <span className="font-mono font-bold text-slate-900 text-xs">
                  {feat.mean_abs_shap.toFixed(2)}
                </span>
              </div>

              {/* Horizontal Bar */}
              <div className="relative w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full transition-all duration-500"
                  style={{ width: `${widthPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Scientifically Accurate Attribution Guidance */}
      <div className="pt-2 border-t border-slate-100 space-y-1 text-[10px] text-slate-500 leading-tight">
        <div className="flex items-start space-x-1.5 text-slate-600">
          <Info className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
          <p>
            <strong>Mean |SHAP|</strong> summarizes feature contribution magnitude across the evaluated dataset.
          </p>
        </div>
        <p className="text-[10px] text-slate-400 pl-5">
          SHAP values describe how features contributed to model predictions. They are model attributions, not causal evidence.
        </p>
      </div>
    </div>
  );
}
