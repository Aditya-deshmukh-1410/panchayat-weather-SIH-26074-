import React from 'react';
import Link from 'next/link';
import { CloudRain, MapPin, ArrowLeft } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left Side: Brand & Product Identity */}
        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
          <Link
            href="/"
            className="inline-flex items-center text-xs font-semibold text-slate-700 hover:text-emerald-800 bg-slate-100/90 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 px-3 py-1.5 rounded-lg transition-all shadow-2xs group flex-shrink-0"
            title="Return to Product Overview"
          >
            <span className="group-hover:-translate-x-0.5 transition-transform inline-block">← Overview</span>
          </Link>

          <div className="h-6 w-px bg-slate-200 hidden md:block" />

          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-sm shadow-emerald-700/20 flex-shrink-0">
              <CloudRain className="w-5 h-5 text-emerald-50" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-sm sm:text-base font-bold text-slate-900 tracking-tight truncate">
                  Panchayat Weather Intelligence
                </span>
                <span className="hidden xl:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  SIH 2026
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium truncate">
                Retrospective Downscaling Experiment
              </p>
            </div>
          </div>

          {/* Navigation Items: Overview & Dashboard */}
          <nav className="hidden lg:flex items-center space-x-1 pl-4" aria-label="Primary Navigation">
            <Link
              href="/"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors"
            >
              Overview
            </Link>
            <span
              className="text-xs font-semibold text-emerald-700 bg-emerald-50/90 border border-emerald-200/70 px-3 py-1.5 rounded-md shadow-2xs"
              aria-current="page"
            >
              Dashboard
            </span>
          </nav>
        </div>

        {/* Right Side: Spatial & Experiment Context */}
        <div className="flex items-center space-x-2 sm:space-x-2.5 flex-shrink-0">
          {/* Location Context */}
          <div className="hidden sm:flex items-center space-x-1.5 bg-slate-50 border border-slate-200/90 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold text-slate-800">Baramati Block</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-600">Pune · Maharashtra</span>
          </div>

          {/* Panchayat Count Badge */}
          <div className="flex items-center space-x-1.5 bg-emerald-50/70 border border-emerald-200/70 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>14 Gram Panchayats</span>
          </div>
        </div>
      </div>
    </header>
  );
}
