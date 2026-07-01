import SecureStorage from '../storage/SecureStorage';

const ACCESS_TOKEN_KEY = 'ACCESS_TOKEN';
const REFRESH_TOKEN_KEY = 'REFRESH_TOKEN';

export class TokenManager {
  static async getAccessToken(): Promise<string | null> {
    return SecureStorage.getItem(ACCESS_TOKEN_KEY);
  }

  static async getRefreshToken(): Promise<string | null> {
    return SecureStorage.getItem(REFRESH_TOKEN_KEY);
  }

  static async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    await SecureStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    await SecureStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  static async clearTokens(): Promise<void> {
    await SecureStorage.removeItem(ACCESS_TOKEN_KEY);
    await SecureStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}
