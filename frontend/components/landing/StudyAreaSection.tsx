'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, ArrowRight, Layers, Compass } from 'lucide-react';
import { useScrollReveal } from '../../src/lib/useScrollReveal';

export default function StudyAreaSection() {
  const { ref, isVisible, isReducedMotion } = useScrollReveal({ threshold: 0.15 });

  const panchayats = [
    { id: 'P01', name: 'Baburdi', elev: 598, area: 13.56 },
    { id: 'P02', name: 'Dorlewadi', elev: 548, area: 18.42 },
    { id: 'P03', name: 'Gojubavi', elev: 562, area: 16.10 },
    { id: 'P04', name: 'Gunwadi', elev: 549, area: 11.23 },
    { id: 'P05', name: 'Hol', elev: 544, area: 8.53 },
    { id: 'P06', name: 'Katewadi', elev: 543, area: 15.34 },
    { id: 'P07', name: 'Katphal', elev: 575, area: 20.82 },
    { id: 'P08', name: 'Khandaj', elev: 562, area: 14.15 },
    { id: 'P09', name: 'Korhale Bk', elev: 574, area: 17.52 },
    { id: 'P10', name: 'Malegaon Bk', elev: 538, area: 21.05 },
    { id: 'P11', name: 'Rui', elev: 547, area: 10.89 },
    { id: 'P12', name: 'Shirsuphal', elev: 601, area: 19.42 },
    { id: 'P13', name: 'Songaon', elev: 532, area: 12.67 },
    { id: 'P14', name: 'Vadgaon Nimbalkar', elev: 569, area: 16.84 },
  ];

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
            <span>Spatial Evaluation Scope</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight">
            Demonstrated across Baramati Block.
          </h2>
          <p
            className={`text-sm sm:text-base text-stone-500 font-normal transition-all duration-700 ease-out delay-75 ${
              isVisible || isReducedMotion
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-3'
            }`}
          >
            14 contiguous Gram Panchayats exhibiting microclimatic elevation gradients and varying distances to block center.
          </p>
        </div>

        {/* Geographic Breadcrumbs / Scope Metrics with Entrance Reveal */}
        <div
          className={`flex flex-wrap items-center justify-center gap-3 sm:gap-6 mb-10 text-xs font-semibold text-stone-700 transition-all duration-700 ease-out delay-100 ${
            isVisible || isReducedMotion
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-3'
          }`}
        >
          <span className="inline-flex items-center space-x-2 bg-white border border-stone-200/90 px-4 py-2 rounded-xl shadow-2xs">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>Baramati Block · Pune · Maharashtra</span>
          </span>
          <span className="inline-flex items-center space-x-2 bg-white border border-stone-200/90 px-4 py-2 rounded-xl shadow-2xs">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>14 Gram Panchayats</span>
          </span>
          <span className="inline-flex items-center space-x-2 bg-white border border-stone-200/90 px-4 py-2 rounded-xl shadow-2xs">
            <Compass className="w-3.5 h-3.5 text-amber-600" />
            <span>2023–2024 Historical Experiment</span>
          </span>
        </div>

        {/* 14 Micro-Region Cards Grid with Restrained Fast Stagger (~35ms per card) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 max-w-6xl mx-auto">
          {panchayats.map((p, idx) => (
            <div
              key={p.id}
              style={{
                transitionDelay: isReducedMotion ? '0ms' : `${150 + idx * 35}ms`,
              }}
              className={`bg-white border border-stone-200/90 rounded-xl p-3.5 hover:border-emerald-600 hover:shadow-xs hover:-translate-y-0.5 transition-all duration-500 ease-out text-left space-y-1 group ${
                isVisible || isReducedMotion
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-3'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 font-mono text-[10px] font-bold group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors">
                  {p.id}
                </span>
                <span className="text-[10px] text-stone-400 font-mono">{p.elev}m</span>
              </div>
              <h3 className="text-xs font-bold text-stone-900 truncate group-hover:text-emerald-800 transition-colors">
                {p.name}
              </h3>
              <p className="text-[10px] text-stone-500">{p.area} km²</p>
            </div>
          ))}
        </div>

        {/* Map CTA with Entrance Reveal */}
        <div
          className={`mt-10 text-center transition-all duration-700 ease-out delay-500 ${
            isVisible || isReducedMotion
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-2'
          }`}
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center space-x-2 text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 border border-emerald-200/90 hover:bg-emerald-100 px-5 py-2.5 rounded-xl transition-all shadow-2xs"
          >
            <span>Explore All 14 Boundaries on MapLibre Canvas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
