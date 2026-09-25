'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CloudRain, ArrowRight, Menu, X, MapPin } from 'lucide-react';

export default function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#FAF9F5]/95 backdrop-blur-md border-b border-stone-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white shadow-xs group-hover:bg-emerald-800 transition-colors flex-shrink-0">
              <CloudRain className="w-4 h-4 text-emerald-100" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-stone-900 tracking-tight text-sm sm:text-base leading-tight">
                Panchayat Weather Intelligence
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                SIH 2026
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-stone-600">
            <Link href="/" className="text-stone-900 hover:text-emerald-700 transition-colors">
              Overview
            </Link>
            <Link href="/dashboard" className="text-stone-600 hover:text-emerald-700 transition-colors">
              Dashboard
            </Link>
          </nav>

          {/* Right Scope Badge & Primary CTA */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="flex items-center space-x-1.5 text-[11px] text-stone-500 font-medium border-r border-stone-200 pr-4">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Baramati Block · Pune · Maharashtra</span>
              <span className="text-stone-300">|</span>
              <span className="font-semibold text-stone-700">14 Gram Panchayats</span>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex items-center space-x-1.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-xs hover:shadow transition-all"
            >
              <span>Explore Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Actions */}
          <div className="flex lg:hidden items-center space-x-2">
            <Link
              href="/dashboard"
              className="bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
            >
              Dashboard
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 focus:outline-none"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-[#FAF9F5] px-4 pt-3 pb-4 space-y-2 animate-in slide-in-from-top duration-200 shadow-lg">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-stone-900 hover:bg-stone-100 rounded-lg"
          >
            Overview
          </Link>
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 rounded-lg"
          >
            Dashboard
          </Link>
          <div className="pt-2 border-t border-stone-200 text-xs text-stone-500 px-3">
            <p>Baramati Block · Pune · Maharashtra</p>
            <p className="font-semibold text-stone-700 mt-0.5">14 Gram Panchayats</p>
          </div>
        </div>
      )}
    </header>
  );
}
