export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  organizationId: string;
  permissions: string[];
}

export interface IAuthDataSource {
  login(email: string, password: string): Promise<AuthUser>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<AuthUser | null>;
  refreshToken(): Promise<string>;
  updateProfile(name: string, photoUrl?: string): Promise<void>;
  updatePassword(password: string): Promise<void>;
}
