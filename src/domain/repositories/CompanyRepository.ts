import { Company } from '../models/Company';
import { ICrudDataSource } from '../datasources/ICrudDataSource';
import { FirebaseCrudDataSource } from '../../infrastructure/firebase/FirebaseCrudDataSource';

export class CompanyRepository {
  private static dataSource: ICrudDataSource<Company> = new FirebaseCrudDataSource<Company>('companies');

  static async create(company: Company): Promise<Company> {
    return this.dataSource.create(company, company.id);
  }

  static async getById(id: string): Promise<Company | null> {
    return this.dataSource.getById(id);
  }

  static async getAll(): Promise<Company[]> {
    return this.dataSource.getAll();
  }
}
