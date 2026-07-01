import { Role } from '../models/Role';
import { ICrudDataSource } from '../datasources/ICrudDataSource';
import { FirebaseCrudDataSource } from '../../infrastructure/firebase/FirebaseCrudDataSource';

export class RoleRepository {
  private static dataSource: ICrudDataSource<Role> = new FirebaseCrudDataSource<Role>('roles');

  static async create(role: Role): Promise<Role> {
    return this.dataSource.create(role, role.id);
  }

  static async getAll(): Promise<Role[]> {
    return this.dataSource.getAll();
  }
}
