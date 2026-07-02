import { IAuditLogService, AuditEvent } from '../../domain/services/IAuditLogService';
import Logger from '../../core/logger/Logger';

export class FirestoreAuditLogService implements IAuditLogService {
  async logEvent(event: AuditEvent): Promise<void> {
    try {
      const firestore = require('@react-native-firebase/firestore').default;
      
      const payload = {
        ...event,
        timestamp: event.timestamp || new Date().toISOString(),
      };
      
      Logger.info(`[AuditLogService] Recording event: ${event.action}`, payload);
      await firestore().collection('system_audit_logs').add(payload);
    } catch (error) {
      Logger.error(`[AuditLogService] Failed to record audit log for action: ${event.action}`, error);
      // In a real critical system, we might push to a fallback queue or retry.
    }
  }
}
