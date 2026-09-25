import React from 'react';
import { MapPin, Calendar, Layers, ShieldCheck } from 'lucide-react';

export default function TrustStrip() {
  const items = [
    {
      icon: <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />,
      title: 'Baramati Block · Pune · Maharashtra',
      subtitle: 'Study Area Location',
    },
    {
      icon: <Layers className="w-4 h-4 text-blue-600 flex-shrink-0" />,
      title: '14 Gram Panchayats',
      subtitle: 'Hyperlocal Coverage',
    },
    {
      icon: <ShieldCheck className="w-4 h-4 text-indigo-600 flex-shrink-0" />,
      title: 'Retrospective Downscaling Experiment',
      subtitle: 'Research Methodology',
    },
    {
      icon: <Calendar className="w-4 h-4 text-amber-600 flex-shrink-0" />,
      title: '2023–2024 evaluation period',
      subtitle: 'Held-Out Test Partitions',
    },
  ];

  return (
    <div className="bg-white border-y border-slate-200/80 py-4 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-200/60">
          {items.map((item, idx) => (
            <div
              key={idx}
              className={`flex items-center space-x-3 pt-3 md:pt-0 ${
                idx > 0 ? 'md:pl-6' : ''
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center">
                {item.icon}
              </div>
              <div className="text-left">
                <span className="block text-xs font-bold text-slate-900 tracking-tight">
                  {item.title}
                </span>
                <span className="block text-[11px] text-slate-500 font-medium">
                  {item.subtitle}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
