import React from 'react';
import LandingHeader from '../components/landing/LandingHeader';
import HeroSection from '../components/landing/HeroSection';
import TransformationSection from '../components/landing/TransformationSection';
import CapabilitiesSection from '../components/landing/CapabilitiesSection';
import ResultsSection from '../components/landing/ResultsSection';
import ResponsibleSection from '../components/landing/ResponsibleSection';
import StudyAreaSection from '../components/landing/StudyAreaSection';
import FinalCtaSection from '../components/landing/FinalCtaSection';
import LandingFooter from '../components/landing/LandingFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F5] flex flex-col font-sans text-stone-800 antialiased selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navigation */}
      <LandingHeader />

      <main className="flex-1">
        {/* Section 1: Hero & Large Product Visual */}
        <HeroSection />

        {/* Section 2: Product Transformation Flow (Coarse to Local) */}
        <TransformationSection />

        {/* Section 3: Product Capabilities Showcase (4 Cards) */}
        <CapabilitiesSection />

        {/* Section 4: Results on Held-Out Test Partition */}
        <ResultsSection />

        {/* Section 5: Responsible Intelligence & Calibrated Boundaries */}
        <ResponsibleSection />

        {/* Section 6: Study Area (Baramati Block - 14 Panchayats) */}
        <StudyAreaSection />

        {/* Section 7: Final Call to Action */}
        <FinalCtaSection />
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
