import { VisitorPassRepository } from '../../../domain/repositories/VisitorPassRepository';
import { VisitRepository } from '../../../domain/repositories/VisitRepository';
import { VisitorRepository } from '../../visitor/VisitorRepository';
import { PassStatus, VisitStatus } from '../../../domain/models/enums';
import { Visit } from '../../../domain/models/Visit';
import { Visitor } from '../../../domain/models/Visitor';
import { VisitorPass } from '../../../domain/models/VisitorPass';
import { IAuditLogService, AuditAction } from '../../../domain/services/IAuditLogService';
import { ServiceLocator } from '../../../core/di/ServiceLocator';
import Logger from '../../../core/logger/Logger';

export interface QrValidationResult {
  isValid: boolean;
  pass?: VisitorPass;
  visit?: Visit;
  visitor?: Visitor;
  error?: string;
}

export class ValidateQrScanUseCase {
  private auditLogger: IAuditLogService;

  constructor(auditLogger?: IAuditLogService) {
    this.auditLogger = auditLogger || ServiceLocator.getAuditLogger();
  }

  async execute(qrToken: string): Promise<QrValidationResult> {
    Logger.info(`[ValidateQrScanUseCase] Validating token: ${qrToken}`);

    try {
      const firestore = require('@react-native-firebase/firestore').default;
      const passesSnapshot = await firestore().collection('visitor_passes').where('qrToken', '==', qrToken).limit(1).get();
      
      if (passesSnapshot.empty) {
        await this.auditLogger.logEvent({ action: AuditAction.QR_SCANNED, details: { qrToken, status: 'INVALID', error: 'Pass not found' }});
        return { isValid: false, error: 'Invalid QR Code. No pass found.' };
      }
      
      const passData = passesSnapshot.docs[0].data();
      const pass = passData as VisitorPass;

      if (pass.status === PassStatus.EXPIRED) {
        await this.auditLogger.logEvent({ action: AuditAction.QR_SCANNED, visitId: pass.visitId, visitorId: pass.visitorId, details: { qrToken, status: 'INVALID', error: 'EXPIRED' }});
        return { isValid: false, error: 'Pass is EXPIRED.', pass };
      }
      
      if (pass.status === PassStatus.REVOKED) {
        await this.auditLogger.logEvent({ action: AuditAction.QR_SCANNED, visitId: pass.visitId, visitorId: pass.visitorId, details: { qrToken, status: 'INVALID', error: 'REVOKED' }});
        return { isValid: false, error: 'Pass has been REVOKED.', pass };
      }

      // Check validity window
      const now = new Date().getTime();
      const validUntil = new Date(pass.validUntil || 0).getTime();
      
      if (now > validUntil) {
        await this.auditLogger.logEvent({ action: AuditAction.QR_SCANNED, visitId: pass.visitId, visitorId: pass.visitorId, details: { qrToken, status: 'INVALID', error: 'WINDOW_EXPIRED' }});
        return { isValid: false, error: 'Pass is EXPIRED.', pass };
      }

      // Fetch related data
      const visitSnap = await firestore().collection('visits').doc(pass.visitId).get();
      if (!visitSnap.exists) {
        await this.auditLogger.logEvent({ action: AuditAction.QR_SCANNED, details: { qrToken, status: 'INVALID', error: 'Visit not found' }});
        return { isValid: false, error: 'Associated visit not found.', pass };
      }
      const visit = visitSnap.data() as Visit;

      const visitorSnap = await firestore().collection('visitors').doc(pass.visitorId).get();
      if (!visitorSnap.exists) {
         await this.auditLogger.logEvent({ action: AuditAction.QR_SCANNED, details: { qrToken, status: 'INVALID', error: 'Visitor not found' }});
         return { isValid: false, error: 'Associated visitor not found.', pass };
      }
      const visitor = visitorSnap.data() as Visitor;

      await this.auditLogger.logEvent({ action: AuditAction.QR_SCANNED, visitId: pass.visitId, visitorId: pass.visitorId, details: { qrToken, status: 'VALID' }});


      return {
        isValid: true,
        pass,
        visit,
        visitor
      };

    } catch (error) {
      Logger.error(`[ValidateQrScanUseCase] Error processing token:`, error);
      return { isValid: false, error: 'System error during validation.' };
    }
  }
}
