import React from 'react';
import { ShieldCheck, FileCheck, CheckCircle2 } from 'lucide-react';

export default function TransparencySection() {
  const principles = [
    {
      title: 'Retrospective Downscaling Experiment',
      desc: 'The current prototype is an analytical spatial-downscaling experiment developed for Smart India Hackathon 2026, evaluating historical periods across 2023–2024.',
    },
    {
      title: 'Reference Proxy Methodology',
      desc: 'High-resolution target values derive from the ERA5-Land 0.1° (~9 km) hourly-aggregated reanalysis proxy, explicitly acknowledged as a reference proxy rather than ground-truth station observations.',
    },
    {
      title: 'Coarse Input Attribution',
      desc: 'Coarse block-scale weather inputs are sourced from NASA POWER / MERRA-2 (~50 km grid), representing the coarse baseline before spatial statistical downscaling.',
    },
    {
      title: 'Split-Conformal Uncertainty Bounds',
      desc: 'Instead of misleading point estimates, the system outputs non-parametric 80% and 90% prediction intervals calibrated on validation partition residuals.',
    },
    {
      title: 'Deterministic Rule Engine',
      desc: 'Advisories are generated via 100% deterministic, inspectable rules. No generative AI or black-box LLMs are used to fabricate unverified agricultural recommendations.',
    },
    {
      title: 'Attribution vs Physical Causation',
      desc: 'SHAP values characterize feature contributions within the mathematical model. They do not constitute meteorological causation or physical proofs of rainfall generation.',
    },
    {
      title: 'Independent of Official IMD Operations',
      desc: 'This research prototype does not replace official India Meteorological Department (IMD) forecasts, agromet advisories, or expert agricultural extension officers.',
    },
    {
      title: 'Open Scientific Documentation',
      desc: 'All methodology documents, feature pipelines, training partitions, and error distributions are archived and inspectable across the project codebase.',
    },
  ];

  return (
    <section id="transparency" className="py-16 md:py-24 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 inline-block px-3 py-1 rounded-full">
            Responsible AI &amp; Scientific Governance
          </h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Built for transparent decision support
          </h3>
          <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
            Scientific rigor and honest limitation boundaries are foundational to trustworthy
            agricultural intelligence. We treat transparency not as a caveat, but as a core product pillar.
          </p>
        </div>

        {/* Principles 2-column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {principles.map((item, index) => (
            <div
              key={item.title}
              className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-5 hover:bg-white hover:shadow-sm transition-all space-y-2 text-left"
            >
              <div className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 flex-shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900 tracking-tight">{item.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
