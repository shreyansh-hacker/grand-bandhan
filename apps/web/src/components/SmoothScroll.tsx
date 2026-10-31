'use client';

import { useEffect } from 'react';

/**
 * SmoothScroll ensures a consistent luxury smooth-scrolling experience across
 * desktop, tablet, and mobile, with automatic offset calculations for the sticky glass navbar (90px).
 */
export default function SmoothScroll() {
  useEffect(() => {
    // Respect user's motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href || !href.startsWith('#') || href === '#') return;

      const elementId = href.substring(1);
      const targetElement = document.getElementById(elementId);

      if (targetElement) {
        e.preventDefault();
        const headerOffset = 90; // Navbar height + padding
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: 'smooth',
        });

        // Update URL hash without abrupt jumping
        if (history.pushState) {
          history.pushState(null, '', href);
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => {
      document.removeEventListener('click', handleAnchorClick);
    };
  }, []);

  return null;
}
