import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import { User, UserRole } from '@grand-bandhan/shared';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
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
