'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface MetricItem {
  target: number;
  decimals: number;
  suffix: string;
  exactFinal: string;
  label: string;
  sub: string;
  detail: string;
  color: string;
}

const METRICS_DATA: MetricItem[] = [
  {
    target: 23.72,
    decimals: 2,
    suffix: '%',
    exactFinal: '23.72%',
    label: 'RMSE reduction',
    sub: 'vs coarse baseline proxy',
    detail: 'Root Mean Squared Error improvement on held-out test partition',
    color: 'text-emerald-700',
  },
  {
    target: 8.73,
    decimals: 2,
    suffix: '%',
    exactFinal: '8.73%',
    label: 'MAE reduction',
    sub: 'vs coarse baseline proxy',
    detail: 'Mean Absolute Error reduction across chronological evaluations',
    color: 'text-blue-700',
  },
  {
    target: 0.358,
    decimals: 3,
    suffix: '',
    exactFinal: '0.358',
    label: 'Test-set R²',
    sub: 'vs -0.104 baseline',
    detail: 'Empirical variance explained on held-out September–December 2024 set',
    color: 'text-indigo-700',
  },
  {
    target: 14,
    decimals: 0,
    suffix: '',
    exactFinal: '14',
    label: 'Gram Panchayats',
    sub: 'evaluated micro-regions',
    detail: 'Spatially delineated administrative polygons across Baramati Block',
    color: 'text-stone-900',
  },
  {
    target: 731,
    decimals: 0,
    suffix: '',
    exactFinal: '731',
    label: 'Daily observations',
    sub: 'per Panchayat (2023–2024)',
    detail: 'Chronological multi-year empirical dataset per spatial unit',
    color: 'text-stone-900',
  },
];

export default function ResultsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [displayValues, setDisplayValues] = useState<string[]>(() =>
    METRICS_DATA.map((m) => m.exactFinal)
  );
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    // 1. Accessibility check for prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setIsReducedMotion(true);
      setIsVisible(true);
      return;
    }

    // 2. Prepare initial zeroed display values for count-up
    setDisplayValues(METRICS_DATA.map((m) => (0).toFixed(m.decimals) + m.suffix));

    // 3. Scroll Reveal via IntersectionObserver (triggers once)
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimatedRef.current) {
          hasAnimatedRef.current = true;
          setIsVisible(true);
          observer.disconnect();

          // 4. Smooth Count-Up Animation (900–1100ms with cubic ease-out)
          const startTime = performance.now();
          const duration = 1050; // ms

          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Cubic ease-out: smooth decelerating arrival
            const ease = 1 - Math.pow(1 - progress, 3);

            setDisplayValues(
              METRICS_DATA.map((m) => {
                const currentVal = m.target * ease;
                return currentVal.toFixed(m.decimals) + m.suffix;
              })
            );

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              // Guarantee 100% exact verified final values in the DOM
              setDisplayValues(METRICS_DATA.map((m) => m.exactFinal));
            }
          };

          requestAnimationFrame(animate);
        }
      },
      {
        threshold: 0.2, // Trigger when 20% of section enters viewport
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-16 md:py-24 bg-[#FAF9F5] border-b border-stone-200/80 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header: Minimal & Product-First with Scroll Reveal */}
        <div
          className={`max-w-3xl mx-auto text-center space-y-3 mb-12 md:mb-16 transition-all duration-700 ease-out ${
            isVisible || isReducedMotion
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-3'
          }`}
        >
          <div className="inline-flex items-center space-x-2 bg-stone-100 border border-stone-200/90 px-3.5 py-1 rounded-full text-xs font-semibold text-stone-700">
            <span>Held-out test · Sep–Dec 2024</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight">
            Evaluated on a held-out period.
          </h2>
          <p className="text-sm sm:text-base text-stone-500 font-normal">
            Quantified against the ERA5-Land reference proxy across chronological held-out test partitions.
          </p>
        </div>

        {/* Horizontal Metrics Grid with Staggered Entrance & Subtle Hover */}
        <div
          className={`grid grid-cols-2 md:grid-cols-5 gap-4 lg:gap-6 transition-all duration-700 ease-out delay-100 ${
            isVisible || isReducedMotion
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-3'
          }`}
        >
          {METRICS_DATA.map((m, idx) => (
            <div
              key={m.label}
              className={`bg-white border border-stone-200/90 rounded-2xl md:rounded-3xl p-5 sm:p-6 shadow-xs hover:border-stone-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between ${
                idx === 4 ? 'col-span-2 md:col-span-1' : ''
              }`}
            >
              <div className="space-y-2">
                {/* Animated Count-Up Numeric Focal Point */}
                <span
                  className={`text-3xl sm:text-4xl lg:text-5xl font-black font-mono tabular-nums tracking-tight block ${m.color}`}
                >
                  {displayValues[idx] ?? m.exactFinal}
                </span>

                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-stone-900 leading-snug">
                    {m.label}
                  </h3>
                  <span className="text-[11px] text-stone-500 font-medium block">
                    {m.sub}
                  </span>
                </div>
              </div>

              {/* Static Explanatory Text */}
              <div className="pt-3 mt-4 border-t border-stone-100 text-[10px] text-stone-400 font-normal leading-tight">
                {m.detail}
              </div>
            </div>
          ))}
        </div>

        {/* Factual Scope Banner with Entrance Reveal */}
        <div
          className={`mt-8 bg-white border border-stone-200/90 rounded-xl p-4 max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500 transition-all duration-700 ease-out delay-200 ${
            isVisible || isReducedMotion
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-3'
          }`}
        >
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Factual statistical metrics evaluated on held-out test partitions (Sep–Dec 2024).</span>
          </div>
          <span className="text-[11px] font-mono text-stone-400">Baramati Block · 14 Panchayats</span>
        </div>
      </div>
    </section>
  );
}
