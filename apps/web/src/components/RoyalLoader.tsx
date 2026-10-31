'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { LUXURY_EASE } from '@/lib/animations';

export default function RoyalLoader() {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if user prefers reduced motion
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mql.matches);

    // Determine if this is an initial entrance or page reload
    // Show loader on:
    // 1. First visit in session
    // 2. Explicit browser reload (performance navigation type 'reload')
    let shouldShow = false;
    try {
      const navigationEntries = performance.getEntriesByType('navigation');
      const isReload =
        navigationEntries.length > 0 &&
        (navigationEntries[0] as PerformanceNavigationTiming).type === 'reload';

      const hasVisited = sessionStorage.getItem('gb_session_initialized');

      if (!hasVisited || isReload) {
        shouldShow = true;
        sessionStorage.setItem('gb_session_initialized', 'true');
      }
    } catch (e) {
      // Fallback: show if sessionStorage not accessible
      shouldShow = true;
    }

    if (!shouldShow) return;

    setIsVisible(true);

    // If user prefers reduced motion, dismiss quickly after 600ms
    if (mql.matches) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 700);
      return () => clearTimeout(timer);
    }

    // Animate progress smoothly from 0% to 100% over ~2400ms (between 600ms and 3000ms)
    const startTime = performance.now();
    const progressDuration = 2400; // ms
    const startDelay = 500; // ms

    let animationFrameId: number;

    const updateProgress = (now: number) => {
      const elapsed = now - startTime - startDelay;
      if (elapsed > 0) {
        const rawProgress = Math.min(100, Math.floor((elapsed / progressDuration) * 100));
        setProgress(rawProgress);
      }
      if (now - startTime < startDelay + progressDuration) {
        animationFrameId = requestAnimationFrame(updateProgress);
      } else {
        setProgress(100);
      }
    };

    animationFrameId = requestAnimationFrame(updateProgress);

    // Complete timeline:
    // 0-500ms: Background enters
    // 500-1200ms: Monogram scales in
    // 1200-2400ms: Progress ring animates
    // 2400-3000ms: Typography appears
    // 3200-3600ms: Smooth fade-out dismissal
    const dismissalTimer = setTimeout(() => {
      setIsVisible(false);
    }, 3400);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(dismissalTimer);
    };
  }, []);

  // SVG Circular Ring Constants
  const circleRadius = 58;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="royal-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.65, ease: LUXURY_EASE } }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#030e1a] overflow-hidden select-none"
          role="status"
          aria-live="polite"
          aria-label="Loading Grand Bandhan Royal Experience"
        >
          {/* Ambient Royal Background Lighting & Radial Glass Sheen */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,42,67,0.7)_0%,_rgba(3,14,26,0.95)_70%,_#020912_100%)]" />

          {/* Golden Ambient Particle Glimmer */}
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_50%_45%,_rgba(201,169,106,0.25)_0%,_transparent_60%)]" />

          {/* Central Luxury Container */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center px-6">
            {/* Circular Progress Ring + Centered Logo Monogram */}
            <div className="relative w-40 h-40 flex items-center justify-center mb-6">
              {/* Pulsing Gold Backlight Aura */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                  scale: [0.85, 1.08, 0.95],
                  opacity: [0.3, 0.6, 0.4],
                }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute inset-0 rounded-full bg-gold/15 blur-2xl"
              />

              {/* SVG Circular Progress Track & Ring */}
              <svg className="w-36 h-36 -rotate-90 transform" viewBox="0 0 136 136">
                {/* Background Track */}
                <circle
                  cx="68"
                  cy="68"
                  r={circleRadius}
                  stroke="rgba(201, 169, 106, 0.15)"
                  strokeWidth="2.5"
                  fill="transparent"
                />
                {/* Animated Gold Progress Arc */}
                <motion.circle
                  cx="68"
                  cy="68"
                  r={circleRadius}
                  stroke="url(#goldGradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="transparent"
                  style={{
                    strokeDasharray: circumference,
                    strokeDashoffset,
                  }}
                  transition={{ ease: 'linear', duration: 0.1 }}
                />
                <defs>
                  <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#C9A96A" />
                    <stop offset="50%" stopColor="#F5E8CB" />
                    <stop offset="100%" stopColor="#B28E46" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Centered Monogram / Brand Logo */}
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: prefersReducedMotion ? 0 : 0.45,
                  duration: 0.8,
                  ease: LUXURY_EASE,
                }}
                className="absolute inset-0 flex items-center justify-center p-6"
              >
                <Image
                  src="/logo.png"
                  alt="Grand Bandhan Royal Emblem"
                  width={110}
                  height={110}
                  priority
                  className="w-20 h-auto object-contain drop-shadow-[0_4px_16px_rgba(201,169,106,0.35)]"
                />
              </motion.div>
            </div>

            {/* Brand Title with Regal Typography */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: prefersReducedMotion ? 0 : 1.6,
                duration: 0.8,
                ease: LUXURY_EASE,
              }}
              className="space-y-2.5"
            >
              <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-cream-100 via-gold-light to-gold uppercase">
                Grand Bandhan
              </h2>

              {/* Subtitle / Loading Message */}
              <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-medium tracking-wider text-cream-200/80">
              
                <span className="uppercase text-[11px] sm:text-xs tracking-[0.18em]">
                  Preparing Your Royal Experience
                </span>
              </div>
            </motion.div>
          </div>

          {/* Bottom Luxury Hairline Ornament */}
          <div className="absolute bottom-10 inset-x-0 flex items-center justify-center opacity-40">
            <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-gold to-transparent" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
