'use client';

import React from 'react';
import { ShieldCheck, BarChart2, BookOpen } from 'lucide-react';
import { useScrollReveal } from '../../src/lib/useScrollReveal';

export default function ResponsibleSection() {
  const { ref, isVisible, isReducedMotion } = useScrollReveal({ threshold: 0.15 });

  return (
    <section
      ref={ref}
      className="py-16 md:py-24 bg-[#FAF9F5] border-b border-stone-200/80 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Scroll Reveal */}
        <div
          className={`max-w-3xl mx-auto text-center space-y-3 mb-12 md:mb-16 transition-all duration-700 ease-out ${
            isVisible || isReducedMotion
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-3'
          }`}
        >
          <div className="inline-flex items-center space-x-2 bg-stone-100 border border-stone-200/90 px-3.5 py-1 rounded-full text-xs font-semibold text-stone-700">
            <span>Governance &amp; Transparency</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight">
            Built for decisions — not false certainty.
          </h2>
          <p
            className={`text-sm sm:text-base text-stone-500 font-normal transition-all duration-700 ease-out delay-75 ${
              isVisible || isReducedMotion
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-3'
            }`}
          >
            Calibrated boundaries and open limitations prevent overconfident field interventions.
          </p>
        </div>

        {/* 3 Compact Visual Cards with Staggered Entrance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {/* Card 1: Prediction Uncertainty */}
          <div
            className={`bg-white border border-stone-200/90 rounded-2xl md:rounded-3xl p-6 sm:p-7 shadow-xs hover:border-stone-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-700 ease-out delay-100 flex flex-col justify-between ${
              isVisible || isReducedMotion
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-stone-400 bg-stone-100 px-2.5 py-1 rounded-md">
                  01
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  Prediction Uncertainty
                </span>
              </div>

              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <ShieldCheck className="w-5 h-5" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-stone-900 leading-snug">
                  80% and 90% calibrated prediction intervals
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed font-normal">
                  Split-conformal prediction provides empirical coverage guarantees derived from validation residuals rather than assumptions of Gaussian normality.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-stone-100">
              <p className="text-[11px] text-stone-500 italic bg-stone-50 p-2 rounded-lg border border-stone-100">
                * Intervals represent prediction uncertainty, not event probabilities.
              </p>
            </div>
          </div>

          {/* Card 2: Model Explainability */}
          <div
            className={`bg-white border border-stone-200/90 rounded-2xl md:rounded-3xl p-6 sm:p-7 shadow-xs hover:border-stone-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-700 ease-out delay-180 flex flex-col justify-between ${
              isVisible || isReducedMotion
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-stone-400 bg-stone-100 px-2.5 py-1 rounded-md">
                  02
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
                  Model Explainability
                </span>
              </div>

              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
                <BarChart2 className="w-5 h-5" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-stone-900 leading-snug">
                  Global SHAP importance
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed font-normal">
                  TreeSHAP attribution quantifies the contribution of baseline block rainfall, humidity, elevation, and multi-day lags to each estimate.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-stone-100">
              <p className="text-[11px] text-stone-500 italic bg-stone-50 p-2 rounded-lg border border-stone-100">
                * Model attribution within XGBoost, not causal evidence.
              </p>
            </div>
          </div>

          {/* Card 3: Scientific Transparency */}
          <div
            className={`bg-white border border-stone-200/90 rounded-2xl md:rounded-3xl p-6 sm:p-7 shadow-xs hover:border-stone-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-700 ease-out delay-260 flex flex-col justify-between ${
              isVisible || isReducedMotion
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-stone-400 bg-stone-100 px-2.5 py-1 rounded-md">
                  03
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                  Scientific Transparency
                </span>
              </div>

              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                <BookOpen className="w-5 h-5" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-stone-900 leading-snug">
                  Historical downscaling experiment
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed font-normal">
                  All models and metrics are evaluated across historical 2023–2024 held-out partitions. Not an operational forecast service.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-stone-100">
              <p className="text-[11px] text-stone-500 italic bg-stone-50 p-2 rounded-lg border border-stone-100">
                * ERA5-Land is used as a reference proxy, not physical rain-gauge ground truth.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
