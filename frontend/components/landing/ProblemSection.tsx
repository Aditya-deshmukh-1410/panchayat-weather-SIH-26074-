import React from 'react';
import { ArrowDown, AlertCircle, CheckCircle2, CloudFog, MapPin } from 'lucide-react';

export default function ProblemSection() {
  return (
    <section className="py-16 md:py-24 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 inline-block px-3 py-1 rounded-full">
            The Spatial Scale Challenge
          </h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Weather data is available. Localized insight is harder.
          </h3>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            Coarser weather information may not capture local spatial variation relevant to
            Panchayat-level agricultural decision support. Farming operations occur across fields
            and villages, yet meteorological products are often aggregated at broader regional scales.
          </p>
        </div>

        {/* Visual Comparison Cards */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Card 1: Block Level (Coarse Scale) */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4 text-left relative">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-200/80 text-slate-700 text-xs font-bold font-mono">
                BLOCK LEVEL
              </span>
              <span className="text-[11px] text-slate-400 font-medium">~50 km Coarse Proxy</span>
            </div>

            <div className="h-28 bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center p-4 text-center space-y-1">
              <CloudFog className="w-7 h-7 text-slate-400 mb-1" />
              <p className="text-xs font-bold text-slate-800">Single Homogeneous Estimate</p>
              <p className="text-[11px] text-slate-500">Uniform weather value across entire block</p>
            </div>

            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <span>Masks micro-climate gradients, elevation differences, and localized terrain effects.</span>
              </li>
              <li className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <span>Treats all 14 Panchayats identically regardless of spatial distance or topography.</span>
              </li>
            </ul>
          </div>

          {/* Card 2: Panchayat Level (Downscaled) */}
          <div className="bg-gradient-to-br from-emerald-50/70 via-blue-50/50 to-white border-2 border-emerald-300 rounded-2xl p-6 space-y-4 text-left shadow-md shadow-emerald-500/5 relative">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-emerald-600 text-white text-xs font-bold font-mono">
                PANCHAYAT LEVEL
              </span>
              <span className="text-[11px] text-emerald-800 font-bold">14 Individual Boundaries</span>
            </div>

            <div className="h-28 bg-white border border-emerald-200 rounded-xl flex flex-col items-center justify-center p-4 text-center space-y-1 shadow-2xs">
              <MapPin className="w-7 h-7 text-emerald-600 mb-1" />
              <p className="text-xs font-bold text-slate-900">14 Spatially Differentiated Estimates</p>
              <p className="text-[11px] text-emerald-700">Calibrated intervals + deterministic agro-advisory</p>
            </div>

            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span>Incorporates elevation, slope, centroid coordinates, and historical lags.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span>Supplies 80% split-conformal intervals &amp; field operation advisories per Panchayat.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
