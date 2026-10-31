import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from './endpoints';
import { getStoredAccessToken, clearAuthSession } from '../utils/storage';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Attach Keystore-backed Access Token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await getStoredAccessToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.warn('Could not retrieve access token for request:', err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Session expiry callback listener (wired to Zustand store)
type SessionExpiryListener = () => void;
let onSessionExpiredListener: SessionExpiryListener | null = null;

export function registerSessionExpiryHandler(listener: SessionExpiryListener) {
  onSessionExpiredListener = listener;
}

// Response Interceptor: Format errors and handle 401 session expiry
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string; error?: string }>) => {
    const isLoginRequest = error.config?.url?.includes('/api/auth/login');
    if (error.response?.status === 401 && !isLoginRequest) {
      console.warn('API returned 401 Unauthorized - session expired');
      await clearAuthSession();
      if (onSessionExpiredListener) {
        onSessionExpiredListener();
      }
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected network error occurred';

    return Promise.reject(new Error(message));
  }
);
