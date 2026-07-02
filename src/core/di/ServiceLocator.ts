import { IAuditLogService } from '../../domain/services/IAuditLogService';
import { FirestoreAuditLogService } from '../../infrastructure/audit/FirestoreAuditLogService';

import { IDocumentService } from '../../domain/services/IDocumentService';
import { MockDocumentService } from '../../infrastructure/documents/MockDocumentService';

import { IStorageService } from '../../domain/services/IStorageService';
import { FirebaseStorageDataSource } from '../../infrastructure/firebase/FirebaseStorageDataSource';

import { NotificationFacade } from '../../features/notifications/NotificationFacade';

export class ServiceLocator {
  private static auditLogger: IAuditLogService;
  private static documentService: IDocumentService;
  private static storageService: IStorageService;
  private static notificationFacade: NotificationFacade;

  static getAuditLogger(): IAuditLogService {
    if (!this.auditLogger) {
      this.auditLogger = new FirestoreAuditLogService();
    }
    return this.auditLogger;
  }

  static getDocumentService(): IDocumentService {
    if (!this.documentService) {
      this.documentService = new MockDocumentService();
    }
    return this.documentService;
  }

  static getStorageService(): IStorageService {
    if (!this.storageService) {
      this.storageService = new FirebaseStorageDataSource();
    }
    return this.storageService;
  }

  static getNotificationFacade(): NotificationFacade {
    if (!this.notificationFacade) {
      this.notificationFacade = new NotificationFacade(
        {} as any, {} as any, {} as any, {} as any
      );
    }
    return this.notificationFacade;
  }

  // Allows injecting mocks for tests
  static provideAuditLogger(mock: IAuditLogService) {
    this.auditLogger = mock;
  }
}
