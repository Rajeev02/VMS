import { TokenManager } from '../../core/network/TokenManager';
import Logger from '../../core/logger/Logger';

// Mock Repository for Authentication
export class AuthRepository {
  static async login(email: string, password: string) {
    Logger.info(`AuthRepository: login called for ${email}`);
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (email === 'admin@vms.com' && password === 'password') {
      const response = {
        accessToken: 'mock_admin_access_token',
        refreshToken: 'mock_admin_refresh_token',
        user: {
          id: '1',
          name: 'Admin User',
          email,
          role: 'ADMIN',
          permissions: ['ALL'],
        },
      };
      await TokenManager.saveTokens(response.accessToken, response.refreshToken);
      return response;
    }

    if (email === 'security@vms.com' && password === 'password') {
      const response = {
        accessToken: 'mock_security_access_token',
        refreshToken: 'mock_security_refresh_token',
        user: {
          id: '2',
          name: 'Security Guard',
          email,
          role: 'SECURITY',
          permissions: ['SCAN_QR', 'CHECK_IN', 'CHECK_OUT', 'REGISTER_WALK_IN'],
        },
      };
      await TokenManager.saveTokens(response.accessToken, response.refreshToken);
      return response;
    }

    throw new Error('Invalid credentials');
  }

  static async logout() {
    Logger.info('AuthRepository: logout called');
    await TokenManager.clearTokens();
  }

  static async fetchProfile() {
    Logger.info('AuthRepository: fetchProfile called');
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // In a real app, this would use the ApiClient to fetch `/auth/me`
    // Returning admin mock for now. In reality, would depend on token.
    return {
      id: '1',
      name: 'Admin User',
      email: 'admin@vms.com',
      role: 'ADMIN',
      permissions: ['ALL'],
    };
  }
}
