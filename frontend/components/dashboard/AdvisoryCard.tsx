'use client';

import React from 'react';
import { AdvisoryResponse, AdvisorySeverity } from '../../src/types';
import {
  Wheat,
  ShieldAlert,
  Info,
  AlertTriangle,
  CheckCircle2,
  Droplets,
  RotateCcw,
} from 'lucide-react';

interface AdvisoryCardProps {
  advisory: AdvisoryResponse | null;
  loading: boolean;
  error: string | null;
  predictionAvailable: boolean;
  onRetry?: () => void;
}

export default function AdvisoryCard({
  advisory,
  loading,
  error,
  predictionAvailable,
  onRetry,
}: AdvisoryCardProps) {
  // State 1: Prediction has not been run yet
  if (!predictionAvailable) {
    return (
      <div className="bg-slate-50/80 border border-dashed border-slate-300 rounded-xl p-4 text-center">
        <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto mb-2">
          <Wheat className="w-4 h-4" />
        </div>
        <h4 className="text-xs font-semibold text-slate-700">Agro-Advisory Awaiting Prediction</h4>
        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
          Execute ML downscaling to generate localized agro-meteorological advisory.
        </p>
      </div>
    );
  }

  // State 2: Advisory is loading (Compact skeleton)
  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-2.5 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-4 w-32 bg-slate-200 rounded" />
          <div className="h-5 w-16 bg-slate-200 rounded-full" />
        </div>
        <div className="h-4 w-48 bg-slate-200 rounded" />
        <div className="space-y-1.5 pt-1">
          <div className="h-3 w-full bg-slate-100 rounded" />
          <div className="h-3 w-5/6 bg-slate-100 rounded" />
        </div>
        <div className="flex items-center space-x-2 text-[11px] text-slate-400 pt-1">
          <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span>Evaluating deterministic agro-advisory rules...</span>
        </div>
      </div>
    );
  }

  // State 3: Advisory request failed (isolated from prediction UI)
  if (error || !advisory) {
    return (
      <div className="bg-red-50/80 border border-red-200 rounded-xl p-3.5 text-xs text-red-900">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-950">Advisory unavailable</p>
              <p className="text-[11px] text-red-700 mt-0.5">
                The rainfall estimate is still available.
              </p>
              {error && <p className="text-[10px] text-red-600 mt-0.5 font-mono">{error}</p>}
            </div>
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="text-[11px] bg-white border border-red-200 hover:bg-red-100 text-red-800 font-medium px-2.5 py-1 rounded-md flex items-center space-x-1 shadow-2xs transition-colors flex-shrink-0"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // State 4: Advisory successfully loaded
  // Restrained semantic palette: INFO (neutral/blue), WATCH (amber), CAUTION (red)
  const severityConfig: Record<
    AdvisorySeverity,
    { badgeBg: string; text: string; icon: React.ReactNode }
  > = {
    INFO: {
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
      text: 'INFO',
      icon: <Info className="w-3 h-3 text-blue-600" />,
    },
    WATCH: {
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-300',
      text: 'WATCH',
      icon: <ShieldAlert className="w-3 h-3 text-amber-600" />,
    },
    CAUTION: {
      badgeBg: 'bg-rose-50 text-rose-800 border-rose-300',
      text: 'CAUTION',
      icon: <AlertTriangle className="w-3 h-3 text-rose-600" />,
    },
  };

  const currentSeverity = severityConfig[advisory.severity] || severityConfig.INFO;

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs space-y-3">
      {/* Top Header: Severity & Headline */}
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
        <div className="space-y-0.5">
          <div className="flex items-center space-x-1.5">
            <span className="p-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Wheat className="w-3.5 h-3.5" />
            </span>
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Advisory
            </span>
          </div>
          <h4 className="text-sm font-bold text-slate-900 leading-snug">
            {advisory.headline}
          </h4>
        </div>

        {/* Severity Badge */}
        <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
          <span
            className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${currentSeverity.badgeBg}`}
          >
            {currentSeverity.icon}
            <span>{advisory.severity}</span>
          </span>
          <span className="text-[10px] font-mono font-medium text-slate-500 uppercase">
            {advisory.category_label}
          </span>
        </div>
      </div>

      {/* Uncertainty Span Note (Surfaced clearly when uncertainty spans multiple rainfall categories) */}
      {advisory.uncertainty?.spans_multiple_categories && (
        <div className="bg-amber-50/90 border border-amber-200 rounded-lg p-2.5 text-xs text-amber-900 flex items-start space-x-2">
          <Info className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-0.5 leading-relaxed">
            <span className="font-semibold block text-[11px] text-amber-950">
              Estimate spans multiple rainfall categories.
            </span>
            <p className="text-[11px] text-amber-900">
              {advisory.uncertainty.uncertainty_note ||
                'The calibrated 80% prediction interval spans multiple categories. Management decisions should account for this spread.'}
            </p>
          </div>
        </div>
      )}

      {/* Recommendations List (Deterministic rule-based outputs from API) */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
          Actionable Recommendations
        </span>
        <ul className="space-y-1.5">
          {advisory.recommendations.map((rec, index) => (
            <li
              key={index}
              className="text-xs text-slate-700 flex items-start space-x-2 bg-slate-50/70 p-2 rounded-lg border border-slate-200/60"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <span className="leading-relaxed">{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Ancillary Notices (e.g. High Humidity) */}
      {advisory.ancillary_notices && advisory.ancillary_notices.length > 0 && (
        <div className="space-y-1 pt-1">
          {advisory.ancillary_notices.map((notice, index) => (
            <div
              key={index}
              className="bg-blue-50/60 border border-blue-200/70 rounded-lg p-2 text-xs text-blue-900 flex items-start space-x-2"
            >
              <Droplets className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
              <span className="text-[11px] leading-relaxed">{notice}</span>
            </div>
          ))}
        </div>
      )}

      {/* Decision Support Disclaimer */}
      <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 leading-tight">
        <span>Decision-support guidance from deterministic agro-meteorological rule engine.</span>
      </div>
    </div>
  );
}
