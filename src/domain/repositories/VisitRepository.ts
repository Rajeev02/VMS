import StorageManager from '../../core/storage/StorageManager';
import { Visit, VisitStatus } from '../models/Visit';

export class VisitRepository {
  private static COLLECTION = 'visits';
  private static storage = StorageManager.getProvider();

  static async getById(id: string): Promise<Visit | null> {
    return this.storage.getById<Visit>(this.COLLECTION, id);
  }

  static async getVisitsByVisitor(visitorId: string): Promise<Visit[]> {
    return this.storage.query<Visit>(this.COLLECTION, { visitorId });
  }

  static async create(data: Partial<Visit>): Promise<Visit> {
    const newVisit: Partial<Visit> = {
      ...data,
      status: data.status || VisitStatus.DRAFT,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return this.storage.create<Visit>(this.COLLECTION, newVisit);
  }

  static async update(id: string, data: Partial<Visit>): Promise<Visit> {
    data.updatedAt = new Date().toISOString();
    return this.storage.update<Visit>(this.COLLECTION, id, data);
  }
}
