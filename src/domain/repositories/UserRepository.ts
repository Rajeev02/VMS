import { AuthUser } from '../datasources/IAuthDataSource';
import { ICrudDataSource } from '../datasources/ICrudDataSource';
import { FirebaseCrudDataSource } from '../../infrastructure/firebase/FirebaseCrudDataSource';

export class UserRepository {
  private static dataSource: ICrudDataSource<AuthUser> = new FirebaseCrudDataSource<AuthUser>('users');

  static async create(user: AuthUser): Promise<AuthUser> {
    return this.dataSource.create(user, user.id);
  }

  static async getAll(): Promise<AuthUser[]> {
    return this.dataSource.getAll();
  }

  static async getById(id: string): Promise<AuthUser | null> {
    return this.dataSource.getById(id);
  }
}
