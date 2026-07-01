import { Floor } from '../models/Floor';
import { ICrudDataSource } from '../datasources/ICrudDataSource';
import { FirebaseCrudDataSource } from '../../infrastructure/firebase/FirebaseCrudDataSource';

export class FloorRepository {
  private static dataSource: ICrudDataSource<Floor> = new FirebaseCrudDataSource<Floor>('floors');

  static async create(floor: Floor): Promise<Floor> {
    return this.dataSource.create(floor, floor.id);
  }

  static async getAll(): Promise<Floor[]> {
    return this.dataSource.getAll();
  }
}
