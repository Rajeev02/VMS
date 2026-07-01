import Logger from '../../core/logger/Logger';
import { IVisitDataSource } from '../datasources/IVisitDataSource';
import { FirebaseVisitDataSource } from '../../infrastructure/firebase/FirebaseVisitDataSource';
import { Visit } from '../models/Visit';

export class VisitRepository {
  private static visitDS: IVisitDataSource = new FirebaseVisitDataSource();

  static async getById(id: string): Promise<Visit | null> {
    Logger.info(`[VisitRepository] getById id=${id}`);
    return await this.visitDS.getVisitById(id);
  }

  static async getVisitsByVisitor(visitorId: string): Promise<Visit[]> {
    Logger.info(`[VisitRepository] getVisitsByVisitor visitorId=${visitorId}`);
    return await this.visitDS.getVisitsByVisitor(visitorId);
  }

  static async getVisitsByHost(hostId: string): Promise<Visit[]> {
    Logger.info(`[VisitRepository] getVisitsByHost hostId=${hostId}`);
    return await this.visitDS.getVisitsByHost(hostId);
  }

  static async createVisit(visit: Partial<Visit>): Promise<Visit> {
    Logger.info(`[VisitRepository] createVisit`);
    return await this.visitDS.createVisit(visit);
  }

  static async updateVisit(id: string, updates: Partial<Visit>): Promise<Visit> {
    Logger.info(`[VisitRepository] updateVisit id=${id}`);
    return await this.visitDS.updateVisit(id, updates);
  }

  static subscribeToVisits(hostId: string, onUpdate: (visits: Visit[]) => void): () => void {
    Logger.info(`[VisitRepository] subscribeToVisits hostId=${hostId}`);
    return this.visitDS.subscribeToVisits(hostId, onUpdate);
  }
}
