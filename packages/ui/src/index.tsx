'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 1. Animated Card with Stagger & Subtle Hover Elevation
export interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  delay?: number;
  highlight?: boolean;
}

export function AnimatedCard({
  children,
  className,
  delay = 0,
  highlight = false,
  ...props
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={cn(
        'bg-white rounded-2xl p-6 transition-shadow',
        highlight
          ? 'border-2 border-gold shadow-gold-glow'
          : 'border border-gold/30 shadow-sm hover:shadow-md',
        className
      )}
      {...(props as any)}
    >
      {children}
    </motion.div>
  );
}

// 2. Imperial Gold Button with Ripple and Hover Glow
export interface GoldButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'navy' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export function GoldButton({
  children,
  className,
  variant = 'gold',
  size = 'md',
  loading = false,
  icon,
  disabled,
  ...props
}: GoldButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-bold rounded-xl transition-all select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5',
    md: 'text-xs px-5 py-2.5 gap-2',
    lg: 'text-sm px-7 py-3.5 gap-2.5',
  };

  const variantStyles = {
    gold: 'bg-gold-gradient text-navy-950 shadow-gold-glow hover:brightness-110 active:scale-[0.98]',
    navy: 'bg-navy-900 text-gold hover:bg-navy-800 border border-gold/40 shadow-sm active:scale-[0.98]',
    outline: 'border border-gold text-gold-dark hover:bg-gold/10 active:scale-[0.98]',
    ghost: 'text-navy-900 hover:bg-navy-50 active:scale-[0.98]',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      disabled={disabled || loading}
      {...(props as any)}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-inherit" />
      ) : (
        icon
      )}
      <span>{children}</span>
    </motion.button>
  );
}

// 3. Stat Counter with Smooth Number Roll-Up Animation
export function StatCounter({
  value,
  prefix = '',
  suffix = '',
  duration = 1.2,
  className,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (end === 0) {
      setDisplayValue(0);
      return;
    }
    const totalFrames = Math.round(duration * 60);
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      // Ease out quartic
      const ease = 1 - Math.pow(1 - progress, 4);
      const current = Math.round(start + (end - start) * ease);
      setDisplayValue(current);

      if (frame >= totalFrames) {
        clearInterval(timer);
        setDisplayValue(end);
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [value, duration]);

  return (
    <span className={cn('font-serif font-bold tracking-tight', className)}>
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
}

// 4. Refined Luxury Status Badge
export function StatusBadge({
  status,
  variant = 'default',
  className,
}: {
  status: string;
  variant?: 'default' | 'gold' | 'green' | 'red' | 'blue' | 'amber';
  className?: string;
}) {
  const variants = {
    default: 'bg-navy-100 text-navy-900 border-navy-200',
    gold: 'bg-gold/15 text-gold-dark border-gold/40',
    green: 'bg-green-100 text-green-900 border-green-300',
    red: 'bg-red-100 text-red-900 border-red-300',
    blue: 'bg-blue-100 text-blue-900 border-blue-300',
    amber: 'bg-amber-100 text-amber-900 border-amber-300',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border',
        variants[variant],
        className
      )}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}

// 5. Framer Motion Modal with Backdrop Blur
export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-xl',
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={cn(
              'relative w-full bg-cream border border-gold rounded-2xl shadow-2xl overflow-hidden my-8 z-10',
              maxWidth
            )}
          >
            {/* Header */}
            <div className="bg-navy-gradient text-white p-6 border-b border-gold/30 relative">
              <button
                onClick={onClose}
                className="absolute top-5 right-5 p-2 rounded-full text-gold hover:text-white hover:bg-navy-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="font-serif text-2xl font-bold text-cream">{title}</h3>
              {subtitle && (
                <p className="text-xs text-cream-300 mt-1 leading-relaxed">{subtitle}</p>
              )}
            </div>

            {/* Body */}
            <div className="p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
