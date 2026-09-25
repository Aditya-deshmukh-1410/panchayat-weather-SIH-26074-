'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, CloudRain } from 'lucide-react';
import { useScrollReveal } from '../../src/lib/useScrollReveal';

export default function FinalCtaSection() {
  const { ref, isVisible, isReducedMotion } = useScrollReveal({ threshold: 0.2 });

  return (
    <section
      ref={ref}
      className="py-20 md:py-28 bg-[#FAF9F5] border-b border-stone-200/80 text-center relative overflow-hidden"
    >
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Agritech Icon Pill */}
        <div
          className={`w-12 h-12 rounded-2xl bg-emerald-700 flex items-center justify-center mx-auto text-white shadow-md shadow-emerald-900/10 transition-all duration-600 ease-out ${
            isVisible || isReducedMotion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}
        >
          <CloudRain className="w-6 h-6 text-emerald-100" />
        </div>

        {/* Headline */}
        <h2
          className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-stone-900 leading-tight transition-all duration-600 ease-out delay-75 ${
            isVisible || isReducedMotion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}
        >
          Explore Panchayat-level weather intelligence.
        </h2>

        {/* Supporting Sentence */}
        <p
          className={`text-sm sm:text-base text-stone-600 max-w-xl mx-auto leading-relaxed font-normal transition-all duration-600 ease-out delay-150 ${
            isVisible || isReducedMotion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}
        >
          Explore localized rainfall estimates, calibrated uncertainty, advisory insights, and model explanations.
        </p>

        {/* Primary CTA */}
        <div
          className={`pt-2 flex items-center justify-center transition-all duration-600 ease-out delay-200 ${
            isVisible || isReducedMotion ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center space-x-2 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold px-9 py-4 rounded-xl shadow-md shadow-emerald-900/10 hover:shadow-lg transition-all text-sm group"
          >
            <span>Open Dashboard</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Minimal Scope Footer Note */}
        <div
          className={`pt-4 flex items-center justify-center space-x-3 text-xs text-stone-400 transition-all duration-600 ease-out delay-250 ${
            isVisible || isReducedMotion ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <span>Baramati Block</span>
          <span>·</span>
          <span>14 Gram Panchayats</span>
          <span>·</span>
          <span>Smart India Hackathon 2026</span>
        </div>
      </div>
    </section>
  );
}
