import { VisitorRepository } from '../VisitorRepository';
import Logger from '../../../core/logger/Logger';
import { Visit } from '../../../domain/models/Visit';
import { VisitRepository } from '../../../domain/repositories/VisitRepository';
import { IAuditLogService, AuditAction } from '../../../domain/services/IAuditLogService';
import { ServiceLocator } from '../../../core/di/ServiceLocator';

export class ProcessCheckOutUseCase {
  private auditLogger: IAuditLogService;

  constructor(auditLogger?: IAuditLogService) {
    this.auditLogger = auditLogger || ServiceLocator.getAuditLogger();
  }

  async execute(visitId: string): Promise<void> {
    Logger.info(`[ProcessCheckOutUseCase] Executing for visitId=${visitId}`);
    
    // Validate visit exists
    const visit = await VisitRepository.getById(visitId);
    if (!visit) {
      throw new Error('Visit not found.');
    }

    // Delegate to repository for atomic transaction
    await VisitorRepository.executeCheckOutTransaction(visitId);
    
    // Log Audit
    await this.auditLogger.logEvent({
      action: AuditAction.CHECK_OUT,
      visitId: visitId,
      visitorId: visit.visitorId,
    });
    
    Logger.info(`[ProcessCheckOutUseCase] Check-out completed for visitId=${visitId}`);
  }
}
