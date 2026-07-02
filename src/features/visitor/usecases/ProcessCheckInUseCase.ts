import { VisitorRepository } from '../VisitorRepository';
import { VisitRepository } from '../../../domain/repositories/VisitRepository';
// HostRepository removed
import { NotificationFacade } from '../../notifications/NotificationFacade';
import { IStorageService } from '../../../domain/services/IStorageService';
import { IAuditLogService, AuditAction } from '../../../domain/services/IAuditLogService';
import { ServiceLocator } from '../../../core/di/ServiceLocator';
import Logger from '../../../core/logger/Logger';
import { Visit } from '../../../domain/models/Visit';

export interface ProcessCheckInPayload {
  visitId: string;
  qrToken?: string;
  newPhotoLocalUri?: string;
  badgeNumber?: string;
}

export class ProcessCheckInUseCase {
  private auditLogger: IAuditLogService;
  private notificationFacade: NotificationFacade;
  private storageService: IStorageService;

  constructor(
    notificationFacade?: any,
    storageService?: IStorageService,
    auditLogger?: IAuditLogService
  ) {
    this.notificationFacade = notificationFacade || ServiceLocator.getNotificationFacade();
    this.storageService = storageService || ServiceLocator.getStorageService();
    this.auditLogger = auditLogger || ServiceLocator.getAuditLogger();
  }

  async execute(payload: ProcessCheckInPayload): Promise<Visit> {
    Logger.info(`[ProcessCheckInUseCase] Executing for visitId=${payload.visitId}`);
    
    // 1. Fetch related entities
    const visit = await VisitRepository.getById(payload.visitId);
    if (!visit) {
      throw new Error('Visit not found.');
    }
    
    const visitor = await VisitorRepository.getVisitorById(visit.visitorId);
    if (!visitor) {
      throw new Error('Visitor not found.');
    }

    // 2. Handle optional live photo capture
    let updatedVisitor = visitor;
    if (payload.newPhotoLocalUri) {
      Logger.info(`[ProcessCheckInUseCase] Uploading new live photo for visitor`);
      const newPhotoUrl = await this.storageService.uploadFile(payload.newPhotoLocalUri, 'visitors/photos/live/');
      updatedVisitor = await VisitorRepository.updateVisitor(visitor.id, { photoUrl: newPhotoUrl });
    }

    // 3. Execute the Firestore Check-In Transaction safely in the Data layer
    Logger.info(`[ProcessCheckInUseCase] Delegating to VisitorRepository to run Firestore transaction.`);
    await VisitorRepository.executeCheckInTransaction(payload.visitId, payload.qrToken, payload.badgeNumber);

    // 3.5 Log the audit event
    await this.auditLogger.logEvent({
      action: AuditAction.CHECK_IN,
      visitId: payload.visitId,
      visitorId: visitor.id,
      details: { qrToken: payload.qrToken }
    });

    // 4. Send Notifications
    try {
      // Fallback for mocked host since HostRepository doesn't exist
      await this.notificationFacade.sendCheckInAlert(updatedVisitor, { id: visit.hostId, name: 'Unknown Host' });
    } catch (e) {
      Logger.warn('[ProcessCheckInUseCase] Failed to send Check-In Alert notification', e);
    }

    // Fetch and return the updated visit
    const updatedVisit = await VisitRepository.getById(payload.visitId);
    return updatedVisit as Visit;
  }
}
