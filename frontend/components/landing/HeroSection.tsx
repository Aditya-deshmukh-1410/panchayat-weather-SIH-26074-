'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CloudRain,
  MapPin,
} from 'lucide-react';
import { useScrollReveal } from '../../src/lib/useScrollReveal';

export default function HeroSection() {
  const { ref, isVisible, isReducedMotion } = useScrollReveal({ triggerImmediately: true });

  return (
    <section
      ref={ref}
      className="relative pt-12 pb-16 md:pt-20 md:pb-24 bg-[#FAF9F5] border-b border-stone-200/80 overflow-hidden"
    >
      {/* Subtle Background Pattern */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#1c1917 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Header: Centered, Minimal, High-Impact with Staggered Entrance */}
        <div className="max-w-3xl mx-auto text-center space-y-5">
          {/* Subtle Project Pill */}
          <div
            className={`inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-200/80 px-3.5 py-1 rounded-full text-xs font-semibold text-emerald-800 shadow-2xs transition-all duration-700 ease-out ${
              isVisible || isReducedMotion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>Smart India Hackathon 2026 Prototype</span>
          </div>

          {/* Headline */}
          <h1
            className={`text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-stone-900 leading-[1.12] transition-all duration-700 ease-out delay-75 ${
              isVisible || isReducedMotion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            }`}
          >
            Weather Intelligence <br className="hidden sm:inline" />
            <span className="text-emerald-700">at Panchayat Level.</span>
          </h1>

          {/* Short Supporting Copy */}
          <p
            className={`text-base sm:text-lg text-stone-600 max-w-2xl mx-auto font-normal leading-relaxed transition-all duration-700 ease-out delay-150 ${
              isVisible || isReducedMotion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            }`}
          >
            Downscale coarse weather data into localized rainfall estimates, calibrated uncertainty,
            and agro-meteorological insights.
          </p>

          {/* Primary CTA Button */}
          <div
            className={`pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 transition-all duration-700 ease-out delay-200 ${
              isVisible || isReducedMotion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            }`}
          >
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold px-8 py-3.5 rounded-xl shadow-md shadow-emerald-900/10 hover:shadow-lg transition-all text-sm group"
            >
              <span>Explore Dashboard</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Secondary Subtle Text */}
          <p
            className={`text-xs text-stone-400 font-medium tracking-wide transition-all duration-700 ease-out delay-250 ${
              isVisible || isReducedMotion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
          >
            Retrospective Downscaling Experiment · Baramati Block · Pune
          </p>
        </div>

        {/* MOST IMPORTANT: LARGE AUTHENTIC PRODUCT VISUAL WITH SCALE & TRANSLATE REVEAL */}
        <div
          className={`mt-12 md:mt-16 max-w-6xl mx-auto transition-all duration-800 ease-out delay-300 ${
            isVisible || isReducedMotion
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-4 scale-[0.98]'
          }`}
        >
          {/* Browser / Application Frame */}
          <div className="bg-stone-900 rounded-2xl md:rounded-3xl p-2 sm:p-3 md:p-5 shadow-2xl border border-stone-800 transition-all">
            {/* Top Bar Window Chrome */}
            <div className="flex items-center justify-between pb-3 px-2 border-b border-stone-800 text-xs text-stone-400">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="font-mono text-[11px] text-stone-400 pl-3 hidden sm:inline">
                  panchayat-weather-intelligence / dashboard
                </span>
              </div>
              <div className="flex items-center space-x-3 text-[11px]">
                <span className="font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded">
                  2024-09-01 Held-Out Test Date
                </span>
                <Link
                  href="/dashboard"
                  className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center space-x-1"
                >
                  <span>Open Live →</span>
                </Link>
              </div>
            </div>

            {/* Embedded Live Dashboard Layout (Authentic 3-Pane Simulation) */}
            <div className="bg-[#f8fafc] rounded-xl md:rounded-2xl p-3 sm:p-4 mt-3 text-stone-800 font-sans shadow-inner space-y-3">
              {/* Dashboard Sub-Header */}
              <div className="bg-white border border-stone-200/90 rounded-xl p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2 shadow-2xs">
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-semibold text-stone-600 bg-stone-100 border border-stone-200 px-2.5 py-1 rounded-lg">
                    ← Overview
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-700 flex items-center justify-center text-white shadow-2xs">
                      <CloudRain className="w-4 h-4 text-emerald-100" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-stone-900 leading-none">
                        Panchayat Weather Intelligence
                      </h2>
                      <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                        Retrospective Downscaling Experiment
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="bg-stone-50 border border-stone-200 px-2 py-0.5 rounded text-stone-700 font-medium flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-emerald-600" />
                    <span>Baramati Block · Pune</span>
                  </span>
                  <span className="bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-emerald-800 font-semibold">
                    14 Gram Panchayats
                  </span>
                </div>
              </div>

              {/* 3-Pane Main Product Interface */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
                {/* Left Pane: 14 Panchayats Selector (3 cols) */}
                <div className="hidden lg:block lg:col-span-3 bg-white rounded-xl border border-stone-200/90 shadow-2xs overflow-hidden">
                  <div className="p-2.5 bg-stone-50 border-b border-stone-100 flex items-center justify-between text-xs font-bold text-stone-800">
                    <span className="flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600" />
                      <span>Panchayats</span>
                    </span>
                    <span className="text-[10px] text-stone-500 font-semibold bg-white border border-stone-200 px-1.5 py-0.2 rounded-full">
                      14 locations
                    </span>
                  </div>
                  <div className="divide-y divide-stone-100 text-xs max-h-[380px] overflow-hidden">
                    {/* Active Selected: Baburdi */}
                    <div className="p-2.5 bg-emerald-50/90 border-l-4 border-emerald-700 flex items-center justify-between font-semibold text-emerald-950">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[9px] font-mono bg-emerald-700 text-white px-1 rounded font-bold">
                            P01
                          </span>
                          <span>Baburdi</span>
                        </div>
                        <span className="text-[10px] text-stone-500 block font-normal mt-0.5">
                          598m · 13.56 km²
                        </span>
                      </div>
                      <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 rounded">
                        8.56 mm
                      </span>
                    </div>

                    {/* Hol */}
                    <div className="p-2.5 hover:bg-stone-50 flex items-center justify-between text-stone-700">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[9px] font-mono bg-stone-100 text-stone-600 px-1 rounded">
                            P05
                          </span>
                          <span>Hol</span>
                        </div>
                        <span className="text-[10px] text-stone-400 block font-normal mt-0.5">
                          544m · 8.53 km²
                        </span>
                      </div>
                      <span className="font-mono text-xs text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded">
                        7.12 mm
                      </span>
                    </div>

                    {/* Katewadi */}
                    <div className="p-2.5 hover:bg-stone-50 flex items-center justify-between text-stone-700">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[9px] font-mono bg-stone-100 text-stone-600 px-1 rounded">
                            P06
                          </span>
                          <span>Katewadi</span>
                        </div>
                        <span className="text-[10px] text-stone-400 block font-normal mt-0.5">
                          543m · 15.34 km²
                        </span>
                      </div>
                      <span className="font-mono text-xs text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded">
                        9.04 mm
                      </span>
                    </div>

                    {/* Katphal */}
                    <div className="p-2.5 hover:bg-stone-50 flex items-center justify-between text-stone-700">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[9px] font-mono bg-stone-100 text-stone-600 px-1 rounded">
                            P07
                          </span>
                          <span>Katphal</span>
                        </div>
                        <span className="text-[10px] text-stone-400 block font-normal mt-0.5">
                          575m · 20.82 km²
                        </span>
                      </div>
                      <span className="font-mono text-xs text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded">
                        8.81 mm
                      </span>
                    </div>

                    {/* Vadgaon Nimbalkar */}
                    <div className="p-2.5 hover:bg-stone-50 flex items-center justify-between text-stone-700">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[9px] font-mono bg-stone-100 text-stone-600 px-1 rounded">
                            P14
                          </span>
                          <span>Vadgaon Nimbalkar</span>
                        </div>
                        <span className="text-[10px] text-stone-400 block font-normal mt-0.5">
                          569m · 16.84 km²
                        </span>
                      </div>
                      <span className="font-mono text-xs text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded">
                        8.10 mm
                      </span>
                    </div>
                  </div>
                </div>

                {/* Center Pane: MapLibre Spatial Map Simulation (5 cols) */}
                <div className="lg:col-span-5 bg-white rounded-xl border border-stone-200/90 p-3 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1.5 font-bold text-stone-800 uppercase tracking-wider text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-emerald-600" />
                      <span>Spatial Map (Baramati Block)</span>
                    </div>
                    <span className="text-[10px] bg-emerald-700 text-white font-bold px-2 py-0.5 rounded">
                      P01 Baburdi Active
                    </span>
                  </div>

                  {/* SVG Spatial Basemap Simulation with 4px Emerald Boundary & 28% Green Fill */}
                  <div className="h-64 sm:h-80 bg-stone-900 rounded-lg relative overflow-hidden flex flex-col justify-between p-3 border border-stone-800">
                    <svg className="w-full h-full opacity-90" viewBox="0 0 520 320">
                      {/* Grid Lines */}
                      <line x1="0" y1="80" x2="520" y2="80" stroke="#334155" strokeWidth="0.5" strokeDasharray="4 4" />
                      <line x1="0" y1="160" x2="520" y2="160" stroke="#334155" strokeWidth="0.5" strokeDasharray="4 4" />
                      <line x1="0" y1="240" x2="520" y2="240" stroke="#334155" strokeWidth="0.5" strokeDasharray="4 4" />
                      <line x1="130" y1="0" x2="130" y2="320" stroke="#334155" strokeWidth="0.5" strokeDasharray="4 4" />
                      <line x1="260" y1="0" x2="260" y2="320" stroke="#334155" strokeWidth="0.5" strokeDasharray="4 4" />
                      <line x1="390" y1="0" x2="390" y2="320" stroke="#334155" strokeWidth="0.5" strokeDasharray="4 4" />

                      {/* Neighbor 1: Dorlewadi (Muted) */}
                      <polygon
                        points="40,50 140,40 170,120 70,130"
                        fill="#334155"
                        fillOpacity="0.25"
                        stroke="#64748b"
                        strokeWidth="1.2"
                      />
                      <text x="80" y="85" fill="#94a3b8" fontSize="9">Dorlewadi</text>

                      {/* Neighbor 2: Katphal (Muted) */}
                      <polygon
                        points="140,40 260,30 280,110 170,120"
                        fill="#334155"
                        fillOpacity="0.25"
                        stroke="#64748b"
                        strokeWidth="1.2"
                      />
                      <text x="195" y="75" fill="#94a3b8" fontSize="9">Katphal</text>

                      {/* Neighbor 3: Katewadi (Muted) */}
                      <polygon
                        points="260,30 380,50 360,135 280,110"
                        fill="#334155"
                        fillOpacity="0.25"
                        stroke="#64748b"
                        strokeWidth="1.2"
                      />
                      <text x="300" y="80" fill="#94a3b8" fontSize="9">Katewadi</text>

                      {/* Neighbor 4: Hol (Muted) */}
                      <polygon
                        points="70,130 170,120 180,220 80,210"
                        fill="#334155"
                        fillOpacity="0.25"
                        stroke="#64748b"
                        strokeWidth="1.2"
                      />
                      <text x="110" y="175" fill="#94a3b8" fontSize="9">Hol</text>

                      {/* SELECTED POLYGON: P01 Baburdi (Lush 28% Emerald Fill, 4px Solid Outline & Halo) */}
                      {/* Outer Glow Halo */}
                      <polygon
                        points="170,120 280,110 300,210 190,220"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="8"
                        strokeOpacity="0.45"
                      />
                      {/* Solid Fill & 4px Outline */}
                      <polygon
                        points="170,120 280,110 300,210 190,220"
                        fill="#059669"
                        fillOpacity="0.28"
                        stroke="#047857"
                        strokeWidth="4"
                      />
                      <text x="210" y="165" fill="#ffffff" fontSize="12" fontWeight="bold">
                        Baburdi (P01)
                      </text>

                      {/* Centroid Dot with White Halo */}
                      <circle cx="235" cy="165" r="7" fill="#047857" stroke="#ffffff" strokeWidth="2.5" />
                      <circle cx="235" cy="165" r="13" fill="#10b981" fillOpacity="0.3" />

                      {/* Neighbor 5: Gunwadi (Muted) */}
                      <polygon
                        points="280,110 360,135 390,230 300,210"
                        fill="#334155"
                        fillOpacity="0.25"
                        stroke="#64748b"
                        strokeWidth="1.2"
                      />
                      <text x="320" y="175" fill="#94a3b8" fontSize="9">Gunwadi</text>
                    </svg>

                    {/* Centroid Tag Overlay */}
                    <div className="absolute top-28 left-48 bg-emerald-700 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded shadow-lg flex items-center space-x-1 border border-emerald-500">
                      <MapPin className="w-3 h-3 text-white" />
                      <span>Baburdi: 8.56 mm</span>
                    </div>

                    {/* Legend Scale Overlay */}
                    <div className="flex items-center justify-between text-[10px] text-stone-300 bg-stone-950/85 px-2.5 py-1 rounded border border-stone-800 backdrop-blur-xs">
                      <span>Boundary: Slate (Muted) · Emerald (Selected 4px)</span>
                      <span className="font-mono text-emerald-400 font-semibold">14 Panchayats</span>
                    </div>
                  </div>
                </div>

                {/* Right Pane: Selected Panchayat Intelligence Panel (4 cols) */}
                <div className="lg:col-span-4 bg-white rounded-xl border border-stone-200/90 shadow-2xs p-3.5 space-y-3">
                  {/* Level 1: Panchayat & Advisory Pill */}
                  <div className="flex items-start justify-between border-b border-stone-100 pb-2">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <h3 className="text-sm font-bold text-stone-900">Baburdi</h3>
                        <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-1 rounded font-bold">
                          P01
                        </span>
                      </div>
                      <span className="text-[10px] text-stone-400">Baramati Block · 2024-09-01</span>
                    </div>
                    <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-300 font-bold px-2 py-0.5 rounded-full">
                      WATCH
                    </span>
                  </div>

                  {/* Level 1 Focal Point: 8.56 mm ML Downscaled Rainfall */}
                  <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3">
                    <span className="text-[10px] uppercase font-bold text-stone-500 block">
                      ML Downscaled Rainfall
                    </span>
                    <div className="flex items-baseline space-x-1 mt-0.5">
                      <span className="text-3xl font-black text-stone-950 font-mono tracking-tight">8.56</span>
                      <span className="text-xs font-semibold text-stone-600">mm</span>
                      <span className="text-[10px] text-emerald-800 font-semibold pl-2">
                        Moderate rainfall
                      </span>
                    </div>
                    <span className="text-[9px] text-stone-500 block pt-1 border-t border-emerald-200/50 mt-1.5">
                      Coarse block: 5.62 mm → Spatial shift: <strong>+2.94 mm (+52.3%)</strong>
                    </span>
                  </div>

                  {/* Level 2: Calibrated Uncertainty Bar */}
                  <div className="bg-stone-50 rounded-lg p-2.5 space-y-1.5 border border-stone-200/70">
                    <div className="flex justify-between text-[10px]">
                      <span className="font-semibold text-stone-700">80% prediction interval</span>
                      <span className="font-mono font-bold text-stone-900">0.40 – 16.73 mm</span>
                    </div>
                    <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden relative">
                      <div className="absolute left-[3%] w-[54%] h-full bg-emerald-600 rounded-full" />
                    </div>
                    <div className="flex justify-between text-[9px] text-stone-400 font-mono">
                      <span>90% interval: 0.00 – 21.88 mm</span>
                      <span>Split-conformal</span>
                    </div>
                  </div>

                  {/* Level 3: Weather Context Row */}
                  <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                    <div className="bg-stone-50 p-1.5 rounded border border-stone-200/60">
                      <span className="text-stone-400 block text-[9px]">Humidity</span>
                      <span className="font-bold text-stone-800 font-mono">90.6%</span>
                    </div>
                    <div className="bg-stone-50 p-1.5 rounded border border-stone-200/60">
                      <span className="text-stone-400 block text-[9px]">Max Temp</span>
                      <span className="font-bold text-stone-800 font-mono">26.7°C</span>
                    </div>
                    <div className="bg-stone-50 p-1.5 rounded border border-stone-200/60">
                      <span className="text-stone-400 block text-[9px]">Wind</span>
                      <span className="font-bold text-stone-800 font-mono">4.1 m/s</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Agritech Capability Pills */}
          <div
            className={`mt-8 flex flex-wrap items-center justify-center gap-3 md:gap-6 text-xs text-stone-700 font-semibold transition-all duration-700 ease-out delay-500 ${
              isVisible || isReducedMotion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            }`}
          >
            <span className="inline-flex items-center space-x-1.5 bg-white border border-stone-200/90 px-3.5 py-1.5 rounded-full shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>Spatial Downscaling</span>
            </span>
            <span className="inline-flex items-center space-x-1.5 bg-white border border-stone-200/90 px-3.5 py-1.5 rounded-full shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span>Calibrated Uncertainty</span>
            </span>
            <span className="inline-flex items-center space-x-1.5 bg-white border border-stone-200/90 px-3.5 py-1.5 rounded-full shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-amber-600" />
              <span>Agro-Advisory Engine</span>
            </span>
            <span className="inline-flex items-center space-x-1.5 bg-white border border-stone-200/90 px-3.5 py-1.5 rounded-full shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
              <span>SHAP Explainability</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
