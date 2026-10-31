'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LUXURY_EASE } from '@/lib/animations';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="relative w-full min-h-screen bg-navy-950">
      {/* Subtle Golden Route Loading Line at top of viewport */}
      <motion.div
        key={`loader-bar-${pathname}`}
        initial={{ scaleX: 0, opacity: 0.9 }}
        animate={{ scaleX: 1, opacity: 0 }}
        transition={{ duration: 0.4, ease: LUXURY_EASE }}
        className="pointer-events-none fixed top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-gold via-gold-light to-gold origin-left z-[100]"
      />

      {/* Smooth Page Content Crossfade without top gap displacement */}
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.35,
          ease: LUXURY_EASE,
        }}
        className="w-full min-h-screen"
      >
        <React.Fragment>{children}</React.Fragment>
      </motion.div>
    </div>
  );
}
