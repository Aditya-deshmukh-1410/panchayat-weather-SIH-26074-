'use client';

import React from 'react';
import { Grid, Cpu, MapPin } from 'lucide-react';
import { useScrollReveal } from '../../src/lib/useScrollReveal';

export default function TransformationSection() {
  const { ref, isVisible, isReducedMotion } = useScrollReveal({ threshold: 0.15 });

  return (
    <section
      ref={ref}
      className="py-16 md:py-24 bg-[#FAF9F5] border-b border-stone-200/80 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header: Minimal & Punchy with Scroll Reveal */}
        <div
          className={`max-w-3xl mx-auto text-center space-y-3 mb-12 md:mb-16 transition-all duration-700 ease-out ${
            isVisible || isReducedMotion
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-3'
          }`}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight">
            From coarse weather data to local intelligence.
          </h2>
          <p
            className={`text-sm sm:text-base text-stone-500 font-normal transition-all duration-700 ease-out delay-75 ${
              isVisible || isReducedMotion
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-3'
            }`}
          >
            Three-stage spatial disaggregation pipeline bridging global reanalysis and local farm management.
          </p>
        </div>

        {/* 3 Large Visual Cards in Horizontal Flow with Staggered Entrance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {/* Card 1: Coarse Input */}
          <div
            className={`bg-white border border-stone-200/90 rounded-2xl md:rounded-3xl p-6 sm:p-7 shadow-xs hover:border-stone-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-700 ease-out delay-100 flex flex-col justify-between group ${
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
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  Coarse Input
                </span>
              </div>

              {/* Visual Area */}
              <div className="h-36 bg-stone-50 rounded-xl border border-stone-200/70 p-4 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-stone-200/40 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center space-x-2 text-stone-600">
                  <Grid className="w-4 h-4 text-stone-500" />
                  <span className="text-xs font-semibold text-stone-700">~50 km Regional Grid</span>
                </div>
                <div>
                  <span className="text-2xl font-black font-mono text-stone-900">5.62 mm</span>
                  <span className="text-xs text-stone-500 block mt-0.5">Uniform block-scale baseline</span>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-stone-900">NASA POWER / MERRA-2</h3>
                <p className="text-xs text-stone-600 leading-relaxed font-normal">
                  Satellite and assimilation reanalysis proxy at ~0.5° resolution (~50 km). Too coarse for field-level agricultural decisions.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-stone-100 flex items-center text-[11px] text-stone-400 font-medium">
              <span>Coarse Input Baseline</span>
            </div>
          </div>

          {/* Card 2: ML Downscaling */}
          <div
            className={`bg-white border border-stone-200/90 rounded-2xl md:rounded-3xl p-6 sm:p-7 shadow-xs hover:border-stone-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-700 ease-out delay-180 flex flex-col justify-between group relative ${
              isVisible || isReducedMotion
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                  02
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  ML Downscaling
                </span>
              </div>

              {/* Visual Area */}
              <div className="h-36 bg-emerald-50/60 rounded-xl border border-emerald-200/70 p-4 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-300/30 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center space-x-2 text-emerald-800">
                  <Cpu className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-semibold">Gradient Boosted Trees</span>
                </div>
                <div>
                  <span className="text-2xl font-black font-mono text-emerald-950">17 Features</span>
                  <span className="text-xs text-emerald-800/80 block mt-0.5">Topography, distance &amp; dynamics</span>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-stone-900">XGBoost Regressor</h3>
                <p className="text-xs text-stone-600 leading-relaxed font-normal">
                  Combines elevation (532–612 m), distance to block center, rolling 7-day stats, and multi-day lags to infer spatial microclimate.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-stone-100 flex items-center text-[11px] text-emerald-700 font-medium">
              <span>Calibrated via Split-Conformal Residuals</span>
            </div>
          </div>

          {/* Card 3: Panchayat Estimate */}
          <div
            className={`bg-white border border-stone-200/90 rounded-2xl md:rounded-3xl p-6 sm:p-7 shadow-xs hover:border-stone-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-700 ease-out delay-260 flex flex-col justify-between group ${
              isVisible || isReducedMotion
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md">
                  03
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                  Panchayat Estimate
                </span>
              </div>

              {/* Visual Area */}
              <div className="h-36 bg-blue-50/60 rounded-xl border border-blue-200/70 p-4 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-300/30 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center space-x-2 text-blue-800">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-semibold">14 Gram Panchayats</span>
                </div>
                <div>
                  <span className="text-2xl font-black font-mono text-blue-950">8.56 mm</span>
                  <span className="text-xs text-blue-800/80 block mt-0.5">
                    Spatial shift: +2.94 mm vs block
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-stone-900">Localized Rainfall</h3>
                <p className="text-xs text-stone-600 leading-relaxed font-normal">
                  High-resolution estimates paired with 80% and 90% uncertainty intervals to trigger calibrated field advisories.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-stone-100 flex items-center text-[11px] text-blue-700 font-medium">
              <span>Operational Agro-Advisory Guidance</span>
            </div>
          </div>
        </div>

        {/* Tiny Scientific Note with Entrance Reveal */}
        <div
          className={`mt-8 text-center transition-all duration-700 ease-out delay-350 ${
            isVisible || isReducedMotion
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-2'
          }`}
        >
          <p className="text-xs text-stone-400 italic">
            * Historical experiment using ERA5-Land (~0.1° reanalysis) as the reference proxy.
          </p>
        </div>
      </div>
    </section>
  );
}
