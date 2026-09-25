import React from 'react';
import { Calendar, MapPin, ShieldAlert, Wheat, Info, CheckCircle2 } from 'lucide-react';

export default function ExampleInsightSection() {
  return (
    <section className="py-16 md:py-24 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-14">
          <div className="inline-flex items-center space-x-2 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full text-xs font-semibold text-amber-900">
            <Calendar className="w-3.5 h-3.5 text-amber-700" />
            <span>Retrospective Held-Out Test Case</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Retrospective example · Baburdi P01 · 1 September 2024
          </h3>
          <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
            Examining the actual outputs generated for Gram Panchayat Baburdi on the fixed
            chronological test partition date.
          </p>
        </div>

        {/* Example Inspection Card */}
        <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          {/* Top Metadata Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div className="flex items-center space-x-2.5">
              <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-800 font-mono text-xs font-bold border border-blue-200">
                P01
              </span>
              <div>
                <h4 className="text-base font-bold text-slate-900">Baburdi Gram Panchayat</h4>
                <p className="text-xs text-slate-500">Elevation: 589 m • Area: 14.82 km² • Baramati Block</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 self-start sm:self-auto">
              <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                <span>Severity: WATCH</span>
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                Moderate rainfall
              </span>
            </div>
          </div>

          {/* Quantitative Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Coarse Block Baseline
              </span>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-2xl font-black font-mono text-slate-700">5.62</span>
                <span className="text-xs font-medium text-slate-500">mm</span>
              </div>
              <span className="text-[10px] text-slate-400 block">~50 km NASA POWER proxy</span>
            </div>

            <div className="bg-blue-50/80 border border-blue-200 p-4 rounded-xl space-y-1">
              <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block">
                ML Downscaled Rainfall
              </span>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-3xl font-black font-mono text-blue-950">8.56</span>
                <span className="text-xs font-medium text-blue-800">mm</span>
              </div>
              <span className="text-[10px] text-blue-700 block">+2.94 mm localized elevation delta</span>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-xl space-y-1">
              <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block">
                80% prediction interval
              </span>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-xl font-bold font-mono text-emerald-950">0.40 – 16.73</span>
                <span className="text-xs font-medium text-emerald-800">mm</span>
              </div>
              <span className="text-[10px] text-emerald-700 block">Coverage width: 16.33 mm</span>
            </div>
          </div>

          {/* Calibrated Advisory & Explanation Snippets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Advisory Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                <Wheat className="w-3.5 h-3.5 text-amber-600" />
                <span>Deterministic Advisory Output</span>
              </span>
              <ul className="space-y-1.5 text-slate-700">
                <li className="flex items-start space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>Moderate rainfall (5–20 mm) indicated for Panchayat.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>Consider postponing sensitive foliar spraying &amp; harvesting operations.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>High relative humidity notice: monitor field moisture levels.</span>
                </li>
              </ul>
            </div>

            {/* Explainability Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                <Info className="w-3.5 h-3.5 text-indigo-600" />
                <span>SHAP Feature Attribution Weights</span>
              </span>
              <div className="space-y-1 text-slate-700">
                <div className="flex justify-between py-0.5 border-b border-slate-200/60">
                  <span>Block rainfall</span>
                  <span className="font-mono font-bold text-slate-900">1.56</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-200/60">
                  <span>Block humidity</span>
                  <span className="font-mono font-bold text-slate-900">1.08</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span>Previous-day rainfall</span>
                  <span className="font-mono font-bold text-slate-900">0.62</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 italic pt-1">
                * Attribution magnitude across evaluated dataset.
              </p>
            </div>
          </div>

          {/* Context Footer */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Reference target (ERA5-Land proxy): 8.92 mm</span>
            <span className="font-mono text-emerald-700 font-semibold">Abs Error: 0.36 mm</span>
          </div>
        </div>
      </div>
    </section>
  );
}
