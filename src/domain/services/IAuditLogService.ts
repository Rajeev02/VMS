export enum AuditAction {
  VISIT_CREATED = 'VISIT_CREATED',
  VISIT_APPROVED = 'VISIT_APPROVED',
  VISIT_REJECTED = 'VISIT_REJECTED',
  PASS_GENERATED = 'PASS_GENERATED',
  QR_SCANNED = 'QR_SCANNED',
  CHECK_IN = 'CHECK_IN',
  CHECKPOINT_VERIFIED = 'CHECKPOINT_VERIFIED',
  CHECK_OUT = 'CHECK_OUT',
  MANUAL_OVERRIDE = 'MANUAL_OVERRIDE',
}

export interface AuditEvent {
  action: AuditAction;
  visitId?: string;
  visitorId?: string;
  userId?: string; // The guard/receptionist performing the action
  details?: Record<string, any>;
  timestamp?: string;
}

export interface IAuditLogService {
  logEvent(event: AuditEvent): Promise<void>;
}
