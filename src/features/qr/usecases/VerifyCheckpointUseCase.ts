import { ValidateQrScanUseCase, QrValidationResult } from './ValidateQrScanUseCase';
import { VisitorRepository } from '../../visitor/VisitorRepository';
import { IAuditLogService, AuditAction } from '../../../domain/services/IAuditLogService';
import { ServiceLocator } from '../../../core/di/ServiceLocator';
import Logger from '../../../core/logger/Logger';

export interface VerifyCheckpointPayload {
  qrToken: string;
  checkpointName: string;
  scannedBy: string; // User ID of the guard
}

export class VerifyCheckpointUseCase {
  private auditLogger: IAuditLogService;

  constructor(
    private validateQrUseCase: ValidateQrScanUseCase,
    auditLogger?: IAuditLogService
  ) {
    this.auditLogger = auditLogger || ServiceLocator.getAuditLogger();
  }

  async execute(payload: VerifyCheckpointPayload): Promise<QrValidationResult> {
    Logger.info(`[VerifyCheckpointUseCase] Executing for token=${payload.qrToken} at checkpoint=${payload.checkpointName}`);
    
    // 1. Validate the QR code using existing robust logic
    const validationResult = await this.validateQrUseCase.execute(payload.qrToken);
    
    if (!validationResult.isValid || !validationResult.pass) {
      return validationResult;
    }

    // 2. Log the checkpoint verification if valid
    try {
      await VisitorRepository.logCheckpointVerification(
        validationResult.pass.visitId,
        validationResult.pass.id,
        payload.checkpointName,
        payload.scannedBy
      );
      
      await this.auditLogger.logEvent({
        action: AuditAction.CHECKPOINT_VERIFIED,
        visitId: validationResult.pass.visitId,
        visitorId: validationResult.pass.visitorId,
        userId: payload.scannedBy,
        details: { checkpointName: payload.checkpointName, qrToken: payload.qrToken }
      });
      
      Logger.info(`[VerifyCheckpointUseCase] Successfully logged checkpoint verification.`);
    } catch (error) {
      Logger.error(`[VerifyCheckpointUseCase] Failed to log checkpoint verification`, error);
      // We don't fail the verification just because audit log failed, but we log the error.
    }

    return validationResult;
  }
}
