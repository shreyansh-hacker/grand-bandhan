'use client';

import React from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
};

export function FadeInStagger({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function FadeInItem({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={fadeInUp} className={className}>
      {children}
    </motion.div>
  );
}

export function AnimatedPulseBadge({
  text,
  variant = 'gold',
}: {
  text: string;
  variant?: 'gold' | 'emerald' | 'rose' | 'blue';
}) {
  const styles = {
    gold: 'border-gold/40 bg-navy-950/70 text-gold shadow-gold-glow',
    emerald: 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300',
    rose: 'border-rose-500/40 bg-rose-950/40 text-rose-300',
    blue: 'border-blue-500/40 bg-blue-950/40 text-blue-300',
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold backdrop-blur-md ${styles[variant]}`}
    >
      <span className="w-2 h-2 rounded-full bg-current animate-ping" />
      <span>{text}</span>
    </motion.div>
  );
}
