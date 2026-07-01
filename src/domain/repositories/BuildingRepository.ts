import { Building } from '../models/Building';
import { ICrudDataSource } from '../datasources/ICrudDataSource';
import { FirebaseCrudDataSource } from '../../infrastructure/firebase/FirebaseCrudDataSource';

export class BuildingRepository {
  private static dataSource: ICrudDataSource<Building> = new FirebaseCrudDataSource<Building>('buildings');

  static async create(building: Building): Promise<Building> {
    return this.dataSource.create(building, building.id);
  }

  static async getAll(): Promise<Building[]> {
    return this.dataSource.getAll();
  }
}
