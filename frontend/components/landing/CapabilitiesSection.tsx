'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  BarChart3,
} from 'lucide-react';
import { useScrollReveal } from '../../src/lib/useScrollReveal';

export default function CapabilitiesSection() {
  const { ref, isVisible, isReducedMotion } = useScrollReveal({ threshold: 0.15 });

  return (
    <section
      ref={ref}
      className="py-16 md:py-24 bg-[#FAF9F5] border-b border-stone-200/80 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header: Minimal OneSoil-style headline with Scroll Reveal */}
        <div
          className={`max-w-3xl mx-auto text-center space-y-3 mb-12 md:mb-16 transition-all duration-700 ease-out ${
            isVisible || isReducedMotion
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-3'
          }`}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight">
            See what&apos;s happening across Panchayats.
          </h2>
          <p
            className={`text-sm sm:text-base text-stone-500 font-normal transition-all duration-700 ease-out delay-75 ${
              isVisible || isReducedMotion
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-3'
            }`}
          >
            Four cohesive intelligence layers delivering localized situational awareness for field operations.
          </p>
        </div>

        {/* 4 Large Visual Cards Grid with Staggered Entrance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* CARD 1: Spatial downscaling */}
          <div
            className={`bg-white border border-stone-200/90 rounded-2xl md:rounded-3xl p-6 sm:p-7 shadow-xs hover:border-stone-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-700 ease-out delay-100 flex flex-col justify-between group ${
              isVisible || isReducedMotion
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  Spatial Resolution
                </span>
                <span className="text-xs text-stone-400 font-mono">14 Polygons</span>
              </div>

              {/* Large Visual Area: Crop of MapLibre Map */}
              <div className="h-56 bg-stone-900 rounded-xl border border-stone-800 p-3 relative overflow-hidden flex flex-col justify-between">
                <svg className="w-full h-full opacity-90" viewBox="0 0 400 220">
                  <polygon
                    points="30,40 120,30 150,110 50,120"
                    fill="#334155"
                    fillOpacity="0.25"
                    stroke="#64748b"
                    strokeWidth="1.2"
                  />
                  <text x="65" y="75" fill="#94a3b8" fontSize="9">Dorlewadi</text>

                  <polygon
                    points="120,30 240,25 260,105 150,110"
                    fill="#334155"
                    fillOpacity="0.25"
                    stroke="#64748b"
                    strokeWidth="1.2"
                  />
                  <text x="175" y="70" fill="#94a3b8" fontSize="9">Katphal</text>

                  {/* Highlighted Selected Polygon */}
                  <polygon
                    points="150,110 260,105 280,195 170,205"
                    fill="#059669"
                    fillOpacity="0.28"
                    stroke="#047857"
                    strokeWidth="3.5"
                  />
                  <text x="185" y="155" fill="#ffffff" fontSize="11" fontWeight="bold">
                    Baburdi (P01)
                  </text>
                  <circle cx="215" cy="155" r="5" fill="#047857" stroke="#ffffff" strokeWidth="2" />

                  <polygon
                    points="240,25 350,45 330,130 260,105"
                    fill="#334155"
                    fillOpacity="0.25"
                    stroke="#64748b"
                    strokeWidth="1.2"
                  />
                  <text x="275" y="75" fill="#94a3b8" fontSize="9">Katewadi</text>
                </svg>

                <div className="flex items-center justify-between text-[10px] text-stone-300 bg-stone-950/80 px-2 py-1 rounded border border-stone-800">
                  <span className="font-semibold text-emerald-400">Emerald Boundary: Active Micro-Region</span>
                  <span className="font-mono">Baramati Block</span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-stone-900">Spatial downscaling</h3>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed font-normal">
                  See localized rainfall estimates across Panchayat boundaries.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="text-stone-400 text-[11px]">MapLibre Vector Engine</span>
              <Link href="/dashboard" className="text-emerald-700 font-semibold hover:underline flex items-center space-x-1">
                <span>View Map →</span>
              </Link>
            </div>
          </div>

          {/* CARD 2: Rainfall + uncertainty */}
          <div
            className={`bg-white border border-stone-200/90 rounded-2xl md:rounded-3xl p-6 sm:p-7 shadow-xs hover:border-stone-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-700 ease-out delay-180 flex flex-col justify-between group ${
              isVisible || isReducedMotion
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                  Uncertainty Range
                </span>
                <span className="text-xs text-stone-400 font-mono">Split-Conformal</span>
              </div>

              {/* Large Visual Area: Rainfall Estimate + Prediction Interval UI */}
              <div className="h-56 bg-stone-50 rounded-xl border border-stone-200/70 p-5 flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-500 block">
                      ML Downscaled Rainfall (Baburdi)
                    </span>
                    <div className="flex items-baseline space-x-2 mt-1">
                      <span className="text-4xl font-black font-mono text-stone-900 tracking-tight">8.56</span>
                      <span className="text-sm font-semibold text-stone-600">mm</span>
                      <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        Moderate
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-xs text-stone-500 bg-white border border-stone-200 px-2 py-1 rounded">
                    Shift: +2.94 mm
                  </span>
                </div>

                {/* Interval Bar Visual */}
                <div className="bg-white p-3 rounded-lg border border-stone-200 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-stone-700">80% prediction interval</span>
                    <span className="font-mono font-bold text-stone-900">0.40 – 16.73 mm</span>
                  </div>
                  <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden relative border border-stone-200">
                    <div className="absolute left-[3%] w-[54%] h-full bg-emerald-600 rounded-full" />
                  </div>
                  <div className="flex justify-between text-[10px] text-stone-400 font-mono">
                    <span>90% interval: 0.00 – 21.88 mm</span>
                    <span>16.34 mm width</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-stone-900">Rainfall + uncertainty</h3>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed font-normal">
                  Understand both the estimate and calibrated prediction uncertainty.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="text-stone-400 text-[11px]">Empirical Validation Residuals</span>
              <Link href="/dashboard" className="text-blue-700 font-semibold hover:underline flex items-center space-x-1">
                <span>Inspect Intervals →</span>
              </Link>
            </div>
          </div>

          {/* CARD 3: Agro-meteorological advisory */}
          <div
            className={`bg-white border border-stone-200/90 rounded-2xl md:rounded-3xl p-6 sm:p-7 shadow-xs hover:border-stone-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-700 ease-out delay-260 flex flex-col justify-between group ${
              isVisible || isReducedMotion
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-300 px-2.5 py-0.5 rounded-full">
                  Field Guidance
                </span>
                <span className="text-xs text-stone-400 font-mono">Deterministic Rules</span>
              </div>

              {/* Large Visual Area: Authentic AdvisoryCard UI */}
              <div className="h-56 bg-stone-50 rounded-xl border border-stone-200/70 p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                  <div className="flex items-center space-x-2">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold text-stone-900">Agro-Meteorological Advisory</span>
                  </div>
                  <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-300 font-bold px-2 py-0.5 rounded-full">
                    WATCH
                  </span>
                </div>

                <div className="space-y-2 py-1">
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span className="font-semibold text-stone-800">Signal: Moderate rainfall detected</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Postpone chemical spraying operations until field moisture stabilizes. Clear drainage channels to prevent water stagnation in low-lying plots.
                  </p>
                </div>

                <div className="bg-white px-3 py-1.5 rounded-md border border-stone-200 flex items-center justify-between text-[11px] text-stone-500 font-mono">
                  <span>Soil Moisture: High (90.6%)</span>
                  <span>Rule Engine: 100% Deterministic</span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-stone-900">Agro-meteorological advisory</h3>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed font-normal">
                  Turn rainfall estimates into practical field guidance.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="text-stone-400 text-[11px]">Actionable Agronomic Windows</span>
              <Link href="/dashboard" className="text-amber-700 font-semibold hover:underline flex items-center space-x-1">
                <span>See Advisories →</span>
              </Link>
            </div>
          </div>

          {/* CARD 4: Model explainability */}
          <div
            className={`bg-white border border-stone-200/90 rounded-2xl md:rounded-3xl p-6 sm:p-7 shadow-xs hover:border-stone-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-700 ease-out delay-340 flex flex-col justify-between group ${
              isVisible || isReducedMotion
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                  Transparency
                </span>
                <span className="text-xs text-stone-400 font-mono">TreeSHAP Values</span>
              </div>

              {/* Large Visual Area: Actual SHAP Explanation UI */}
              <div className="h-56 bg-stone-50 rounded-xl border border-stone-200/70 p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-stone-900">Global Feature Attribution</span>
                  </div>
                  <span className="text-[10px] font-mono text-stone-500">Mean |SHAP|</span>
                </div>

                {/* 3 Prominent Feature Bars */}
                <div className="space-y-2.5">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="font-semibold text-stone-800">Block rainfall baseline</span>
                      <span className="font-mono font-bold text-indigo-900">+1.56</span>
                    </div>
                    <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                      <div className="w-[85%] h-full bg-indigo-600 rounded-full" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="font-semibold text-stone-800">Block humidity</span>
                      <span className="font-mono font-bold text-indigo-900">+1.08</span>
                    </div>
                    <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                      <div className="w-[62%] h-full bg-indigo-500 rounded-full" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="font-semibold text-stone-800">Previous-day rainfall (lag 1d)</span>
                      <span className="font-mono font-bold text-indigo-900">+0.74</span>
                    </div>
                    <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                      <div className="w-[42%] h-full bg-indigo-400 rounded-full" />
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-stone-400 italic">
                  * Model attribution within XGBoost; not physical causality.
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-stone-900">Model explainability</h3>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed font-normal">
                  Understand which features contribute most to model predictions.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="text-stone-400 text-[11px]">17 Spatial + Temporal Signals</span>
              <Link href="/dashboard" className="text-indigo-700 font-semibold hover:underline flex items-center space-x-1">
                <span>Inspect Attributions →</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
