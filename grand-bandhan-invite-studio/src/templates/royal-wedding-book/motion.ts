export const MOTION_SETTINGS = {
  speeds: {
    slow: {
      coverRotateDuration: 1.8,
      scrollUnrollDuration: 1.4,
      staggerDelay: 0.18,
      carouselSpeed: 500,
    },
    normal: {
      coverRotateDuration: 1.2,
      scrollUnrollDuration: 0.9,
      staggerDelay: 0.1,
      carouselSpeed: 350,
    },
    fast: {
      coverRotateDuration: 0.6,
      scrollUnrollDuration: 0.45,
      staggerDelay: 0.05,
      carouselSpeed: 200,
    },
  },
  easing: {
    royalBook: 'cubic-bezier(0.25, 1, 0.5, 1)',
    scrollBounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    gentleFloat: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};
