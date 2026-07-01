import { VisitStatus } from './enums';

export interface Visit {
  id: string;
  visitorId: string;
  hostId: string;
  
  purpose: string;
  building?: string;
  floor?: string;
  
  status: VisitStatus;
  
  scheduledDate: string; // ISO 8601 Date
  entryTime?: string; // ISO 8601 DateTime
  expectedExitTime?: string; // ISO 8601 DateTime
  actualExitTime?: string; // ISO 8601 DateTime
  
  notes?: string;
  
  createdAt: string;
  updatedAt: string;
  createdBy: string; // User ID of who created it (Host or Security)
}
