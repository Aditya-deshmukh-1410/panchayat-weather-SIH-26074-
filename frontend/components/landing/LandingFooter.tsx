'use client';

import React from 'react';
import Link from 'next/link';
import { CloudRain } from 'lucide-react';
import { useScrollReveal } from '../../src/lib/useScrollReveal';

export default function LandingFooter() {
  const { ref, isVisible, isReducedMotion } = useScrollReveal({ threshold: 0.1 });

  return (
    <footer
      ref={ref}
      className={`bg-[#FAF9F5] border-t border-stone-200/80 py-12 text-stone-600 text-xs transition-opacity duration-700 ease-out ${
        isVisible || isReducedMotion ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Brand Info */}
          <div className="space-y-2 max-w-sm">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-700 flex items-center justify-center text-white shadow-2xs">
                <CloudRain className="w-4 h-4 text-emerald-100" />
              </div>
              <span className="font-bold text-stone-900 text-sm tracking-tight">
                Panchayat Weather Intelligence
              </span>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed font-normal">
              Spatial downscaling prototype for Panchayat-level agricultural decision support. Developed for Smart India Hackathon (SIH 2026).
            </p>
          </div>

          {/* Clean Navigation Links */}
          <div className="flex flex-wrap gap-x-8 gap-y-2 text-xs font-semibold text-stone-600">
            <Link href="/" className="hover:text-emerald-700 transition-colors">
              Overview
            </Link>
            <Link href="/dashboard" className="hover:text-emerald-700 transition-colors">
              Dashboard
            </Link>
          </div>
        </div>

        {/* Disclaimer & Stack Attribution */}
        <div className="pt-6 border-t border-stone-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] text-stone-400">
          <p>
            <strong>Scientific Transparency:</strong> Retrospective downscaling research prototype. Not an official IMD operational forecast. Evaluated against ERA5-Land reference proxy for Baramati Block, Pune, Maharashtra.
          </p>
          <p className="font-mono flex-shrink-0 text-stone-500">
            Next.js · NestJS · FastAPI · XGBoost
          </p>
        </div>
      </div>
    </footer>
  );
}
