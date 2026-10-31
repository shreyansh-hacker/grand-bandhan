'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Crown, Sparkles, User, Calendar, Menu, X, ArrowRight } from 'lucide-react';
import EnquiryModal from './EnquiryModal';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-navy-900/95 backdrop-blur-md border-b border-gold/30 text-white shadow-navy-deep">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center group">
              <Image
                src="/logo.png"
                alt="Grand Bandhan"
                width={180}
                height={64}
                className="h-14 sm:h-16 w-auto object-contain rounded-md transition-transform group-hover:scale-[1.02]"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="#services" className="text-sm font-medium text-cream-200 hover:text-gold transition-colors">
                Royal Services
              </Link>
              <Link href="#venues" className="text-sm font-medium text-cream-200 hover:text-gold transition-colors">
                Heritage Venues
              </Link>
             
              <Link href="#calculator" className="text-sm font-medium text-cream-200 hover:text-gold transition-colors">
                Budget Estimator
              </Link>
              <Link href="#workflow" className="text-sm font-medium text-cream-200 hover:text-gold transition-colors">
                Multiple Vendor System 
              </Link>
            </nav>

            {/* CTAs */}
            <div className="hidden lg:flex items-center gap-4">
              <Link
                href="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gold border border-gold/40 hover:bg-gold/10 transition-colors"
              >
                <User className="w-4 h-4" />
                Agency & Client Portal
              </Link>

              <button
                onClick={() => setIsEnquiryModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-gold-gradient text-navy-950 shadow-gold-glow hover:brightness-105 transition-all transform hover:-translate-y-0.5"
              >
                <Sparkles className="w-4 h-4" />
                Plan Your Wedding
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md text-gold hover:text-white hover:bg-navy-800"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {isMenuOpen && (
          <div className="md:hidden bg-navy-950/98 border-b border-gold/30 px-4 pt-2 pb-6 space-y-3">
            <Link
              href="#services"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-cream hover:bg-navy-800"
            >
              Royal Services
            </Link>
            <Link
              href="#venues"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-cream hover:bg-navy-800"
            >
              Heritage Venues
            </Link>
            <Link
              href="#vendors"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-cream hover:bg-navy-800"
            >
              Vendor Engine
            </Link>
            <Link
              href="#calculator"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-cream hover:bg-navy-800"
            >
              Budget Estimator
            </Link>
            <div className="pt-4 border-t border-gold/20 flex flex-col gap-3">
              <Link
                href="/login"
                className="w-full text-center px-4 py-2 rounded-lg text-sm font-medium text-gold border border-gold/40"
              >
                Agency & Client Portal
              </Link>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsEnquiryModalOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-gold-gradient text-navy-950"
              >
                <Sparkles className="w-4 h-4" />
                Plan Your Wedding
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Interactive Enquiry Modal */}
      <EnquiryModal isOpen={isEnquiryModalOpen} onClose={() => setIsEnquiryModalOpen(false)} />
    </>
  );
}
