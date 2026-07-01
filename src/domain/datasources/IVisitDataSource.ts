import { Visit } from '../models/Visit';

export interface IVisitDataSource {
  getVisitById(id: string): Promise<Visit | null>;
  getVisitsByVisitor(visitorId: string): Promise<Visit[]>;
  getVisitsByHost(hostId: string): Promise<Visit[]>;
  getAllVisits(): Promise<Visit[]>;
  createVisit(visit: Partial<Visit>): Promise<Visit>;
  updateVisit(id: string, updates: Partial<Visit>): Promise<Visit>;
  subscribeToVisits(hostId: string, onUpdate: (visits: Visit[]) => void): () => void;
}
