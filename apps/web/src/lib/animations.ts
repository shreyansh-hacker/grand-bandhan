import { type Transition, type Variants } from 'framer-motion';

/**
 * Grand Bandhan Luxury Animation System
 * Core cubic-bezier and timing configurations for high-end hospitality UI.
 */
export const LUXURY_EASE = [0.22, 1, 0.36, 1] as const;

export const LUXURY_TRANSITION: Transition = {
  duration: 0.6,
  ease: [0.22, 1, 0.36, 1],
};

export const LUXURY_FAST_TRANSITION: Transition = {
  duration: 0.35,
  ease: [0.22, 1, 0.36, 1],
};

export const LUXURY_SLOW_TRANSITION: Transition = {
  duration: 0.9,
  ease: [0.22, 1, 0.36, 1],
};

/**
 * Standard Reusable Motion Variants
 */
export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: LUXURY_TRANSITION,
  },
  exit: {
    opacity: 0,
    transition: LUXURY_FAST_TRANSITION,
  },
};

export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: LUXURY_TRANSITION,
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: LUXURY_FAST_TRANSITION,
  },
};

export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: LUXURY_TRANSITION,
  },
};

export const luxuryCardHover: Variants = {
  initial: { y: 0, boxShadow: '0 4px 20px -2px rgba(6, 22, 38, 0.08)' },
  hover: {
    y: -4,
    boxShadow: '0 16px 36px -4px rgba(6, 22, 38, 0.16), 0 0 20px rgba(201, 169, 106, 0.2)',
    transition: LUXURY_FAST_TRANSITION,
  },
};

export const luxuryButtonHover: Variants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.025,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  tap: {
    scale: 0.975,
  },
};
