import { VisitorPass } from '../models/VisitorPass';

export interface IPassDataSource {
  getPassById(id: string): Promise<VisitorPass | null>;
  getPassByToken(token: string): Promise<VisitorPass | null>;
  getPassByVisitId(visitId: string): Promise<VisitorPass | null>;
  createPass(pass: Partial<VisitorPass>): Promise<VisitorPass>;
  updatePass(id: string, updates: Partial<VisitorPass>): Promise<VisitorPass>;
}
