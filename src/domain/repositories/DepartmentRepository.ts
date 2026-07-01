import { Department } from '../models/Department';
import { ICrudDataSource } from '../datasources/ICrudDataSource';
import { FirebaseCrudDataSource } from '../../infrastructure/firebase/FirebaseCrudDataSource';

export class DepartmentRepository {
  private static dataSource: ICrudDataSource<Department> = new FirebaseCrudDataSource<Department>('departments');

  static async create(department: Department): Promise<Department> {
    return this.dataSource.create(department, department.id);
  }

  static async getAll(): Promise<Department[]> {
    return this.dataSource.getAll();
  }
}
