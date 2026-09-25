'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { PanchayatCollection, PredictionWithUncertaintyResult } from '../../src/types';
import { Layers, RotateCcw, Plus, Minus, MapPin } from 'lucide-react';

interface PanchayatMapProps {
  panchayats: PanchayatCollection | null;
  selectedPanchayatId: string | null;
  predictionsMap: Record<string, PredictionWithUncertaintyResult>;
  onSelectPanchayat: (panchayatId: string) => void;
  isLoading: boolean;
  className?: string;
}

export default function PanchayatMap({
  panchayats,
  selectedPanchayatId,
  predictionsMap,
  onSelectPanchayat,
  isLoading,
  className = '',
}: PanchayatMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [hoveredPanchayat, setHoveredPanchayat] = useState<{
    name: string;
    id: string;
    prediction_mm?: number;
    area_sqkm: number;
    elevation_m: number;
  } | null>(null);

  // Initialize MapLibre Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap contributors',
          },
        },
        layers: [
          {
            id: 'background',
            type: 'background',
            paint: { 'background-color': '#f8fafc' },
          },
          {
            id: 'osm-layer',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 18,
            paint: {
              'raster-opacity': 0.65,
              'raster-saturation': -0.35,
            },
          },
        ],
      },
      center: [74.5807, 18.1517], // Baramati Block centroid
      zoom: 9.8,
      minZoom: 8,
      maxZoom: 16,
    });

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: true, showZoom: false }),
      'top-right'
    );

    map.on('load', () => {
      setMapLoaded(true);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Sync Polygons, Centroids, and Layers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !panchayats) return;

    // 1. Enrich Polygon GeoJSON (All 14 Panchayats)
    const enrichedFeatures = panchayats.features.map((f) => {
      const pred = predictionsMap[f.id];
      const isSelected = f.id === selectedPanchayatId;
      return {
        ...f,
        properties: {
          ...f.properties,
          has_prediction: !!pred,
          prediction_mm: pred ? pred.prediction_mm : null,
          is_selected: isSelected,
        },
      };
    });

    const enrichedGeojson: PanchayatCollection = {
      ...panchayats,
      features: enrichedFeatures,
    };

    // 2. Generate Centroids GeoJSON (All 14 Panchayats)
    const centroidFeatures: any[] = panchayats.features.map((f) => {
      const pred = predictionsMap[f.id];
      const isSelected = f.id === selectedPanchayatId;
      return {
        type: 'Feature',
        id: `centroid-${f.id}`,
        geometry: {
          type: 'Point',
          coordinates: [f.properties.longitude, f.properties.latitude],
        },
        properties: {
          id: f.id,
          name: f.properties.name,
          label: `${f.properties.name} (${f.id})`,
          area_sqkm: f.properties.area_sqkm,
          elevation_m: f.properties.elevation_m,
          has_prediction: !!pred,
          prediction_mm: pred ? pred.prediction_mm : null,
          is_selected: isSelected,
        },
      };
    });

    const centroidsGeojson = {
      type: 'FeatureCollection',
      features: centroidFeatures,
    };

    // 3. Dedicated GeoJSON for Selected Polygon (guarantees top z-index & zero edge clipping)
    const selectedFeature = panchayats.features.find(
      (f) =>
        f.id === selectedPanchayatId ||
        f.id.toUpperCase() === selectedPanchayatId?.toUpperCase() ||
        f.properties?.id === selectedPanchayatId ||
        f.properties?.id?.toUpperCase() === selectedPanchayatId?.toUpperCase()
    );

    const selectedPolygonGeojson = {
      type: 'FeatureCollection',
      features: selectedFeature
        ? [
            {
              ...selectedFeature,
              properties: {
                ...selectedFeature.properties,
                prediction_mm: predictionsMap[selectedFeature.id]?.prediction_mm ?? null,
                is_selected: true,
              },
            },
          ]
        : [],
    };

    // Diagnostics inspection check
    if (selectedFeature) {
      console.log('[PanchayatMap] selectedPanchayat.id:', selectedFeature.id);
      console.log('[PanchayatMap] selectedPanchayat.geometry:', selectedFeature.geometry);
      console.log('[PanchayatMap] selected-panchayat-source GeoJSON features count:', selectedPolygonGeojson.features.length);
    }

    // 4. Dedicated GeoJSON for Selected Centroid
    const selectedCentroidFeature = centroidFeatures.find(
      (c) =>
        c.properties.id === selectedPanchayatId ||
        c.properties.id.toUpperCase() === selectedPanchayatId?.toUpperCase()
    );
    const selectedCentroidGeojson = {
      type: 'FeatureCollection',
      features: selectedCentroidFeature ? [selectedCentroidFeature] : [],
    };

    const polySource = map.getSource('panchayats-source') as maplibregl.GeoJSONSource;
    const centroidSource = map.getSource('panchayats-centroids-source') as maplibregl.GeoJSONSource;
    const selectedPolySource = map.getSource('selected-panchayat-source') as maplibregl.GeoJSONSource;
    const selectedCentroidSource = map.getSource('selected-centroid-source') as maplibregl.GeoJSONSource;

    if (!polySource) {
      // Add Base Sources
      map.addSource('panchayats-source', {
        type: 'geojson',
        data: enrichedGeojson as any,
      });

      map.addSource('panchayats-centroids-source', {
        type: 'geojson',
        data: centroidsGeojson as any,
      });

      // Add Dedicated Selected Sources
      map.addSource('selected-panchayat-source', {
        type: 'geojson',
        data: selectedPolygonGeojson as any,
      });

      map.addSource('selected-centroid-source', {
        type: 'geojson',
        data: selectedCentroidGeojson as any,
      });

      // Layer 1: Base Polygon Fill Layer (All Panchayats - Muted)
      map.addLayer({
        id: 'panchayats-fill',
        type: 'fill',
        source: 'panchayats-source',
        paint: {
          'fill-color': [
            'case',
            ['boolean', ['get', 'has_prediction'], false],
            [
              'step',
              ['get', 'prediction_mm'],
              '#cbd5e1', // < 1 mm (Very low)
              1,
              '#93c5fd', // 1 - <5 mm (Light)
              5,
              '#3b82f6', // 5 - <20 mm (Moderate)
              20,
              '#1e40af', // >= 20 mm (Heavy)
            ],
            '#94a3b8', // Normal unevaluated Panchayat
          ],
          'fill-opacity': [
            'case',
            ['boolean', ['get', 'has_prediction'], false],
            0.22, // Muted so selected Panchayat visually dominates
            0.08,
          ],
        },
      });

      // Layer 2: Base Polygon Boundary Outline Layer (Subtle Neutral Slate)
      map.addLayer({
        id: 'panchayats-outline',
        type: 'line',
        source: 'panchayats-source',
        paint: {
          'line-color': '#64748b',
          'line-width': 1.2,
          'line-opacity': 0.45,
        },
      });

      // Layer 3: Selected Panchayat Fill Layer (Prominent 28% Emerald Fill)
      map.addLayer({
        id: 'selected-panchayat-fill',
        type: 'fill',
        source: 'selected-panchayat-source',
        paint: {
          'fill-color': '#059669',
          'fill-opacity': 0.28,
        },
      });

      // Layer 4: Selected Panchayat Outer Glow / Halo (Luminous Emerald)
      map.addLayer({
        id: 'selected-panchayat-glow',
        type: 'line',
        source: 'selected-panchayat-source',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#10b981',
          'line-width': 8.0,
          'line-opacity': 0.45,
          'line-blur': 2.5,
        },
      });

      // Layer 5: Selected Panchayat Boundary (Strong 4px Solid Emerald Outline)
      map.addLayer({
        id: 'selected-panchayat-outline',
        type: 'line',
        source: 'selected-panchayat-source',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#047857',
          'line-width': 4.0,
          'line-opacity': 1.0,
        },
      });

      // Layer 6: Base Centroid Circle Markers
      map.addLayer({
        id: 'panchayats-centroid-circle',
        type: 'circle',
        source: 'panchayats-centroids-source',
        paint: {
          'circle-radius': 4.0,
          'circle-color': '#64748b',
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#ffffff',
        },
      });

      // Layer 7: Base Centroid Labels (Name)
      map.addLayer({
        id: 'panchayats-centroid-label',
        type: 'symbol',
        source: 'panchayats-centroids-source',
        minzoom: 9.0,
        layout: {
          'text-field': ['get', 'name'],
          'text-size': 10.5,
          'text-offset': [0, 1.2],
          'text-anchor': 'top',
          'text-allow-overlap': false,
          'text-optional': true,
        },
        paint: {
          'text-color': '#334155',
          'text-halo-color': '#ffffff',
          'text-halo-width': 2.0,
          'text-halo-blur': 0.5,
        },
      });

      // Layer 8: Selected Centroid Outer Halo Pulse
      map.addLayer({
        id: 'selected-centroid-halo',
        type: 'circle',
        source: 'selected-centroid-source',
        paint: {
          'circle-radius': 14,
          'circle-color': '#10b981',
          'circle-opacity': 0.35,
        },
      });

      // Layer 9: Selected Centroid Circle (Enlarged Emerald with White Stroke)
      map.addLayer({
        id: 'selected-centroid-circle',
        type: 'circle',
        source: 'selected-centroid-source',
        paint: {
          'circle-radius': 8.0,
          'circle-color': '#047857',
          'circle-stroke-width': 3.0,
          'circle-stroke-color': '#ffffff',
        },
      });

      // Layer 10: Selected Centroid Label (Prominent Emerald)
      map.addLayer({
        id: 'selected-centroid-label',
        type: 'symbol',
        source: 'selected-centroid-source',
        layout: {
          'text-field': ['get', 'name'],
          'text-size': 12.5,
          'text-offset': [0, 1.3],
          'text-anchor': 'top',
          'text-allow-overlap': true,
        },
        paint: {
          'text-color': '#064e3b',
          'text-halo-color': '#ffffff',
          'text-halo-width': 2.5,
          'text-halo-blur': 0.5,
        },
      });

      // Click on Base or Selected Polygon
      const handlePolygonClick = (e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => {
        if (e.features && e.features.length > 0) {
          const clickedId = e.features[0].properties?.id;
          if (clickedId) onSelectPanchayat(clickedId);
        }
      };

      map.on('click', 'panchayats-fill', handlePolygonClick);
      map.on('click', 'selected-panchayat-fill', handlePolygonClick);
      map.on('click', 'panchayats-centroid-circle', handlePolygonClick);
      map.on('click', 'selected-centroid-circle', handlePolygonClick);
      map.on('click', 'panchayats-centroid-label', handlePolygonClick);
      map.on('click', 'selected-centroid-label', handlePolygonClick);

      // Hover on Polygon or Centroid
      const handleMouseMove = (e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => {
        if (e.features && e.features.length > 0) {
          map.getCanvas().style.cursor = 'pointer';
          const p = e.features[0].properties;
          const pred = predictionsMap[p.id];
          setHoveredPanchayat({
            id: p.id,
            name: p.name,
            prediction_mm: pred?.prediction_mm,
            area_sqkm: Number(p.area_sqkm),
            elevation_m: Number(p.elevation_m),
          });
        }
      };

      map.on('mousemove', 'panchayats-fill', handleMouseMove);
      map.on('mousemove', 'selected-panchayat-fill', handleMouseMove);
      map.on('mousemove', 'panchayats-centroid-circle', handleMouseMove);
      map.on('mousemove', 'selected-centroid-circle', handleMouseMove);

      const handleMouseLeave = () => {
        map.getCanvas().style.cursor = '';
        setHoveredPanchayat(null);
      };

      map.on('mouseleave', 'panchayats-fill', handleMouseLeave);
      map.on('mouseleave', 'selected-panchayat-fill', handleMouseLeave);
      map.on('mouseleave', 'panchayats-centroid-circle', handleMouseLeave);
      map.on('mouseleave', 'selected-centroid-circle', handleMouseLeave);

      map.once('idle', () => {
        const rendered = map.queryRenderedFeatures({ layers: ['selected-panchayat-fill'] });
        console.log('[PanchayatMap] initial selected-panchayat-fill rendered feature count:', rendered.length);
      });
    } else {
      // Dynamic updates on existing sources
      polySource.setData(enrichedGeojson as any);
      if (centroidSource) centroidSource.setData(centroidsGeojson as any);
      if (selectedPolySource) selectedPolySource.setData(selectedPolygonGeojson as any);
      if (selectedCentroidSource) selectedCentroidSource.setData(selectedCentroidGeojson as any);

      map.once('idle', () => {
        const rendered = map.queryRenderedFeatures({ layers: ['selected-panchayat-fill'] });
        console.log('[PanchayatMap] updated selected-panchayat-fill rendered feature count:', rendered.length);
      });
    }
  }, [panchayats, selectedPanchayatId, predictionsMap, mapLoaded, onSelectPanchayat]);

  // Smooth FlyTo / FitBounds when Selected Panchayat Changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !panchayats || !selectedPanchayatId) return;

    const selectedFeature = panchayats.features.find(
      (f) =>
        f.id === selectedPanchayatId ||
        f.id.toUpperCase() === selectedPanchayatId.toUpperCase() ||
        f.properties?.id === selectedPanchayatId ||
        f.properties?.id?.toUpperCase() === selectedPanchayatId.toUpperCase()
    );
    if (!selectedFeature) return;

    try {
      const bounds = new maplibregl.LngLatBounds();
      const coords = selectedFeature.geometry.coordinates;
      const flatten = (arr: any[]): [number, number][] => {
        if (typeof arr[0] === 'number') return [arr as [number, number]];
        return arr.flatMap(flatten);
      };
      flatten(coords).forEach(([lon, lat]) => bounds.extend([lon, lat]));

      // Fly and fit to bounds without zooming excessively close (maxZoom: 12.0)
      map.fitBounds(bounds, {
        padding: 90,
        maxZoom: 12.0,
        duration: 900,
      });
    } catch (err) {
      console.warn('Could not fit bounds to selected feature:', err);
    }
  }, [selectedPanchayatId, panchayats, mapLoaded]);

  // Reset to full Baramati block bounds
  const handleResetView = useCallback(() => {
    if (!mapRef.current || !panchayats) return;
    try {
      const bounds = new maplibregl.LngLatBounds();
      panchayats.features.forEach((feat) => {
        const coords = feat.geometry.coordinates;
        const flatten = (arr: any[]): [number, number][] => {
          if (typeof arr[0] === 'number') return [arr as [number, number]];
          return arr.flatMap(flatten);
        };
        flatten(coords).forEach(([lon, lat]) => bounds.extend([lon, lat]));
      });
      mapRef.current.fitBounds(bounds, { padding: 45, maxZoom: 11.5, duration: 800 });
    } catch {
      mapRef.current.flyTo({ center: [74.5807, 18.1517], zoom: 9.8, duration: 800 });
    }
  }, [panchayats]);

  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();

  const selectedFeature = panchayats?.features.find((f) => f.id === selectedPanchayatId) || null;
  const selectedPrediction = selectedPanchayatId ? predictionsMap[selectedPanchayatId] : null;

  return (
    <div
      className={`relative w-full h-full min-h-[440px] lg:min-h-[580px] bg-slate-100 rounded-xl overflow-hidden border border-slate-200/90 shadow-sm flex flex-col ${className}`}
    >
      {/* Top Left: Agricultural Workspace Badge */}
      <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200/90 shadow-xs flex items-center space-x-2 text-xs">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
        <span className="font-semibold text-slate-800">Baramati Block</span>
        <span className="text-slate-300">|</span>
        <span className="text-slate-600">14 Gram Panchayats (PostGIS)</span>
      </div>

      {/* Selected Panchayat Status Pill */}
      {selectedFeature && (
        <div className="absolute top-12 left-3 z-10 bg-emerald-700 text-white px-3 py-1 rounded-md border border-emerald-600 shadow-xs flex items-center space-x-2 text-xs font-medium animate-in fade-in duration-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
          <span>
            Selected: <strong className="text-white">{selectedFeature.properties.name}</strong> ({selectedFeature.id})
          </span>
          <span className="text-emerald-200 text-[11px]">
            · {selectedFeature.properties.elevation_m}m · {selectedFeature.properties.area_sqkm} km²
          </span>
          {selectedPrediction && (
            <span className="bg-emerald-900/80 text-emerald-200 font-mono text-[11px] px-1.5 py-0.2 rounded border border-emerald-500/40">
              {selectedPrediction.prediction_mm.toFixed(2)} mm
            </span>
          )}
        </div>
      )}

      {/* Map Control Buttons (Zoom & Reset) */}
      <div className="absolute bottom-4 left-3 z-10 flex flex-col space-y-1.5">
        <div className="bg-white/95 backdrop-blur-md rounded-lg border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors border-b border-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
            title="Zoom In"
            aria-label="Zoom in on map"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
            title="Zoom Out"
            aria-label="Zoom out on map"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleResetView}
          className="bg-white/95 hover:bg-white text-slate-700 hover:text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-sm text-xs font-medium flex items-center space-x-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
          title="Reset Map to Block View"
          aria-label="Reset Map to Baramati Block"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
          <span>Reset View</span>
        </button>
      </div>

      {/* Hover Info Tooltip */}
      {hoveredPanchayat && (
        <div className="absolute top-20 right-3 z-10 bg-slate-900/90 text-white px-3.5 py-2.5 rounded-lg text-xs shadow-md pointer-events-none max-w-xs backdrop-blur-sm border border-slate-800 animate-in fade-in duration-150">
          <p className="font-semibold text-sm text-white flex items-center justify-between">
            <span>{hoveredPanchayat.name}</span>
            <span className="text-emerald-400 font-mono text-[11px]">({hoveredPanchayat.id})</span>
          </p>
          <div className="mt-1 grid grid-cols-2 gap-x-2 gap-y-0.5 text-slate-300 text-[11px]">
            <span>Elevation: {hoveredPanchayat.elevation_m} m</span>
            <span>Area: {hoveredPanchayat.area_sqkm} km²</span>
          </div>
          <div className="mt-1.5 pt-1.5 border-t border-slate-700 text-slate-200 text-xs">
            {hoveredPanchayat.prediction_mm !== undefined ? (
              <span className="text-blue-300 font-semibold font-mono">
                Downscaled: {hoveredPanchayat.prediction_mm.toFixed(2)} mm
              </span>
            ) : (
              <span className="text-slate-400 italic text-[11px]">Unevaluated · Click to inspect</span>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Map Legend: Boundaries, Selection & Deterministic Categories */}
      <div className="absolute bottom-4 right-3 z-10 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-sm text-[11px] text-slate-700 space-y-2 max-w-[270px]">
        {/* Symbol Key */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 text-[10px]">
          <span className="flex items-center space-x-1.5 font-semibold text-slate-800">
            <span className="w-2.5 h-1.5 border-b-2 border-slate-500 inline-block" />
            <span>Boundary</span>
          </span>
          <span className="flex items-center space-x-1.5 font-semibold text-emerald-800">
            <span className="w-2.5 h-1.5 border-b-2 border-emerald-600 inline-block" />
            <span>Selected</span>
          </span>
          <span className="flex items-center space-x-1 text-slate-600">
            <span className="w-2 h-2 rounded-full bg-slate-600 inline-block" />
            <span>Centroid</span>
          </span>
        </div>

        {/* Rainfall Signal Scale */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-slate-900 flex items-center space-x-1 text-[10px] uppercase tracking-wider">
              <Layers className="w-3 h-3 text-emerald-600" />
              <span>Rainfall Signal (mm)</span>
            </span>
            <span className="text-[9px] text-slate-400 font-mono">Deterministic</span>
          </div>
          <div className="grid grid-cols-4 gap-1 text-center">
            <div>
              <div className="h-2 rounded bg-slate-200 border border-slate-300" />
              <span className="text-[9px] text-slate-700 mt-0.5 block font-semibold">&lt;1</span>
              <span className="text-[8px] text-slate-400 block">Low</span>
            </div>
            <div>
              <div className="h-2 rounded bg-[#93c5fd]" />
              <span className="text-[9px] text-slate-700 mt-0.5 block font-semibold">1–&lt;5</span>
              <span className="text-[8px] text-slate-400 block">Light</span>
            </div>
            <div>
              <div className="h-2 rounded bg-[#3b82f6]" />
              <span className="text-[9px] text-slate-700 mt-0.5 block font-semibold">5–&lt;20</span>
              <span className="text-[8px] text-slate-400 block">Moderate</span>
            </div>
            <div>
              <div className="h-2 rounded bg-[#1e40af]" />
              <span className="text-[9px] text-slate-700 mt-0.5 block font-semibold">≥20</span>
              <span className="text-[8px] text-slate-400 block">Heavy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-20 flex items-center justify-center">
          <div className="bg-white px-4 py-3 rounded-xl shadow-lg border border-slate-200 flex items-center space-x-3">
            <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-slate-700">Loading spatial Panchayat geometry...</span>
          </div>
        </div>
      )}

      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[440px] lg:min-h-[580px]" />
    </div>
  );
}
