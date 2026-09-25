'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  MapPin,
  Sparkles,
  CloudRain,
  Wheat,
  BarChart3,
  Calendar,
  CheckCircle2,
  Droplets,
  Thermometer,
  Wind,
  Layers,
  Map as MapIcon,
} from 'lucide-react';

export default function ProductPreviewSection() {
  return (
    <section className="py-16 md:py-24 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
          <div className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-200 px-3.5 py-1 rounded-full text-xs font-semibold text-emerald-800">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Interactive Operational Workspace</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Explore the Map-First Panchayat Dashboard
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
            A cohesive agro-meteorological workspace inspired by modern agritech interaction principles:
            dominant spatial map, progressive disclosure, calibrated prediction intervals, and deterministic advisories.
          </p>
        </div>

        {/* Dashboard Frame */}
        <div className="bg-slate-950 rounded-2xl sm:rounded-3xl p-2 sm:p-4 md:p-6 shadow-2xl border border-slate-800 max-w-6xl mx-auto">
          {/* Mock Browser Header Bar */}
          <div className="flex items-center justify-between pb-3 px-2 sm:px-3 border-b border-slate-800 text-xs text-slate-400">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="font-mono text-[11px] text-slate-400 pl-2 hidden sm:inline">
                panchayat-weather / dashboard
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded">
                Map-First Preview
              </span>
              <Link
                href="/dashboard"
                className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center space-x-1"
              >
                <span>Open Dashboard →</span>
              </Link>
            </div>
          </div>

          {/* Embedded Real Dashboard Simulation */}
          <div className="bg-[#f8fafc] rounded-xl sm:rounded-2xl p-3 sm:p-4 mt-3 space-y-3 text-slate-800 font-sans">
            {/* 1. Dashboard Sub-Header Preview */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2 shadow-2xs">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
                  ← Overview
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-2xs">
                    <CloudRain className="w-4 h-4 text-emerald-50" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-none">
                      Panchayat Weather Intelligence
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      Retrospective Downscaling Experiment
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-slate-700 font-medium flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-emerald-600" />
                  <span>Baramati Block · Pune</span>
                </span>
                <span className="bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-emerald-800 font-semibold">
                  14 Gram Panchayats
                </span>
              </div>
            </div>

            {/* 2. Main 3-Pane Workspace Simulation */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
              {/* Left Pane: Compact Panchayat Sidebar (3 cols) */}
              <div className="hidden lg:block lg:col-span-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
                <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>Panchayats</span>
                  <span className="text-[10px] text-slate-400 font-normal">14 locations</span>
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  {/* Selected: Baburdi */}
                  <div className="p-2.5 bg-emerald-50/90 border-l-4 border-emerald-600 flex items-center justify-between font-semibold text-emerald-950">
                    <div>
                      <div className="flex items-center space-x-1">
                        <span className="text-[9px] font-mono bg-emerald-600 text-white px-1 py-0.2 rounded">P01</span>
                        <span>Baburdi</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block font-normal">598m · 13.56 km²</span>
                    </div>
                    <span className="font-mono text-xs text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                      8.56 mm
                    </span>
                  </div>
                  {/* Dorlewadi */}
                  <div className="p-2.5 hover:bg-slate-50 flex items-center justify-between text-slate-700">
                    <div>
                      <div className="flex items-center space-x-1">
                        <span className="text-[9px] font-mono bg-slate-100 text-slate-600 px-1 py-0.2 rounded">P02</span>
                        <span>Dorlewadi</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block font-normal">548m · 18.42 km²</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">—</span>
                  </div>
                  {/* Gojubavi */}
                  <div className="p-2.5 hover:bg-slate-50 flex items-center justify-between text-slate-700">
                    <div>
                      <div className="flex items-center space-x-1">
                        <span className="text-[9px] font-mono bg-slate-100 text-slate-600 px-1 py-0.2 rounded">P03</span>
                        <span>Gojubavi</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block font-normal">562m · 16.10 km²</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">—</span>
                  </div>
                </div>
              </div>

              {/* Center Pane: Dominant Interactive Map Simulation (5 cols) */}
              <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 p-3 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5 font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    <MapIcon className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Spatial Map (Baramati Block)</span>
                  </div>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
                    Baburdi Active
                  </span>
                </div>

                {/* SVG Visualizer */}
                <div className="h-60 sm:h-72 bg-slate-900 rounded-lg relative overflow-hidden flex flex-col justify-between p-3 border border-slate-800">
                  <svg className="w-full h-full opacity-85" viewBox="0 0 500 300">
                    <polygon points="40,50 130,30 160,110 70,120" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="1.2" />
                    <text x="75" y="80" fill="#93c5fd" fontSize="10">Dorlewadi</text>

                    <polygon points="130,30 240,20 260,95 160,110" fill="#1e293b" stroke="#64748b" strokeWidth="1.2" />
                    <text x="180" y="65" fill="#cbd5e1" fontSize="10">Katphal</text>

                    <polygon points="240,20 350,40 330,120 260,95" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="1.2" />
                    <text x="275" y="70" fill="#93c5fd" fontSize="10">Katewadi</text>

                    {/* Active Baburdi polygon */}
                    <polygon points="160,110 260,95 280,190 180,200" fill="#2563eb" stroke="#10b981" strokeWidth="3" />
                    <text x="195" y="150" fill="#ffffff" fontSize="11" fontWeight="bold">Baburdi (P01)</text>

                    <polygon points="260,95 330,120 370,210 280,190" fill="#1e293b" stroke="#64748b" strokeWidth="1.2" />
                    <text x="295" y="155" fill="#cbd5e1" fontSize="10">Gunwadi</text>
                  </svg>

                  {/* Active Pin Marker on Baburdi */}
                  <div className="absolute top-24 left-36 sm:left-44 bg-emerald-500 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded shadow-lg flex items-center space-x-1 border border-emerald-400">
                    <MapPin className="w-3 h-3 text-white" />
                    <span>Baburdi: 8.56 mm</span>
                  </div>

                  {/* Legend Overlay */}
                  <div className="flex items-center justify-between text-[10px] text-slate-300 bg-slate-950/80 px-2 py-1 rounded border border-slate-800">
                    <span>Signal: Low (&lt;1) · Light (1-5) · Moderate (5-20)</span>
                    <span className="font-mono text-emerald-400">14 Panchayats</span>
                  </div>
                </div>
              </div>

              {/* Right Pane: Selected Panchayat Detail Panel (4 cols) */}
              <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3.5 space-y-3">
                {/* Level 1: Panchayat & Downscaled Estimate */}
                <div className="flex items-start justify-between border-b border-slate-100 pb-2">
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h4 className="text-sm font-bold text-slate-900">Baburdi</h4>
                      <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-1 rounded">P01</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Baramati Block · 2024-09-01</span>
                  </div>
                  <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-300 font-bold px-1.5 py-0.5 rounded-full">
                    WATCH
                  </span>
                </div>

                {/* Level 1 Focal Point: 8.56 mm */}
                <div className="bg-gradient-to-br from-emerald-50/70 to-slate-50 border border-emerald-200/80 rounded-xl p-2.5">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">ML Downscaled Rainfall</span>
                  <div className="flex items-baseline space-x-1 mt-0.5">
                    <span className="text-2xl font-black text-slate-950 font-mono">8.56</span>
                    <span className="text-xs font-semibold text-slate-600">mm</span>
                    <span className="text-[10px] text-emerald-800 font-semibold pl-2">Moderate rainfall</span>
                  </div>
                  <span className="text-[9px] text-slate-500 block pt-1 border-t border-slate-200/60 mt-1">
                    Coarse block: 5.62 mm → Spatial shift: +2.94 mm
                  </span>
                </div>

                {/* Level 2: Uncertainty */}
                <div className="bg-slate-50 rounded-lg p-2 space-y-1 border border-slate-200/70">
                  <div className="flex justify-between text-[10px]">
                    <span className="font-semibold text-slate-700">80% prediction interval</span>
                    <span className="font-mono font-bold text-slate-900">0.40 – 16.73 mm</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden relative">
                    <div className="absolute left-[3%] w-[54%] h-full bg-emerald-600 rounded-full" />
                  </div>
                  <p className="text-[9px] text-slate-400 italic">
                    Calibrated prediction uncertainty based on validation residuals.
                  </p>
                </div>

                {/* Level 3: Weather Context Row */}
                <div className="grid grid-cols-3 gap-1 text-center text-[10px]">
                  <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                    <span className="text-slate-400 block text-[9px]">Humidity</span>
                    <span className="font-bold text-slate-800 font-mono">90.6%</span>
                  </div>
                  <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                    <span className="text-slate-400 block text-[9px]">Max Temp</span>
                    <span className="font-bold text-slate-800 font-mono">26.7°C</span>
                  </div>
                  <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                    <span className="text-slate-400 block text-[9px]">Wind</span>
                    <span className="font-bold text-slate-800 font-mono">4.1 m/s</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Launch Banner */}
          <div className="pt-4 mt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 px-3">
            <span>Historical experiment demonstration on Baramati Block (14 Panchayats)</span>
            <Link
              href="/dashboard"
              className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all text-xs group"
            >
              <span>Explore Panchayat Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
