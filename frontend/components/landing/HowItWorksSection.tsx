import React from 'react';
import {
  CloudSun,
  Compass,
  Cpu,
  SlidersHorizontal,
  Wheat,
  BarChart3,
  ArrowRight,
} from 'lucide-react';

export default function HowItWorksSection() {
  const steps = [
    {
      num: '01',
      title: 'Weather inputs',
      icon: <CloudSun className="w-5 h-5 text-blue-600" />,
      desc: 'Ingests coarse block-scale weather proxy variables (precipitation, temperature, humidity, and wind speed) from NASA POWER / MERRA-2 (~50 km).',
    },
    {
      num: '02',
      title: 'Geographic & historical features',
      icon: <Compass className="w-5 h-5 text-emerald-600" />,
      desc: 'Enriches inputs with verified non-leaking features: elevation, surface area, distance to block center, rolling 7-day statistics, and lags.',
    },
    {
      num: '03',
      title: 'XGBoost downscaling',
      icon: <Cpu className="w-5 h-5 text-indigo-600" />,
      desc: 'Trained gradient-boosted decision trees evaluate spatial non-linearities to downscale block-scale signals to the 14 individual Panchayats.',
    },
    {
      num: '04',
      title: 'Uncertainty estimation',
      icon: <SlidersHorizontal className="w-5 h-5 text-purple-600" />,
      desc: 'Generates split-conformal prediction intervals (80% and 90% coverage) calibrated on held-out validation residuals.',
    },
    {
      num: '05',
      title: 'Agro-meteorological advisory',
      icon: <Wheat className="w-5 h-5 text-amber-600" />,
      desc: 'A deterministic rule engine translates localized rainfall signals and interval bounds into cautious field operational guidance.',
    },
    {
      num: '06',
      title: 'Model explainability',
      icon: <BarChart3 className="w-5 h-5 text-teal-600" />,
      desc: 'Evaluates global SHAP feature importance to transparently communicate which variables drove model attribution.',
    },
  ];

  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 inline-block px-3 py-1 rounded-full">
            Methodology &amp; Pipeline
          </h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            From block-level weather to Panchayat-level insight
          </h3>
          <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
            The platform performs historical spatial downscaling using a validated 17-feature
            machine learning pipeline, statistical conformal calibration, and deterministic rules.
          </p>
        </div>

        {/* Step-by-Step Pipeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div
              key={step.num}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-extrabold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">
                    {step.num}
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                    {step.icon}
                  </div>
                </div>

                <h4 className="text-base font-bold text-slate-900 tracking-tight">{step.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center text-[11px] font-semibold text-slate-400">
                <span>Phase {step.num} Provenance</span>
              </div>
            </div>
          ))}
        </div>

        {/* Pipeline Flow Banner */}
        <div className="mt-12 bg-white border border-slate-200 rounded-xl p-4 text-center max-w-4xl mx-auto shadow-2xs">
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-slate-700">
            <span className="bg-slate-100 px-2.5 py-1 rounded">Coarse Block Weather</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="bg-slate-100 px-2.5 py-1 rounded">17 Non-Leaking Features</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-1 rounded">
              XGBoost Downscaler
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="bg-purple-50 text-purple-800 border border-purple-200 px-2.5 py-1 rounded">
              Conformal Interval
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded">
              Agro-Advisory &amp; SHAP
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
