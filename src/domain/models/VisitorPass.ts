import { PassStatus } from './enums';

export interface VisitorPass {
  id: string;
  visitId: string;
  visitorId: string;
  
  passId: string; // User friendly ID e.g., "VX-1234"
  qrToken: string; // Secure token for QR generation
  
  status: PassStatus;
  
  validFrom: string; // ISO 8601 DateTime
  validUntil: string; // ISO 8601 DateTime
  gracePeriodMinutes: number; // e.g., 30
  
  publicUrl: string; // Secure public URL to view the pass in browser
  
  approvedBy?: string; // User ID
  instructions?: string; // e.g., "Please bring valid Gov ID"
  
  generatedAt: string;
  updatedAt: string;
}
