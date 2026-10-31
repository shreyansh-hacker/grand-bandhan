/**
 * Grand Bandhan API Endpoints Registry
 */

export const API_BASE_URL = 'https://grand-bandhan.onrender.com';

export const ENDPOINTS = {
  HEALTH: '/health',
  API_HEALTH: '/api/health',
  NEON_STATUS: '/api/neon/status',

  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    ME: '/api/auth/me',
    LOGOUT: '/api/auth/logout',
    PORTAL_LINK: '/api/auth/portal-link',
  },

  ENQUIRIES: {
    LIST: '/api/enquiries',
    CREATE: '/api/enquiries',
    DETAIL: (id: string) => `/api/enquiries/${id}`,
    UPDATE_STATUS: (id: string) => `/api/enquiries/${id}/status`,
    ASSIGN: (id: string) => `/api/enquiries/${id}/assign`,
  },

  WEDDINGS: {
    LIST: '/api/weddings',
    CREATE: '/api/weddings',
    DETAIL: (id: string) => `/api/weddings/${id}`,
    UPDATE: (id: string) => `/api/weddings/${id}`,
  },

  QUOTATIONS: {
    LIST: '/api/quotations',
    REQUESTS: '/api/quotations/requests',
    REQUEST_DETAIL: (id: string) => `/api/quotations/requests/${id}`,
    SUBMIT: '/api/quotations',
    SELECT: (id: string) => `/api/quotations/${id}/select`,
  },

  TASKS: {
    LIST: '/api/tasks',
    CREATE: '/api/tasks',
    UPDATE: (id: string) => `/api/tasks/${id}`,
    UPDATE_STATUS: (id: string) => `/api/tasks/${id}/status`,
  },

  EVENTS: {
    LIST: '/api/events',
    CREATE: '/api/events',
    DETAIL: (id: string) => `/api/events/${id}`,
    ARRIVALS: '/api/events/arrivals',
    UPDATE_ARRIVAL: (id: string) => `/api/events/arrivals/${id}`,
  },

  VERIFICATIONS: {
    LIST: '/api/verifications',
    TRIGGER: '/api/verifications/trigger',
    RESPOND: (id: string) => `/api/verifications/${id}/respond`,
    RESOLVE: (id: string) => `/api/verifications/${id}/resolve`,
  },

  PAYMENTS: {
    LIST: '/api/payments',
    RECORD: '/api/payments',
  },

  SETTLEMENTS: {
    LIST: '/api/settlements',
    CLOSE: (id: string) => `/api/settlements/${id}/close`,
  },

  ANALYTICS: {
    OVERVIEW: '/api/analytics/overview',
  },
} as const;
