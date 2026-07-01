import StorageManager from '../../core/storage/StorageManager';
import { VisitorPass, PassStatus } from '../models/VisitorPass';

export class VisitorPassRepository {
  private static COLLECTION = 'visitor_passes';
  private static storage = StorageManager.getProvider();

  static async getById(id: string): Promise<VisitorPass | null> {
    return this.storage.getById<VisitorPass>(this.COLLECTION, id);
  }

  static async getByVisitId(visitId: string): Promise<VisitorPass | null> {
    const results = await this.storage.query<VisitorPass>(this.COLLECTION, { visitId });
    return results.length > 0 ? results[0] : null;
  }
  
  static async getByQrToken(qrToken: string): Promise<VisitorPass | null> {
    const results = await this.storage.query<VisitorPass>(this.COLLECTION, { qrToken });
    return results.length > 0 ? results[0] : null;
  }
  
  static async getByPassId(passId: string): Promise<VisitorPass | null> {
    const results = await this.storage.query<VisitorPass>(this.COLLECTION, { passId });
    return results.length > 0 ? results[0] : null;
  }

  static async create(data: Partial<VisitorPass>): Promise<VisitorPass> {
    const newPass: Partial<VisitorPass> = {
      ...data,
      status: data.status || PassStatus.GENERATED,
      passId: data.passId || `VX-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      qrToken: data.qrToken || Math.random().toString(36).substring(2, 15),
      generatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return this.storage.create<VisitorPass>(this.COLLECTION, newPass);
  }

  static async update(id: string, data: Partial<VisitorPass>): Promise<VisitorPass> {
    data.updatedAt = new Date().toISOString();
    return this.storage.update<VisitorPass>(this.COLLECTION, id, data);
  }
}
