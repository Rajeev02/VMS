import { VisitorRepository } from '../VisitorRepository';
import { Visit } from '../../../domain/models/Visit';
import { VisitorPass } from '../../../domain/models/VisitorPass';
import { VisitStatus, PassStatus } from '../../../domain/models/enums';
import { NotificationFacade } from '../../notifications/NotificationFacade';
import { IAuditLogService, AuditAction } from '../../../domain/services/IAuditLogService';
import { ServiceLocator } from '../../../core/di/ServiceLocator';
import Logger from '../../../core/logger/Logger';

export class ProcessApprovalUseCase {
  private auditLogger: IAuditLogService;

  private notificationFacade: NotificationFacade;

  constructor(
    notificationFacade?: NotificationFacade,
    auditLogger?: IAuditLogService
  ) {
    this.notificationFacade = notificationFacade || ServiceLocator.getNotificationFacade();
    this.auditLogger = auditLogger || ServiceLocator.getAuditLogger();
  }

  async execute(visitId: string, action: 'APPROVE' | 'REJECT', hostId: string): Promise<Visit> {
    Logger.info(`[ProcessApprovalUseCase] visitId=${visitId} action=${action} hostId=${hostId}`);
    
    // In a real app we might check if this visit belongs to the host and is pending
    const status = action === 'APPROVE' ? VisitStatus.APPROVED : VisitStatus.REJECTED;
    
    const updatedVisit = await VisitorRepository.updateVisitStatus(visitId, status);
    
    // Log Audit
    const auditAction = action === 'APPROVE' ? AuditAction.VISIT_APPROVED : AuditAction.VISIT_REJECTED;
    await this.auditLogger.logEvent({
      action: auditAction,
      visitId: updatedVisit.id,
      visitorId: updatedVisit.visitorId,
      userId: hostId,
      details: {
        action: action
      }
    });
    
    // We need the visitor to send notifications
    const visitor = await VisitorRepository.getVisitorById(updatedVisit.visitorId);

    if (action === 'APPROVE') {
      Logger.info(`[ProcessApprovalUseCase] Triggering pass generation for approved visit ${visitId}`);
      // Assuming a pass is generated here
      const pass: VisitorPass = {
        id: 'mock-pass-id',
        visitId,
        visitorId: updatedVisit.visitorId,
        passId: `VX-APRV-${Math.floor(Math.random() * 9000)}`,
        qrToken: 'mock-token',
        status: PassStatus.GENERATED,
        publicUrl: 'https://rajeev02.github.io/vms/pass.html?token=mock',
        validFrom: updatedVisit.entryTime || new Date().toISOString(),
        validUntil: updatedVisit.expectedExitTime || new Date(Date.now() + 2*3600*1000).toISOString(),
        gracePeriodMinutes: 30,
        generatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await this.auditLogger.logEvent({
        action: AuditAction.PASS_GENERATED,
        visitId: updatedVisit.id,
        visitorId: updatedVisit.visitorId,
        details: { passId: pass.passId }
      });
      
      if (visitor) {
        await this.notificationFacade.sendPassGenerated(visitor, pass);
      }
    } else {
      if (visitor) {
        await this.notificationFacade.sendRejected(visitor);
      }
    }

    return updatedVisit;
  }
}

