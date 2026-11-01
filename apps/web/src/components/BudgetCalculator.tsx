'use client';

import React, { useState } from 'react';
import { Calculator, Crown, Check, ArrowRight } from 'lucide-react';
import { WeddingPackageType } from '@grand-bandhan/shared';

const formatINR = (val: number) => new Intl.NumberFormat('en-IN').format(val);

export default function BudgetCalculator() {
  const [packageType, setPackageType] = useState<WeddingPackageType>(WeddingPackageType.FULL_SERVICE);
  const [guestCount, setGuestCount] = useState<number>(350);
  const [plateTier, setPlateTier] = useState<number>(1850);
  const [locationType, setLocationType] = useState<'palace' | 'resort' | 'city'>('palace');

  // Dynamic calculations
  const cateringTotal = guestCount * plateTier;
  const decorEstimate =
    packageType === WeddingPackageType.FULL_SERVICE
      ? locationType === 'palace'
        ? 1400000
        : 900000
      : 350000;
  const entertainmentAndDJ = packageType === WeddingPackageType.FULL_SERVICE ? 450000 : 150000;
  const photoCinema = packageType === WeddingPackageType.FULL_SERVICE ? 500000 : 200000;
  const coordinationFee = packageType === WeddingPackageType.FULL_SERVICE ? 600000 : 250000;
  const contingencyBuffer = Math.round((cateringTotal + decorEstimate) * 0.08);

  const grandTotal =
    cateringTotal + decorEstimate + entertainmentAndDJ + photoCinema + coordinationFee + contingencyBuffer;

  return (
    <section id="calculator" className="py-20 bg-cream-100 border-y border-gold/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full gold-badge text-xs font-semibold mb-3">
            <Calculator className="w-3.5 h-3.5" />
            <span>Interactive Royal Estimator</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-navy-900 tracking-tight">
            Transparent Wedding Budget & Operations Simulator
          </h2>
          <p className="text-base text-darkText/75 mt-3 leading-relaxed">
            Configure your wedding scope, guest count, and royal dining tier to forecast line-item expenditures and contingency margins.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column */}
          <div className="lg:col-span-7 bg-white border border-gold/40 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            {/* Package Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy-900 mb-2">
                1. Select Operations Package
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPackageType(WeddingPackageType.FULL_SERVICE)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    packageType === WeddingPackageType.FULL_SERVICE
                      ? 'border-gold bg-navy-900 text-white shadow-md'
                      : 'border-navy-200 bg-white text-darkText hover:border-gold'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-serif text-base font-bold">Full-Service Royal</span>
                    {packageType === WeddingPackageType.FULL_SERVICE && <Crown className="w-4 h-4 text-gold" />}
                  </div>
                  <p className="text-xs text-cream-300">
                    Comprehensive planning, Multi-vendor RFP engine, 25+ auto tasks, day-of operations.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setPackageType(WeddingPackageType.PARTIAL_DAY_OF)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    packageType === WeddingPackageType.PARTIAL_DAY_OF
                      ? 'border-gold bg-navy-900 text-white shadow-md'
                      : 'border-navy-200 bg-white text-darkText hover:border-gold'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-serif text-base font-bold">Partial / Day-of</span>
                    {packageType === WeddingPackageType.PARTIAL_DAY_OF && <Crown className="w-4 h-4 text-gold" />}
                  </div>
                  <p className="text-xs text-cream-300">
                    Run-sheet timeline execution, vendor arrival gates, family liaison.
                  </p>
                </button>
              </div>
            </div>

            {/* Guest Count Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-navy-900">
                  2. Guaranteed Guest Count
                </label>
                <span className="font-serif text-lg font-bold text-royal">
                  {guestCount} Guests
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="1200"
                step="50"
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                className="w-full accent-gold h-2 bg-navy-100 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-darkText/60 mt-1">
                <span>100 (Intimate Palace)</span>
                <span>500 (Grand Heritage)</span>
                <span>1200+ (Imperial Citadel)</span>
              </div>
            </div>

            {/* Catering Plate Tier */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy-900 mb-2">
                3. Royal Banquet Dining Tier (Per Plate)
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { rate: 1400, title: 'Silver Banquet', desc: '14 items, 2 live counters' },
                  { rate: 1850, title: 'Royal Heritage', desc: '22 items, 4 world stations' },
                  { rate: 2500, title: 'Imperial Grand Feast', desc: '32 items, artisanal bars' },
                ].map((tier) => (
                  <button
                    key={tier.rate}
                    type="button"
                    onClick={() => setPlateTier(tier.rate)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      plateTier === tier.rate
                        ? 'border-gold bg-gold/15 text-navy-950 font-medium'
                        : 'border-navy-200 bg-white text-darkText hover:border-gold'
                    }`}
                  >
                    <div className="text-xs font-bold">INR {tier.rate}</div>
                    <div className="text-[11px] font-semibold text-royal mt-0.5">{tier.title}</div>
                    <div className="text-[10px] text-darkText/70 mt-0.5">{tier.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Location Type */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy-900 mb-2">
                4. Venue Style
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'palace', label: 'Island/Heritage Palace' },
                  { id: 'resort', label: 'Luxury Destination Resort' },
                  { id: 'city', label: 'Boutique City Mansion' },
                ].map((loc) => (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => setLocationType(loc.id as any)}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                      locationType === loc.id
                        ? 'border-gold bg-navy-900 text-gold shadow-sm'
                        : 'border-navy-200 bg-white text-darkText hover:border-gold'
                    }`}
                  >
                    {loc.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Breakdown Output Column */}
          <div className="lg:col-span-5 bg-navy-gradient text-white rounded-2xl p-6 sm:p-8 border border-gold/40 shadow-navy-deep space-y-6">
            <div className="border-b border-gold/30 pb-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-gold">
                Forecasted Budget Blueprint
              </span>
              <div suppressHydrationWarning className="font-serif text-3xl sm:text-4xl font-bold text-gold-gradient mt-1">
                INR {formatINR(grandTotal)}
              </div>
              <p className="text-xs text-cream-300 mt-1">
                Includes statutory contingency buffer & vendor audit controls.
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-1.5 border-b border-navy-800">
                <span className="text-cream-300">Catering ({guestCount} @ ₹{plateTier})</span>
                <span suppressHydrationWarning className="font-semibold text-gold">₹{formatINR(cateringTotal)}</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-navy-800">
                <span className="text-cream-300">Decor & Architectural Mandap</span>
                <span suppressHydrationWarning className="font-semibold text-gold">₹{formatINR(decorEstimate)}</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-navy-800">
                <span className="text-cream-300">DJ, Sound, LED & Artists</span>
                <span suppressHydrationWarning className="font-semibold text-gold">₹{formatINR(entertainmentAndDJ)}</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-navy-800">
                <span className="text-cream-300">Cinematic Photography & Drones</span>
                <span suppressHydrationWarning className="font-semibold text-gold">₹{formatINR(photoCinema)}</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-navy-800">
                <span className="text-cream-300">Grand Bandhan Operations Fee</span>
                <span suppressHydrationWarning className="font-semibold text-gold">₹{formatINR(coordinationFee)}</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-navy-800">
                <span className="text-cream-300">Contingency & Overage Buffer (8%)</span>
                <span suppressHydrationWarning className="font-semibold text-gold-light">₹{formatINR(contingencyBuffer)}</span>
              </div>
            </div>

            <div className="bg-navy-950/60 p-4 rounded-xl border border-gold/20 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-gold">

                <span>The Grand Bandhan Difference</span>
              </div>
              <p className="text-xs text-cream-300 leading-relaxed">
                With our <strong>Multi-Vendor Quotations</strong> comparison engine, couples save an average of 14% by eliminating arbitrary markups and locking verified per-plate rates.
              </p>
            </div>

            <a
              href="/login"
              className="block w-full text-center py-3 px-4 rounded-lg bg-gold-gradient text-navy-950 font-bold text-sm shadow-gold-glow hover:brightness-105 transition-all"
            >
              Explore Live Operations Dashboard &rarr;
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
