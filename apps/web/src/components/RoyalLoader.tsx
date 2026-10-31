'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { LUXURY_EASE } from '@/lib/animations';

export default function RoyalLoader() {
  const [mounted, setMounted] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [progress, setProgress] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const isFadingRef = useRef(false);

  const handleDismiss = useCallback(() => {
    if (isFadingRef.current) return;
    isFadingRef.current = true;
    setIsFading(true);
    setTimeout(() => {
      setIsDismissed(true);
    }, 700);
  }, []);

  useEffect(() => {
    // Check if user prefers reduced motion
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mql.matches);

    // Determine if this is an initial entrance or page reload
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
    } catch {
      shouldShow = true;
    }

    if (!shouldShow) {
      setIsDismissed(true);
      return;
    }

    setMounted(true);

    // If reduced motion, dismiss quickly
    if (mql.matches) {
      const timer = setTimeout(handleDismiss, 600);
      return () => clearTimeout(timer);
    }

    // Animate progress smoothly from 0% to 100%
    const startTime = performance.now();
    const progressDuration = 2200; // ms
    const startDelay = 300; // ms

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

    // Auto-dismiss timeline:
    // Starts fading out at ~2.8s and completes by 3.5s
    const dismissalTimer = setTimeout(() => {
      handleDismiss();
    }, 2800);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(dismissalTimer);
    };
  }, [handleDismiss]);

  if (!mounted || isDismissed) {
    return null;
  }

  // SVG Circular Ring Constants
  const circleRadius = 58;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading Grand Bandhan Royal Experience"
      onClick={handleDismiss}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#030e1a] overflow-hidden select-none cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isFading ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100 scale-100'
      }`}
    >
      {/* Ambient Royal Background Lighting & Radial Glass Sheen */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,42,67,0.7)_0%,_rgba(3,14,26,0.95)_70%,_#020912_100%)] pointer-events-none" />

      {/* Golden Ambient Particle Glimmer */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_50%_45%,_rgba(201,169,106,0.25)_0%,_transparent_60%)]" />

      {/* Central Luxury Container */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6">
        {/* Circular Progress Ring + Centered Logo Monogram */}
        <div className="relative w-40 h-40 flex items-center justify-center mb-6">
          {/* Pulsing Gold Backlight Aura using hardware-accelerated CSS animation */}
          <div className="absolute inset-0 rounded-full bg-gold/20 blur-2xl animate-pulse" />

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
            <circle
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
                transition: 'stroke-dashoffset 80ms linear',
              }}
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
              delay: prefersReducedMotion ? 0 : 0.25,
              duration: 0.7,
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
            delay: prefersReducedMotion ? 0 : 1.2,
            duration: 0.7,
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
    </div>
  );
}
