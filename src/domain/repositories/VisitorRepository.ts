import StorageManager from '../../core/storage/StorageManager';
import { Visitor, VisitorStatus } from '../models/Visitor';

export class VisitorRepository {
  private static COLLECTION = 'visitors';
  private static storage = StorageManager.getProvider();

  static async getById(id: string): Promise<Visitor | null> {
    return this.storage.getById<Visitor>(this.COLLECTION, id);
  }

  static async findByPhone(phone: string): Promise<Visitor | null> {
    const results = await this.storage.query<Visitor>(this.COLLECTION, { phone });
    return results.length > 0 ? results[0] : null;
  }

  static async findByEmail(email: string): Promise<Visitor | null> {
    const results = await this.storage.query<Visitor>(this.COLLECTION, { email });
    return results.length > 0 ? results[0] : null;
  }

  static async findByGovId(governmentId: string): Promise<Visitor | null> {
    const results = await this.storage.query<Visitor>(this.COLLECTION, { governmentId });
    return results.length > 0 ? results[0] : null;
  }

  static async create(data: Partial<Visitor>): Promise<Visitor> {
    const newVisitor: Partial<Visitor> = {
      ...data,
      status: VisitorStatus.ACTIVE,
      totalVisits: 0,
      previousHosts: [],
      previousPurposes: [],
      previousCompanies: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return this.storage.create<Visitor>(this.COLLECTION, newVisitor);
  }

  static async update(id: string, data: Partial<Visitor>): Promise<Visitor> {
    data.updatedAt = new Date().toISOString();
    return this.storage.update<Visitor>(this.COLLECTION, id, data);
  }
}
