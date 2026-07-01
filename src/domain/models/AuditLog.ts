import { AuditAction } from './enums';

export interface AuditLog {
  id: string;
  action: AuditAction;
  
  entityType: 'VISITOR' | 'VISIT' | 'PASS' | 'USER' | 'AUTH';
  entityId: string;
  
  whoId: string; // User ID performing the action
  whoRole?: string;
  
  whereIp?: string;
  whereDevice?: string;
  
  oldValue?: string; // JSON string representation
  newValue?: string; // JSON string representation
  
  timestamp: string; // ISO 8601 DateTime
}
