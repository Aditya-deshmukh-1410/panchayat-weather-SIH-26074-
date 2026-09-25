'use client';

import React, { useState, useMemo } from 'react';
import { PanchayatFeature, PredictionWithUncertaintyResult } from '../../src/types';
import { MapPin, Search, ChevronDown, CheckCircle2, SlidersHorizontal } from 'lucide-react';

interface PanchayatSelectorProps {
  panchayats: PanchayatFeature[];
  selectedPanchayatId: string | null;
  predictionsMap: Record<string, PredictionWithUncertaintyResult>;
  onSelect: (panchayatId: string) => void;
  className?: string;
}

export default function PanchayatSelector({
  panchayats,
  selectedPanchayatId,
  predictionsMap,
  onSelect,
  className = '',
}: PanchayatSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter panchayats by name or id
  const filteredPanchayats = useMemo(() => {
    if (!searchTerm.trim()) return panchayats;
    const lower = searchTerm.toLowerCase().trim();
    return panchayats.filter(
      (p) =>
        p.properties.name.toLowerCase().includes(lower) ||
        p.id.toLowerCase().includes(lower)
    );
  }, [panchayats, searchTerm]);

  const downscaledCount = Object.keys(predictionsMap).length;

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col ${className}`}
    >
      {/* Panel Header */}
      <div className="p-3.5 border-b border-slate-100 bg-slate-50/60">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Panchayats
            </h2>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
            {panchayats.length} locations
          </span>
        </div>

        {/* Search / Filter Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search panchayat..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all"
            aria-label="Filter Panchayats"
          />
        </div>
      </div>

      {/* Desktop & Tablet: Vertical List of 14 Panchayats */}
      <div className="hidden md:flex flex-col flex-1 divide-y divide-slate-100 overflow-y-auto max-h-[calc(100vh-230px)] min-h-[380px]">
        {filteredPanchayats.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            No panchayats match &ldquo;{searchTerm}&rdquo;
          </div>
        ) : (
          filteredPanchayats.map((p) => {
            const isSelected = p.id === selectedPanchayatId;
            const pred = predictionsMap[p.id];

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelect(p.id)}
                className={`w-full text-left p-3 transition-all flex items-center justify-between group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                  isSelected
                    ? 'bg-emerald-50/90 border-l-4 border-emerald-600 text-emerald-950 font-semibold shadow-2xs'
                    : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900 border-l-4 border-transparent'
                }`}
                aria-pressed={isSelected}
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center space-x-1.5">
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                      }`}
                    >
                      {p.id}
                    </span>
                    <span className="text-xs font-semibold truncate">
                      {p.properties.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-1 pl-0.5">
                    <span>{p.properties.elevation_m}m</span>
                    <span>·</span>
                    <span>{p.properties.area_sqkm} km²</span>
                  </div>
                </div>

                {/* Right: Downscaled value if available */}
                <div className="flex flex-col items-end flex-shrink-0">
                  {pred ? (
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-300/60 px-1.5 py-0.5 rounded block">
                        {pred.prediction_mm.toFixed(1)} mm
                      </span>
                      <span className="text-[9px] text-emerald-700/80 font-medium">Downscaled</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-300 group-hover:text-slate-400 font-mono">
                      —
                    </span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Mobile: Compact Select Dropdown and Quick Pills */}
      <div className="md:hidden p-3 space-y-2.5">
        <div className="relative">
          <select
            id="mobile-panchayat-select"
            value={selectedPanchayatId || ''}
            onChange={(e) => onSelect(e.target.value)}
            className="w-full appearance-none bg-white border border-slate-300 text-slate-900 rounded-lg px-3.5 py-2.5 text-xs font-medium pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <option value="" disabled>
              Select Panchayat
            </option>
            {panchayats.map((p) => {
              const pred = predictionsMap[p.id];
              return (
                <option key={p.id} value={p.id}>
                  {p.properties.name} ({p.id}) {pred ? `· ${pred.prediction_mm.toFixed(1)} mm` : ''}
                </option>
              );
            })}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {/* Quick Horizontal Scroll Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
          {panchayats.map((p) => {
            const isSelected = p.id === selectedPanchayatId;
            const pred = predictionsMap[p.id];
            return (
              <button
                key={p.id}
                onClick={() => onSelect(p.id)}
                className={`text-[11px] px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap flex-shrink-0 transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                    : pred
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-slate-100 text-slate-700 border border-slate-200/60'
                }`}
              >
                <span>{p.properties.name}</span>
                <span className="ml-1 opacity-75 font-mono text-[10px]">({p.id})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Panel Footer */}
      <div className="p-2.5 bg-slate-50/80 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
        <span>Evaluated: {downscaledCount}/14</span>
        <span className="font-mono text-slate-400">PostGIS 3.6</span>
      </div>
    </div>
  );
}
