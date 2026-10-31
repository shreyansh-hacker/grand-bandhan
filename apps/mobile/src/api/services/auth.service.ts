import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import { User, UserRole } from '@grand-bandhan/shared';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  phone?: string;
  agencyName?: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface MeResponse {
  success: boolean;
  data: {
    user: User;
  };
}

export interface GenericAuthResponse {
  success: boolean;
  message: string;
}

export const authService = {
  /**
   * Login with email and password against Render backend
   */
  async login(credentials: LoginRequest): Promise<LoginResponse['data']> {
    const response = await apiClient.post<LoginResponse>(ENDPOINTS.AUTH.LOGIN, credentials);
    if (!response.data.success || !response.data.data) {
      throw new Error('Invalid login response from server');
    }
    return response.data.data;
  },

  /**
   * Register new account (Royal Couple or Vendor)
   */
  async register(data: RegisterRequest): Promise<LoginResponse['data']> {
    const response = await apiClient.post<LoginResponse>(ENDPOINTS.AUTH.REGISTER, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data?.message || 'Registration failed');
    }
    return response.data.data;
  },

  /**
   * Request password reset instructions
   */
  async forgotPassword(email: string): Promise<string> {
    const response = await apiClient.post<GenericAuthResponse>(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
    return response.data.message || 'Password reset instructions have been dispatched.';
  },

  /**
   * Reset password with reset token
   */
  async resetPassword(token: string, newPassword: string): Promise<string> {
    const response = await apiClient.post<GenericAuthResponse>(ENDPOINTS.AUTH.RESET_PASSWORD, { token, newPassword });
    return response.data.message || 'Password has been successfully reset.';
  },

  /**
   * Get authenticated user profile via Bearer token
   */
  async getMe(): Promise<User> {
    const response = await apiClient.get<MeResponse>(ENDPOINTS.AUTH.ME);
    if (!response.data.success || !response.data.data?.user) {
      throw new Error('Could not fetch user profile');
    }
    return response.data.data.user;
  },

  /**
   * Terminate session on backend
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
    } catch (err) {
      // Ignore network errors during logout
    }
  },
};
