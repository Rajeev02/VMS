import StorageManager from '../../core/storage/StorageManager';
import { AuditLog } from '../models/AuditLog';

export class AuditRepository {
  private static COLLECTION = 'audit_logs';
  private static storage = StorageManager.getProvider();

  static async log(data: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog> {
    const newLog: Partial<AuditLog> = {
      ...data,
      timestamp: new Date().toISOString(),
    };
    // Audit logs are fire-and-forget in most cases, but we await here for consistency
    return this.storage.create<AuditLog>(this.COLLECTION, newLog);
  }

  static async getLogsForEntity(entityType: string, entityId: string): Promise<AuditLog[]> {
    return this.storage.query<AuditLog>(this.COLLECTION, { entityType, entityId });
  }
}
