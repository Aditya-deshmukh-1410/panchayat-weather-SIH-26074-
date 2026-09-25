'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from '../../components/dashboard/Header';
import PanchayatMap from '../../components/map/PanchayatMap';
import PanchayatSelector from '../../components/dashboard/PanchayatSelector';
import SelectedPanchayatPanel from '../../components/dashboard/SelectedPanchayatPanel';
import ComparisonChart from '../../components/dashboard/ComparisonChart';
import ExperimentContext from '../../components/dashboard/ExperimentContext';
import {
  fetchPanchayats,
  fetchPanchayatFeatures,
  runPredictionWithUncertainty,
} from '../../src/lib/api';
import {
  PanchayatCollection,
  PanchayatFeature,
  FeatureRecordResponse,
  PredictionWithUncertaintyResult,
} from '../../src/types';
import { AlertCircle, RefreshCw, BarChart3, Map as MapIcon } from 'lucide-react';

export default function DashboardPage() {
  const [panchayatsCollection, setPanchayatsCollection] = useState<PanchayatCollection | null>(null);
  const [selectedPanchayatId, setSelectedPanchayatId] = useState<string | null>('P01');
  const [panchayatsLoading, setPanchayatsLoading] = useState(true);
  const [panchayatsError, setPanchayatsError] = useState<string | null>(null);

  // Features state for selected Panchayat
  const [featuresData, setFeaturesData] = useState<FeatureRecordResponse | null>(null);
  const [featuresLoading, setFeaturesLoading] = useState(false);
  const [featuresError, setFeaturesError] = useState<string | null>(null);

  // Predictions state mapped by panchayat_id
  const [predictionsMap, setPredictionsMap] = useState<Record<string, PredictionWithUncertaintyResult>>({});
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predictionError, setPredictionError] = useState<string | null>(null);

  // Active view toggle in map container: 'map' or 'comparison'
  const [activeCenterView, setActiveCenterView] = useState<'map' | 'comparison'>('map');

  // Fixed authentic demonstration date from held-out evaluation set
  const [historicalDate] = useState('2024-09-01');

  // Ref to prevent duplicate batch evaluations
  const batchEvaluatedRef = useRef(false);

  // 1. Load Panchayats on mount and automatically evaluate authentic predictions
  const loadPanchayatsAndPredictions = useCallback(async () => {
    try {
      setPanchayatsLoading(true);
      setPanchayatsError(null);
      const data = await fetchPanchayats();
      setPanchayatsCollection(data);

      if (!selectedPanchayatId && data.features && data.features.length > 0) {
        setSelectedPanchayatId('P01');
      }

      // Batch evaluate authentic predictions for all 14 Panchayats on this date
      if (!batchEvaluatedRef.current && data.features && data.features.length > 0) {
        batchEvaluatedRef.current = true;
        const results = await Promise.allSettled(
          data.features.map(async (feat) => {
            const fRecord = await fetchPanchayatFeatures(feat.id, historicalDate);
            const metadata = {
              panchayat_id: fRecord.panchayat_id,
              panchayat_name: fRecord.panchayat_name,
              date: fRecord.date,
              baseline_block_rainfall: fRecord.baseline_block_rainfall,
              reference_target_rainfall_mm: fRecord.reference_target_rainfall_mm,
            };
            return runPredictionWithUncertainty(fRecord.features, metadata);
          })
        );

        const newMap: Record<string, PredictionWithUncertaintyResult> = {};
        results.forEach((res) => {
          if (res.status === 'fulfilled' && res.value) {
            newMap[res.value.panchayat_id] = res.value;
          }
        });

        setPredictionsMap((prev) => ({
          ...prev,
          ...newMap,
        }));
      }
    } catch (err: any) {
      setPanchayatsError(err.message || 'Failed to load Panchayat geographic boundaries.');
    } finally {
      setPanchayatsLoading(false);
    }
  }, [selectedPanchayatId, historicalDate]);

  useEffect(() => {
    loadPanchayatsAndPredictions();
  }, [loadPanchayatsAndPredictions]);

  // 2. Load verified features whenever selected Panchayat changes
  useEffect(() => {
    if (!selectedPanchayatId) {
      setFeaturesData(null);
      return;
    }

    let isMounted = true;
    const loadFeatures = async () => {
      try {
        setFeaturesLoading(true);
        setFeaturesError(null);
        setPredictionError(null);
        const data = await fetchPanchayatFeatures(selectedPanchayatId, historicalDate);
        if (isMounted) {
          setFeaturesData(data);
        }
      } catch (err: any) {
        if (isMounted) {
          setFeaturesError(err.message || 'Feature records unavailable for this Panchayat.');
          setFeaturesData(null);
        }
      } finally {
        if (isMounted) {
          setFeaturesLoading(false);
        }
      }
    };

    loadFeatures();

    return () => {
      isMounted = false;
    };
  }, [selectedPanchayatId, historicalDate]);

  // 3. Manual Execute ML downscaling for currently selected Panchayat (e.g. Retry or recalculate)
  const handleRunDownscaling = useCallback(async () => {
    if (!selectedPanchayatId || !featuresData) return;

    try {
      setPredictionLoading(true);
      setPredictionError(null);

      const metadata = {
        panchayat_id: featuresData.panchayat_id,
        panchayat_name: featuresData.panchayat_name,
        date: featuresData.date,
        baseline_block_rainfall: featuresData.baseline_block_rainfall,
        reference_target_rainfall_mm: featuresData.reference_target_rainfall_mm,
      };

      const result = await runPredictionWithUncertainty(featuresData.features, metadata);

      setPredictionsMap((prev) => ({
        ...prev,
        [selectedPanchayatId]: result,
      }));
    } catch (err: any) {
      setPredictionError(err.message || 'Prediction request failed.');
    } finally {
      setPredictionLoading(false);
    }
  }, [selectedPanchayatId, featuresData]);

  const selectedPanchayat: PanchayatFeature | null =
    panchayatsCollection?.features.find((f) => f.id === selectedPanchayatId) || null;

  const currentPrediction = selectedPanchayatId ? predictionsMap[selectedPanchayatId] || null : null;
  const allPredictionsList = Object.values(predictionsMap);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-slate-800 antialiased selection:bg-emerald-100 selection:text-emerald-900">
      {/* 1. Top Navigation */}
      <Header />

      {/* 2. Main Agricultural Workspace */}
      <main className="flex-1 w-full max-w-[1720px] mx-auto px-3 sm:px-4 lg:px-6 py-4 space-y-4">
        {/* Backend Error Alert if any */}
        {panchayatsError && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs sm:text-sm text-red-700 flex items-center justify-between shadow-2xs">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{panchayatsError}</span>
            </div>
            <button
              type="button"
              onClick={loadPanchayatsAndPredictions}
              className="text-xs bg-red-100 hover:bg-red-200 text-red-800 font-medium px-3 py-1 rounded-lg flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* =========================================================================
            DESKTOP WORKSPACE (1024px+): MAP-FIRST 3-PANE LAYOUT
            Left (280px): Panchayat Selector & Filter
            Center (Flex-1, 65-75% visual dominance): Interactive Map
            Right (380-420px): Selected Panchayat Detail Panel
            ========================================================================= */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-start min-h-[calc(100vh-120px)]">
          {/* Left Column: Compact Panchayat Navigation / Filter Panel (2.5 cols / ~280px) */}
          <div className="lg:col-span-3 xl:col-span-2 space-y-3 sticky top-20">
            <PanchayatSelector
              panchayats={panchayatsCollection?.features || []}
              selectedPanchayatId={selectedPanchayatId}
              predictionsMap={predictionsMap}
              onSelect={(id) => setSelectedPanchayatId(id)}
            />
          </div>

          {/* Center Column: Dominant Map Workspace (6.5 cols / ~65% width) */}
          <div className="lg:col-span-5 xl:col-span-6 flex flex-col space-y-3">
            {/* View Switcher Ribbon (Map vs Comparison Analytics) */}
            <div className="flex items-center justify-between bg-white border border-slate-200/90 rounded-xl px-3 py-2 shadow-2xs">
              <div className="flex items-center space-x-1 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveCenterView('map')}
                  className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    activeCenterView === 'map'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <MapIcon className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Spatial Map</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCenterView('comparison')}
                  className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    activeCenterView === 'comparison'
                      ? 'bg-blue-50 text-blue-800 border border-blue-200 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Downscaling Evaluation ({allPredictionsList.length}/14)</span>
                </button>
              </div>

              <div className="text-[11px] font-medium text-slate-500 hidden sm:block">
                <span>Hold-out test date: </span>
                <strong className="font-mono text-slate-700">{historicalDate}</strong>
              </div>
            </div>

            {/* Main Interactive Canvas */}
            <div className="w-full flex-1 min-h-[580px] xl:min-h-[680px]">
              {activeCenterView === 'map' ? (
                <PanchayatMap
                  panchayats={panchayatsCollection}
                  selectedPanchayatId={selectedPanchayatId}
                  predictionsMap={predictionsMap}
                  onSelectPanchayat={(id) => setSelectedPanchayatId(id)}
                  isLoading={panchayatsLoading}
                />
              ) : (
                <ComparisonChart
                  predictionsList={allPredictionsList}
                  selectedPrediction={currentPrediction}
                />
              )}
            </div>

            {/* Lower Context & Limitations Ribbon */}
            <ExperimentContext />
          </div>

          {/* Right Column: Selected Panchayat Detail Panel (4 cols / ~380-420px) */}
          <div className="lg:col-span-4 xl:col-span-4 space-y-4">
            <SelectedPanchayatPanel
              selectedPanchayat={selectedPanchayat}
              featuresData={featuresData}
              featuresLoading={featuresLoading}
              featuresError={featuresError}
              prediction={currentPrediction}
              predictionLoading={predictionLoading}
              predictionError={predictionError}
              onRunDownscaling={handleRunDownscaling}
              historicalDate={historicalDate}
            />
          </div>
        </div>

        {/* =========================================================================
            MOBILE & TABLET VIEW (<1024px): STRICT VERTICAL FLOW
            1. Header
            2. Panchayat selector
            3. Map
            4. Selected Panchayat summary & Rainfall
            5. Interval
            6. Advisory
            7. Weather context
            8. SHAP
            ========================================================================= */}
        <div className="lg:hidden space-y-4">
          {/* Step 2: Mobile Panchayat Selector */}
          <PanchayatSelector
            panchayats={panchayatsCollection?.features || []}
            selectedPanchayatId={selectedPanchayatId}
            predictionsMap={predictionsMap}
            onSelect={(id) => setSelectedPanchayatId(id)}
          />

          {/* Step 3: Interactive Map */}
          <div className="h-[380px] sm:h-[460px] w-full">
            <PanchayatMap
              panchayats={panchayatsCollection}
              selectedPanchayatId={selectedPanchayatId}
              predictionsMap={predictionsMap}
              onSelectPanchayat={(id) => setSelectedPanchayatId(id)}
              isLoading={panchayatsLoading}
            />
          </div>

          {/* Steps 4–8: Selected Panchayat Detail Stack */}
          <SelectedPanchayatPanel
            selectedPanchayat={selectedPanchayat}
            featuresData={featuresData}
            featuresLoading={featuresLoading}
            featuresError={featuresError}
            prediction={currentPrediction}
            predictionLoading={predictionLoading}
            predictionError={predictionError}
            onRunDownscaling={handleRunDownscaling}
            historicalDate={historicalDate}
          />

          {/* Comparative Analytics & Scientific Context */}
          {allPredictionsList.length > 0 && (
            <ComparisonChart
              predictionsList={allPredictionsList}
              selectedPrediction={currentPrediction}
            />
          )}

          <ExperimentContext />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-4 mt-6">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <p>Smart India Hackathon (SIH 2026) · Panchayat Weather Intelligence System</p>
          <p className="font-mono text-[11px] text-slate-400">
            Next.js 14 · NestJS Gateway · FastAPI XGBoost · Conformal Uncertainty
          </p>
        </div>
      </footer>
    </div>
  );
}
