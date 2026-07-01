import { VisitorStatus } from './enums';

export interface Visitor {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  company?: string;
  governmentId?: string; // Should be encrypted/hashed in production
  photoUrl?: string;
  idCardUrl?: string;
  status: VisitorStatus;
  
  // Computed / Cached History Stats
  totalVisits: number;
  lastVisitDate?: string;
  previousHosts: string[];
  previousPurposes: string[];
  previousCompanies: string[];
  
  createdAt: string;
  updatedAt: string;
}
