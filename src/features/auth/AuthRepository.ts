import { SecureStorage } from '../../core/storage/SecureStorage';
import Logger from '../../core/logger/Logger';
import { AuditRepository } from '../../domain/repositories/AuditRepository';
import { AuditAction } from '../../domain/models/enums';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: string;
}

export class AuthRepository {
  private static readonly TOKENS_KEY = 'vms_auth_tokens';
  private static readonly SESSION_KEY = 'vms_user_session';

  /**
   * Mock Login returning JWT Tokens
   */
  static async login(email: string, password: string): Promise<{ user: UserSession, tokens: AuthTokens }> {
    Logger.info(`[AuthRepository] Attempting login for ${email}`);
    await new Promise((resolve) => setTimeout(resolve, 800));

    let role = 'HOST';
    if (email.includes('security')) role = 'SECURITY';
    if (email.includes('admin')) role = 'ADMIN';

    // Mock successful authentication
    const user: UserSession = {
      id: Math.random().toString(36).substr(2, 9),
      name: email.split('@')[0],
      email: email,
      role: role,
    };

    const tokens: AuthTokens = {
      accessToken: `mock-jwt-access-${Date.now()}`,
      refreshToken: `mock-jwt-refresh-${Date.now()}`,
    };

    await this.saveSession(user, tokens);
    
    // Audit log
    await AuditRepository.log({
      action: AuditAction.LOGIN,
      entityType: 'AUTH',
      entityId: user.id,
      whoId: user.id,
      whoRole: role,
    });

    return { user, tokens };
  }

  /**
   * Refresh the access token using the refresh token
   */
  static async refreshToken(): Promise<AuthTokens> {
    Logger.info(`[AuthRepository] Refreshing Token`);
    const tokens = await SecureStorage.getItem<AuthTokens>(this.TOKENS_KEY);
    if (!tokens || !tokens.refreshToken) {
      throw new Error('No refresh token available');
    }

    // Mock refreshing token
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newTokens: AuthTokens = {
      accessToken: `mock-jwt-access-${Date.now()}`,
      refreshToken: `mock-jwt-refresh-${Date.now()}`, // Optional: rotate refresh token
    };

    const user = await SecureStorage.getItem<UserSession>(this.SESSION_KEY);
    if (user) {
      await this.saveSession(user, newTokens);
    }
    
    return newTokens;
  }

  static async logout(): Promise<void> {
    Logger.info(`[AuthRepository] Logging out`);
    const user = await SecureStorage.getItem<UserSession>(this.SESSION_KEY);
    if (user) {
      await AuditRepository.log({
        action: AuditAction.LOGOUT,
        entityType: 'AUTH',
        entityId: user.id,
        whoId: user.id,
        whoRole: user.role,
      });
    }

    await SecureStorage.removeItem(this.TOKENS_KEY);
    await SecureStorage.removeItem(this.SESSION_KEY);
  }

  static async restoreSession(): Promise<UserSession | null> {
    try {
      const tokens = await SecureStorage.getItem<AuthTokens>(this.TOKENS_KEY);
      const user = await SecureStorage.getItem<UserSession>(this.SESSION_KEY);
      
      if (tokens && user) {
        // In a real app, you would check if the access token is expired 
        // and optionally call refreshToken() here before restoring the session.
        return user;
      }
      return null;
    } catch (e) {
      Logger.error('[AuthRepository] Failed to restore session', e);
      return null;
    }
  }

  private static async saveSession(user: UserSession, tokens: AuthTokens): Promise<void> {
    await SecureStorage.setItem(this.TOKENS_KEY, tokens);
    await SecureStorage.setItem(this.SESSION_KEY, user);
  }
}
