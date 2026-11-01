'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Crown, User, Calendar, Menu, X, ArrowRight, Briefcase } from 'lucide-react';
import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
import EnquiryModal from './EnquiryModal';

const SCROLL_THRESHOLD = 8; // Stable delta threshold to prevent jitter during smooth scrolling
const TOP_ZONE = 80; // Always show navbar when scrollY < this value

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const lastScrollY = useRef(0);
  const { scrollY } = useScroll();

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mql.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  // Scroll direction & distance detection via Framer Motion's useMotionValueEvent
  useMotionValueEvent(scrollY, 'change', (currentY) => {
    const previousY = lastScrollY.current;
    const delta = currentY - previousY;

    // Smooth transition between transparent and slightly darker background when scrolling
    setIsScrolled(currentY > 30);

    // Always show when near the top
    if (currentY < TOP_ZONE) {
      setIsHidden(false);
      lastScrollY.current = currentY;
      return;
    }

    // Don't hide while mobile menu is open
    if (isMenuOpen) {
      lastScrollY.current = currentY;
      return;
    }

    // Only trigger on meaningful scroll movement (prevents flickering)
    if (Math.abs(delta) < SCROLL_THRESHOLD) return;

    if (delta > 0) {
      // Scrolling DOWN → hide
      setIsHidden(true);
    } else {
      // Scrolling UP → show
      setIsHidden(false);
    }

    lastScrollY.current = currentY;
  });

  return (
    <>
      <motion.header
        variants={{
          visible: { y: '0%' },
          hidden: { y: '-100%' },
        }}
        initial="visible"
        animate={isHidden ? 'hidden' : 'visible'}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
        }
        className="sticky top-0 z-50 will-change-transform"
      >
        {/* Main Glass Navbar using rgb(6 22 38) */}
        <div
          className={`relative transition-colors duration-300 ${
            isScrolled ? 'navbar-glass-scrolled' : 'navbar-glass'
          }`}
          style={{
            backgroundColor: isScrolled ? 'rgba(6, 20, 36, 1)' : 'rgba(6, 20, 36, 1)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(201, 169, 106, 0.2)',
            boxShadow: isScrolled
              ? '0 12px 35px rgba(0, 0, 0, 0.28)'
              : '0 8px 32px rgba(0, 0, 0, 0.18)',
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              {/* Logo */}
              <Link href="/" className="flex items-center group relative py-1">
                <div className="absolute -inset-2 rounded-xl bg-gold/10 opacity-0 group-hover:opacity-100 transition-opacity blur-md" />
                <Image
                  src="/logo.png"
                  alt="Grand Bandhan"
                  width={180}
                  height={64}
                  className="relative h-14 sm:h-16 w-auto object-contain drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-[1.03]"
                  priority
                />
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-1 p-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.12),0_4px_20px_rgba(0,0,0,0.25)] transition-all duration-300">
                <Link
                  href="#services"
                  className="px-4 py-2 rounded-full text-xs lg:text-sm font-medium text-cream-100/90 hover:text-gold hover:bg-white/[0.08] active:scale-95 transition-all duration-200"
                >
                  Royal Services
                </Link>
                <Link
                  href="#venues"
                  className="px-4 py-2 rounded-full text-xs lg:text-sm font-medium text-cream-100/90 hover:text-gold hover:bg-white/[0.08] active:scale-95 transition-all duration-200"
                >
                  Heritage Venues
                </Link>
                <Link
                  href="#calculator"
                  className="px-4 py-2 rounded-full text-xs lg:text-sm font-medium text-cream-100/90 hover:text-gold hover:bg-white/[0.08] active:scale-95 transition-all duration-200"
                >
                  Budget Estimator
                </Link>
                <Link
                  href="#workflow"
                  className="px-4 py-2 rounded-full text-xs lg:text-sm font-medium text-cream-100/90 hover:text-gold hover:bg-white/[0.08] active:scale-95 transition-all duration-200"
                >
                  Multiple Vendor System
                </Link>
              </nav>

              {/* Action CTAs */}
              <div className="hidden lg:flex items-center gap-2.5">
                {/* Vendor Partner Button */}
                <Link
                  href="/vendor-register"
                  className="group flex items-center gap-1.5 px-3.5 py-2.5 rounded-full text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/40 hover:border-amber-400/80 backdrop-blur-md shadow-[0_0_12px_rgba(251,191,36,0.15)] transition-all duration-200"
                >
                  <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                  <span>Join as Vendor</span>
                </Link>

                {/* Secondary CTA: Frosted Glass Button */}
                <Link
                  href="/login"
                  className="group flex items-center gap-2 px-4 py-2.5 rounded-full text-xs lg:text-sm font-medium text-cream-100 bg-white/[0.04] hover:bg-gold/15 border border-gold/35 hover:border-gold/70 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] hover:text-gold hover:shadow-[0_0_15px_rgba(201,169,106,0.25)] active:scale-95 transition-all duration-200"
                >
                  <span>Command Portal</span>
                </Link>

                {/* Primary CTA: Polished Gold Gradient Glass Pill */}
                <button
                  onClick={() => setIsEnquiryModalOpen(true)}
                  className="group flex items-center gap-2 px-5 py-2.5 rounded-full text-xs lg:text-sm font-semibold bg-gold-gradient text-navy-950 shadow-gold-glow hover:shadow-[0_0_24px_rgba(201,169,106,0.55)] hover:brightness-105 active:scale-95 transition-all duration-200"
                >
                  <span>Plan Your Wedding</span>
                </button>
              </div>

              {/* Mobile Menu Toggle Button */}
              <div className="md:hidden flex items-center gap-2">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2.5 rounded-xl text-gold hover:text-white bg-white/[0.05] border border-white/10 hover:bg-white/[0.1] backdrop-blur-md transition-all duration-200"
                  aria-label="Toggle navigation menu"
                >
                  {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu dropdown — Glass Container */}
          {isMenuOpen && (
            <div
              style={{
                backgroundColor: 'rgba(6, 22, 38, 0.95)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
              }}
              className="md:hidden border-t border-white/10 border-b border-gold/30 px-5 pt-3 pb-6 space-y-3 shadow-2xl"
            >
              <div className="p-1.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                <Link
                  href="#services"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-sm font-medium text-cream-100 hover:text-gold hover:bg-white/[0.06] transition-all"
                >
                  Royal Services
                </Link>
                <Link
                  href="#venues"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-sm font-medium text-cream-100 hover:text-gold hover:bg-white/[0.06] transition-all"
                >
                  Heritage Venues
                </Link>
                <Link
                  href="#calculator"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-sm font-medium text-cream-100 hover:text-gold hover:bg-white/[0.06] transition-all"
                >
                  Budget Estimator
                </Link>
                <Link
                  href="#workflow"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-sm font-medium text-cream-100 hover:text-gold hover:bg-white/[0.06] transition-all"
                >
                  Multiple Vendor System
                </Link>
              </div>

              <div className="pt-2 flex flex-col gap-2.5">
                <Link
                  href="/vendor-register"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-amber-300 bg-amber-500/10 border border-amber-400/40 hover:bg-amber-500/20 transition-all"
                >
                  <Briefcase className="w-4 h-4 text-amber-400" />
                  <span>Join as Vendor &amp; Partner</span>
                </Link>
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gold bg-white/[0.04] border border-gold/40 hover:bg-gold/10 transition-all"
                >
                  <User className="w-4 h-4" />
                  Command Portal &amp; 1-Click Login
                </Link>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsEnquiryModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gold-gradient text-navy-950 shadow-gold-glow hover:brightness-105 transition-all"
                >

                  Plan Your Wedding
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.header>

      {/* Interactive Enquiry Modal */}
      <EnquiryModal isOpen={isEnquiryModalOpen} onClose={() => setIsEnquiryModalOpen(false)} />
    </>
  );
}
