import React from 'react';
import { BookOpen, ShieldAlert } from 'lucide-react';

export default function ExperimentContext() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-800">
      {/* 1. Experiment Methodology & Dataset Context */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
        <h4 className="text-xs font-bold text-slate-900 flex items-center space-x-2 mb-2.5 uppercase tracking-wider">
          <BookOpen className="w-4 h-4 text-emerald-600" />
          <span>Historical Experiment Context</span>
        </h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-200/70">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Study Period</span>
            <span className="font-semibold text-slate-800 text-xs">2023–2024 (731 days)</span>
          </div>
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-200/70">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Evaluation Partition</span>
            <span className="font-semibold text-slate-800 text-xs">Sep–Dec 2024 (122 days)</span>
          </div>
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-200/70">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Input Proxy</span>
            <span className="font-semibold text-slate-800 text-xs">NASA POWER / MERRA-2 (0.5°)</span>
          </div>
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-200/70">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Target Reference</span>
            <span className="font-semibold text-slate-800 text-xs">ERA5-Land (0.1° Reanalysis)</span>
          </div>
        </div>
        <p className="text-[11px] text-slate-500 mt-2.5 leading-relaxed">
          The pipeline evaluates spatial downscaling fidelity by learning empirical relationships between coarse block weather, local topography (elevation, area, block-center distance), and antecedent lagged rainfall.
        </p>
      </div>

      {/* 2. Scientific Boundary & Limitations Notice */}
      <div className="bg-amber-50/70 border border-amber-200/90 rounded-xl p-4 shadow-xs">
        <h4 className="text-xs font-bold text-amber-950 flex items-center space-x-2 mb-2 uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          <span>About this SIH Prototype &amp; Scientific Boundaries</span>
        </h4>
        <div className="space-y-2 text-xs text-amber-900 leading-relaxed">
          <p>
            <strong>Retrospective Downscaling Demonstration:</strong> This prototype demonstrates historical spatial downscaling from a coarse weather proxy to Panchayat-level estimates. Current outputs use ERA5-Land as a reference proxy and are <strong>not operational forecasts</strong>.
          </p>
          <p className="text-[11px] text-amber-800/90 pt-1.5 border-t border-amber-200/80">
            Model predictions reflect retrospective inferences on frozen historical data. They do not constitute official meteorological warnings or real-time ground-truth weather station observations.
          </p>
        </div>
      </div>
    </div>
  );
}
