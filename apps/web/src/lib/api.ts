// Grand Bandhan API Client

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  status?: string;
  referenceNumber?: string;
  errors?: Array<{ path: string; message: string }>;
}

let storedToken: string | null = null;

export function setAuthToken(token: string | null) {
  storedToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('gb_access_token', token);
    } else {
      localStorage.removeItem('gb_access_token');
    }
  }
}

export function getAuthToken(): string | null {
  if (storedToken) return storedToken;
  if (typeof window !== 'undefined') {
    storedToken = localStorage.getItem('gb_access_token');
  }
  return storedToken;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Check for portal token in URL query or local storage
  if (typeof window !== 'undefined') {
    const portalToken = sessionStorage.getItem('gb_portal_token');
    if (portalToken) {
      headers.set('x-portal-token', portalToken);
    }
  }

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'omit', // Avoid CORS credentials issue in cross-origin unless explicitly needed
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    console.error('API Request failed:', endpoint, err);
    return {
      success: false,
      message: err.message || 'Network error communicating with Grand Bandhan API.',
    };
  }
}
