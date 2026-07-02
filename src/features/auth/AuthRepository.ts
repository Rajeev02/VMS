import Logger from '../../core/logger/Logger';
import { AuditRepository } from '../../domain/repositories/AuditRepository';
import { AuditAction } from '../../domain/models/enums';
import { IAuthDataSource, AuthUser } from '../../domain/datasources/IAuthDataSource';
import { FirebaseAuthDataSource } from '../../infrastructure/firebase/FirebaseAuthDataSource';
import SecureStorage from '../../core/storage/SecureStorage';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export type UserSession = AuthUser;

export class AuthRepository {
  private static readonly TOKENS_KEY = 'vms_auth_tokens';
  private static readonly SESSION_KEY = 'vms_user_session';
  
  // In a strict DI container setup (e.g. Inversify), this would be injected.
  // For this assignment, we instantiate the specific Firebase data source here as the composition root,
  // but note that the rest of the file relies only on the `IAuthDataSource` interface.
  private static dataSource: IAuthDataSource = new FirebaseAuthDataSource();

  static async login(email: string, password: string): Promise<{ user: UserSession, tokens: AuthTokens }> {
    Logger.info(`[AuthRepository] Attempting login for ${email}`);
    
    // The repository delegates to the Data Source
    const user = await this.dataSource.login(email, password);
    const tokenStr = await this.dataSource.refreshToken();

    const tokens: AuthTokens = {
      accessToken: tokenStr,
      refreshToken: tokenStr, // In Firebase, the JS SDK manages refresh automatically, but we store for legacy compatibility
    };

    await this.saveSession(user, tokens);
    
    await AuditRepository.log({
      action: AuditAction.LOGIN,
      entityType: 'AUTH',
      entityId: user.id,
      whoId: user.id,
      whoRole: user.role,
    });

    return { user, tokens };
  }

  static async refreshToken(): Promise<AuthTokens> {
    Logger.info(`[AuthRepository] Refreshing Token`);
    
    const tokenStr = await this.dataSource.refreshToken();
    const newTokens: AuthTokens = {
      accessToken: tokenStr,
      refreshToken: tokenStr,
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

    await this.dataSource.logout();
    await SecureStorage.removeItem(this.TOKENS_KEY);
    await SecureStorage.removeItem(this.SESSION_KEY);
  }

  static async restoreSession(): Promise<UserSession | null> {
    try {
      // Check data source first for auto-login capabilities
      const currentUser = await this.dataSource.getCurrentUser();
      if (currentUser) {
        return currentUser;
      }
      
      // Fallback: check SecureStorage
      // Firebase auth state initialization is async, so we might hit this before Firebase is ready.
      // Returning the cached session ensures the user isn't unexpectedly logged out on app launch.
      const storedUser = await SecureStorage.getItem<UserSession>(this.SESSION_KEY);
      return storedUser || null;
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

