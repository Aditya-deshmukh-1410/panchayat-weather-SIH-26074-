import React from 'react';
import { MapPin, Sparkles, SlidersHorizontal, Wheat, BarChart3 } from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      title: 'Panchayat-level visualization',
      desc: 'Explore weather information across 14 Gram Panchayats in Baramati Block with interactive boundaries and geospatial attributes.',
      icon: <MapPin className="w-5 h-5 text-emerald-600" />,
      tag: 'Interactive Cartography',
    },
    {
      title: 'ML downscaled rainfall',
      desc: 'Estimate localized rainfall using the trained XGBoost downscaling model evaluated against the ERA5-Land reference proxy.',
      icon: <Sparkles className="w-5 h-5 text-blue-600" />,
      tag: 'XGBoost Regressor',
    },
    {
      title: 'Prediction uncertainty',
      desc: 'View calibrated prediction intervals instead of relying on a single number alone, providing statistical coverage guarantees.',
      icon: <SlidersHorizontal className="w-5 h-5 text-purple-600" />,
      tag: 'Split Conformal (80% / 90%)',
    },
    {
      title: 'Agro-meteorological advisory',
      desc: 'Translate rainfall signals into deterministic, cautious field guidance without generative hallucinations or unsupported claims.',
      icon: <Wheat className="w-5 h-5 text-amber-600" />,
      tag: 'Deterministic Engine',
    },
    {
      title: 'Model explainability',
      desc: 'Inspect model-level SHAP feature contributions to understand global model attribution weights across evaluated weather variables.',
      icon: <BarChart3 className="w-5 h-5 text-teal-600" />,
      tag: 'TreeSHAP Attribution',
    },
  ];

  return (
    <section id="features" className="py-16 md:py-24 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 inline-block px-3 py-1 rounded-full">
            Core Capabilities
          </h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            One platform. Five layers of insight.
          </h3>
          <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
            Designed for agronomists, researchers, and local stakeholders to inspect weather
            downscaling with rigorous uncertainty boundaries and complete scientific transparency.
          </p>
        </div>

        {/* 5 Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, index) => (
            <div
              key={feat.title}
              className={`bg-slate-50/70 border border-slate-200 rounded-2xl p-6 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between ${
                index === 4 ? 'md:col-span-2 lg:col-span-1' : ''
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center">
                    {feat.icon}
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                    {feat.tag}
                  </span>
                </div>

                <h4 className="text-base font-bold text-slate-900 tracking-tight">{feat.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">{feat.desc}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-200/60 text-[11px] font-semibold text-slate-400">
                <span>Layer 0{index + 1}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
