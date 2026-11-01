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
let storedRefreshToken: string | null = null;
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

export function setAuthToken(token: string | null, refreshToken?: string | null) {
  storedToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('gb_access_token', token);
    } else {
      localStorage.removeItem('gb_access_token');
    }

    if (refreshToken !== undefined) {
      storedRefreshToken = refreshToken;
      if (refreshToken) {
        localStorage.setItem('gb_refresh_token', refreshToken);
      } else {
        localStorage.removeItem('gb_refresh_token');
      }
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

export function getRefreshToken(): string | null {
  if (storedRefreshToken) return storedRefreshToken;
  if (typeof window !== 'undefined') {
    storedRefreshToken = localStorage.getItem('gb_refresh_token');
  }
  return storedRefreshToken;
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

    // Check if token expired or invalid (401)
    const isTokenExpired =
      res.status === 401 ||
      (typeof data?.message === 'string' &&
        (data.message.toLowerCase().includes('token expired') ||
          data.message.toLowerCase().includes('token invalid') ||
          data.message.toLowerCase().includes('authentication required')));

    const isAuthEndpoint =
      endpoint.startsWith('/api/auth/login') ||
      endpoint.startsWith('/api/auth/refresh') ||
      endpoint.startsWith('/api/auth/register');

    if (isTokenExpired && !isAuthEndpoint && typeof window !== 'undefined') {
      const refreshToken = getRefreshToken();

      if (refreshToken) {
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const refreshRes = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken }),
            });
            const refreshData = await refreshRes.json();

            if (refreshData.success && refreshData.data?.accessToken) {
              const newAccessToken = refreshData.data.accessToken;
              const newRefreshToken = refreshData.data.refreshToken || refreshToken;
              setAuthToken(newAccessToken, newRefreshToken);
              isRefreshing = false;
              onRefreshed(newAccessToken);

              // Retry original request with new token
              headers.set('Authorization', `Bearer ${newAccessToken}`);
              const retryRes = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers,
                credentials: 'omit',
              });
              return await retryRes.json();
            }
          } catch (refreshErr) {
            console.error('Silent token refresh error:', refreshErr);
          } finally {
            isRefreshing = false;
          }
        } else {
          // Wait for the active refresh to finish
          return new Promise<ApiResponse<T>>((resolve) => {
            refreshSubscribers.push(async (newToken: string) => {
              headers.set('Authorization', `Bearer ${newToken}`);
              try {
                const retryRes = await fetch(`${API_BASE_URL}${endpoint}`, {
                  ...options,
                  headers,
                  credentials: 'omit',
                });
                resolve(await retryRes.json());
              } catch (e: any) {
                resolve({ success: false, message: e.message });
              }
            });
          });
        }
      }

      // If refresh failed or not available, clear auth and redirect to login if not already on a public/portal page
      const pathname = window.location.pathname;
      if (!pathname.startsWith('/login') && !pathname.startsWith('/portal/') && !pathname.startsWith('/enquiry/')) {
        setAuthToken(null, null);
        window.location.href = '/login?expired=1';
        return {
          success: false,
          message: 'Session expired. Redirecting to login...',
        };
      }
    }

    return data;
  } catch (err: any) {
    console.error('API Request failed:', endpoint, err);
    return {
      success: false,
      message: err.message || 'Network error communicating with Grand Bandhan API.',
    };
  }
}
