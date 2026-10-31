import { create } from 'zustand';
import { User, UserRole } from '@grand-bandhan/shared';
import {
  saveAuthSession,
  getAuthSession,
  clearAuthSession,
} from '../utils/storage';
import { authService, LoginRequest } from '../api/services/auth.service';
import { registerSessionExpiryHandler } from '../api/client';

interface AuthState {
  user: User | null;
  role: UserRole | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isHydrating: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Wire 401 interceptor callback to clear session
  registerSessionExpiryHandler(() => {
    set({
      user: null,
      role: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      error: 'Your session has expired. Please log in again.',
    });
  });

  return {
    user: null,
    role: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isHydrating: true,
    isLoading: false,
    error: null,

    hydrate: async () => {
      try {
        set({ isHydrating: true, error: null });
        const session = await getAuthSession();

        if (session && session.accessToken && session.user) {
          set({
            user: session.user,
            role: session.user.role,
            accessToken: session.accessToken,
            refreshToken: session.refreshToken,
            isAuthenticated: true,
            isHydrating: false,
          });

          // Verify token validity by calling /me in background
          try {
            const freshUser = await authService.getMe();
            if (freshUser) {
              set({ user: freshUser, role: freshUser.role });
            }
          } catch (err) {
            console.warn('Background profile refresh failed:', err);
          }
        } else {
          set({
            user: null,
            role: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isHydrating: false,
          });
        }
      } catch (err: any) {
        console.warn('Could not restore Keystore session:', err);
        set({
          user: null,
          role: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isHydrating: false,
        });
      }
    },

    login: async (credentials: LoginRequest) => {
      try {
        set({ isLoading: true, error: null });
        const data = await authService.login(credentials);

        // Store securely in Android Keystore
        await saveAuthSession({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          user: data.user,
        });

        set({
          user: data.user,
          role: data.user.role,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch (err: any) {
        set({
          isLoading: false,
          error: err.message || 'Login failed. Please check your credentials.',
        });
        throw err;
      }
    },

    logout: async () => {
      try {
        set({ isLoading: true });
        await authService.logout();
      } catch (err) {
        console.warn('Logout network call error:', err);
      } finally {
        await clearAuthSession();
        set({
          user: null,
          role: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    },

    clearError: () => set({ error: null }),

    setUser: (user: User) => set({ user, role: user.role }),
  };
});
