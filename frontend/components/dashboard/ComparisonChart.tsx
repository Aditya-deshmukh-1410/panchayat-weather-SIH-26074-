'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { PredictionWithUncertaintyResult } from '../../src/types';
import { BarChart3, Info, TrendingUp, TrendingDown, PieChart as PieIcon } from 'lucide-react';

interface ComparisonChartProps {
  predictionsList: PredictionWithUncertaintyResult[];
  selectedPrediction: PredictionWithUncertaintyResult | null;
}

export default function ComparisonChart({
  predictionsList,
  selectedPrediction,
}: ComparisonChartProps) {
  // Use selectedPrediction as primary baseline, or fallback to first prediction in list
  const activePred = selectedPrediction || (predictionsList.length > 0 ? predictionsList[0] : null);

  if (!activePred && predictionsList.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/90 p-8 shadow-xs flex flex-col items-center justify-center text-center h-[340px]">
        <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-3">
          <BarChart3 className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-800">Downscaling Evaluation</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">
          Spatial disaggregation from coarse block input to localized Panchayat estimates.
          Select a Panchayat and click &ldquo;Calculate Downscaled Rainfall&rdquo; to populate comparative visual analytics.
        </p>
      </div>
    );
  }

  // Authentic KPI values
  const coarseInput = activePred?.baseline_block_rainfall ?? 0;
  const mlDownscaled = activePred?.prediction_mm ?? 0;
  const referenceTarget = activePred?.reference_target_rainfall_mm ?? 0;
  const spatialShift = mlDownscaled - coarseInput;
  const spatialShiftPct = coarseInput > 0 ? (spatialShift / coarseInput) * 100 : 0;
  const isPositiveShift = spatialShift >= 0;

  // Single Panchayat / Selected Focused Bar Data
  const singlePanchayatBarData = [
    {
      category: 'Coarse Input',
      rainfall_mm: Number(coarseInput.toFixed(2)),
      fill: '#64748b', // Slate
      sub: 'NASA POWER / MERRA-2',
    },
    {
      category: 'ML Downscaled',
      rainfall_mm: Number(mlDownscaled.toFixed(2)),
      fill: '#059669', // Emerald
      sub: 'XGBoost v0.1.0-alpha',
    },
    {
      category: 'Reference Target',
      rainfall_mm: Number(referenceTarget.toFixed(2)),
      fill: '#2563eb', // Weather Blue
      sub: 'ERA5-Land Proxy',
    },
  ];

  // Grouped multi-Panchayat Bar Data (when multiple panchayats evaluated)
  const multiBarData = predictionsList.map((p) => ({
    name: p.panchayat_name,
    id: p.panchayat_id,
    'Coarse Input': Number(p.baseline_block_rainfall.toFixed(2)),
    'ML Downscaled': Number(p.prediction_mm.toFixed(2)),
    'ERA5-Land Reference': Number(p.reference_target_rainfall_mm.toFixed(2)),
  }));

  // Authentic Category Distribution Donut Data (Calculated across evaluated Panchayats)
  const categoryCounts = {
    'Very Low': 0, // < 1 mm
    'Light': 0,    // 1 - <5 mm
    'Moderate': 0, // 5 - <20 mm
    'Heavy': 0,    // >= 20 mm
  };

  predictionsList.forEach((p) => {
    const val = p.prediction_mm;
    if (val < 1.0) categoryCounts['Very Low']++;
    else if (val < 5.0) categoryCounts['Light']++;
    else if (val < 20.0) categoryCounts['Moderate']++;
    else categoryCounts['Heavy']++;
  });

  const donutColors: Record<string, string> = {
    'Very Low': '#cbd5e1',
    'Light': '#93c5fd',
    'Moderate': '#3b82f6',
    'Heavy': '#1e40af',
  };

  const donutData = Object.entries(categoryCounts)
    .filter(([_, count]) => count > 0)
    .map(([category, count]) => ({
      name: category,
      value: count,
      color: donutColors[category] || '#64748b',
    }));

  const hasMultiPanchayats = predictionsList.length > 1;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4">
      {/* 1. Header: Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <span>Downscaling Evaluation</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Spatial disaggregation from coarse block input to localized Panchayat estimates
          </p>
        </div>

        {activePred && (
          <div className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg self-start sm:self-auto flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>Active: {activePred.panchayat_name} ({activePred.panchayat_id})</span>
          </div>
        )}
      </div>

      {/* 2. Compact KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {/* Coarse Input */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Coarse Input
          </span>
          <div className="flex items-baseline space-x-1">
            <span className="text-xl font-black text-slate-800 font-mono">
              {coarseInput.toFixed(2)}
            </span>
            <span className="text-xs font-medium text-slate-500">mm</span>
          </div>
          <span className="text-[10px] text-slate-400 block truncate">
            NASA POWER / MERRA-2
          </span>
        </div>

        {/* ML Downscaled */}
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 space-y-1">
          <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider block">
            ML Downscaled
          </span>
          <div className="flex items-baseline space-x-1">
            <span className="text-xl font-black text-emerald-950 font-mono">
              {mlDownscaled.toFixed(2)}
            </span>
            <span className="text-xs font-medium text-emerald-700">mm</span>
          </div>
          <span className="text-[10px] text-emerald-800/80 block truncate">
            XGBoost (Localized)
          </span>
        </div>

        {/* Reference Target */}
        <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-3 space-y-1">
          <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block">
            Reference Target
          </span>
          <div className="flex items-baseline space-x-1">
            <span className="text-xl font-black text-blue-950 font-mono">
              {referenceTarget.toFixed(2)}
            </span>
            <span className="text-xs font-medium text-blue-700">mm</span>
          </div>
          <span className="text-[10px] text-blue-800/80 block truncate">
            ERA5-Land Proxy
          </span>
        </div>

        {/* Prominent Spatial Shift Indicator */}
        <div className="bg-gradient-to-br from-slate-50 to-emerald-50/50 border border-slate-200/90 rounded-xl p-3 space-y-1">
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block flex items-center space-x-1">
            {isPositiveShift ? (
              <TrendingUp className="w-3 h-3 text-emerald-600" />
            ) : (
              <TrendingDown className="w-3 h-3 text-amber-600" />
            )}
            <span>Spatial Shift</span>
          </span>
          <div className="flex items-baseline space-x-1">
            <span className="text-xl font-black font-mono text-slate-900">
              {isPositiveShift ? '+' : ''}{spatialShift.toFixed(2)}
            </span>
            <span className="text-xs font-semibold text-slate-600">mm</span>
            <span className="text-[11px] font-mono text-emerald-700 font-semibold pl-1">
              ({isPositiveShift ? '+' : ''}{spatialShiftPct.toFixed(1)}%)
            </span>
          </div>
          <span className="text-[10px] text-slate-500 block truncate">
            ML Downscaled − Coarse Input
          </span>
        </div>
      </div>

      {/* 3. Main Visualization: Horizontal / Grouped Bar Comparison */}
      <div className={`grid grid-cols-1 ${hasMultiPanchayats ? 'lg:grid-cols-12' : ''} gap-4 pt-1`}>
        {/* Left/Main Column: Grouped Bar Chart */}
        <div className={hasMultiPanchayats ? 'lg:col-span-8' : 'w-full'}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {hasMultiPanchayats ? 'Multi-Panchayat Disaggregation Comparison (mm)' : 'Active Panchayat Comparison (mm)'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {predictionsList.length} Panchayat{predictionsList.length > 1 ? 's' : ''} Evaluated
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {hasMultiPanchayats ? (
                <BarChart data={multiBarData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#475569' }} interval={0} angle={-30} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11, fill: '#475569' }} unit="mm" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      color: '#fff',
                      borderRadius: '8px',
                      fontSize: '12px',
                      border: 'none',
                    }}
                    formatter={(value: any, name?: any) => [`${value} mm`, String(name || '')]}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="Coarse Input" fill="#64748b" radius={[3, 3, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="ML Downscaled" fill="#059669" radius={[3, 3, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="ERA5-Land Reference" fill="#2563eb" radius={[3, 3, 0, 0]} maxBarSize={28} />
                </BarChart>
              ) : (
                /* Focused Single Panchayat Bar Chart */
                <BarChart data={singlePanchayatBarData} layout="vertical" margin={{ top: 10, right: 25, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" unit="mm" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis dataKey="category" type="category" tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }} width={120} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      color: '#fff',
                      borderRadius: '8px',
                      fontSize: '12px',
                      border: 'none',
                    }}
                    formatter={(value: any) => [`${value} mm`, 'Rainfall']}
                  />
                  <Bar dataKey="rainfall_mm" radius={[0, 4, 4, 0]} maxBarSize={32}>
                    {singlePanchayatBarData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column (Optional Secondary Donut Chart): Rainfall Category Distribution */}
        {hasMultiPanchayats && donutData.length > 0 && (
          <div className="lg:col-span-4 bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-1.5 mb-1 text-slate-800">
                <PieIcon className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Rainfall Category Distribution
                </span>
              </div>
              <p className="text-[10px] text-slate-500">
                Authentic distribution of {predictionsList.length} evaluated Panchayats
              </p>
            </div>

            <div className="h-44 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`donut-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      color: '#fff',
                      borderRadius: '8px',
                      fontSize: '11px',
                      border: 'none',
                    }}
                    formatter={(value: any, name?: any) => [
                      `${value} Panchayats (${Math.round((Number(value) / predictionsList.length) * 100)}%)`,
                      String(name || ''),
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Centered Donut Summary */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-black text-slate-900 font-mono">
                  {predictionsList.length}
                </span>
                <span className="text-[9px] uppercase font-bold text-slate-400">
                  Locations
                </span>
              </div>
            </div>

            {/* Donut Legend */}
            <div className="grid grid-cols-2 gap-1 text-[10px] pt-1 border-t border-slate-200/60">
              {donutData.map((item) => (
                <div key={item.name} className="flex items-center space-x-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}: <strong className="font-mono text-slate-800">{item.value}</strong></span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. Concise Scientific Note */}
      <div className="pt-2.5 border-t border-slate-100 flex items-start space-x-2 text-[11px] text-slate-500 leading-relaxed">
        <Info className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
        <p>
          Coarse block input originates from NASA POWER / MERRA-2 (~50 km). Target reference is ERA5-Land (~0.1° reanalysis proxy), not physical rain gauges.
        </p>
      </div>
    </div>
  );
}
