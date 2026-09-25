import React from 'react';
import { Map, Minimize2, Maximize2, Cpu, ShieldCheck } from 'lucide-react';

export default function SummaryCards() {
  const cards = [
    {
      title: 'Study Area',
      value: '14 Panchayats',
      subtitle: 'Baramati Block, Pune',
      icon: Map,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Input Resolution',
      value: '~50 km',
      subtitle: 'NASA POWER coarse proxy',
      icon: Maximize2,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      title: 'Downscaled Resolution',
      value: 'Panchayat level',
      subtitle: 'Localized topoclimatic bounds',
      icon: Minimize2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Model',
      value: 'XGBoost',
      subtitle: 'v0.1.0-alpha (17 features)',
      icon: Cpu,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Uncertainty',
      value: 'Split Conformal',
      subtitle: '80% & 90% calibrated intervals',
      icon: ShieldCheck,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`p-1.5 rounded-lg ${card.bgColor} ${card.color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight block">
                {card.value}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block truncate">
                {card.subtitle}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
