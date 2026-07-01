import Logger from '../../core/logger/Logger';
import { IVisitorDataSource } from '../../domain/datasources/IVisitorDataSource';
import { IVisitDataSource } from '../../domain/datasources/IVisitDataSource';
import { IPassDataSource } from '../../domain/datasources/IPassDataSource';
import { FirebaseVisitorDataSource } from '../../infrastructure/firebase/FirebaseVisitorDataSource';
import { FirebaseVisitDataSource } from '../../infrastructure/firebase/FirebaseVisitDataSource';
import { FirebasePassDataSource } from '../../infrastructure/firebase/FirebasePassDataSource';
import { Visitor } from '../../domain/models/Visitor';
import { Visit } from '../../domain/models/Visit';
import { VisitorPass } from '../../domain/models/VisitorPass';
import { VisitStatus, PassStatus } from '../../domain/models/enums';

export class VisitorRepository {
  private static generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  private static visitorDS: IVisitorDataSource = new FirebaseVisitorDataSource();
  private static visitDS: IVisitDataSource = new FirebaseVisitDataSource();
  private static passDS: IPassDataSource = new FirebasePassDataSource();

  static async getVisitors(): Promise<Visitor[]> {
    Logger.info(`[VisitorRepository] getVisitors`);
    // Need to cast since IVisitorDataSource might not have getAllVisitors yet
    if ('getAllVisitors' in this.visitorDS) {
      return await (this.visitorDS as any).getAllVisitors();
    }
    return [];
  }

  static async getVisitorById(id: string): Promise<Visitor | null> {
    Logger.info(`[VisitorRepository] getVisitorById id=${id}`);
    return await this.visitorDS.getVisitorById(id);
  }

  static async searchVisitors(query: string): Promise<Visitor[]> {
    Logger.info(`[VisitorRepository] searchVisitors query=${query}`);
    return await this.visitorDS.searchVisitors(query);
  }

  static async getVisitorByPassQr(qrValue: string): Promise<Visitor | null> {
    Logger.info(`[VisitorRepository] getVisitorByPassQr qr=${qrValue}`);
    const pass = await this.passDS.getPassByToken(qrValue);
    if (!pass) return null;
    
    const visit = await this.visitDS.getVisitById(pass.visitId);
    if (!visit) return null;

    return await this.visitorDS.getVisitorById(visit.visitorId);
  }

  static async registerWalkInVisitor(visitorData: Partial<Visitor>, visitData: Partial<Visit>): Promise<{ visitor: Visitor, visit: Visit, pass: VisitorPass }> {
    Logger.info(`[VisitorRepository] registerWalkInVisitor`);
    
    // 1. Create or Update Visitor
    let visitor: Visitor;
    if (visitorData.id) {
      visitor = await this.visitorDS.updateVisitor(visitorData.id, visitorData);
    } else {
      visitor = await this.visitorDS.createVisitor(visitorData);
    }

    // 2. Create Visit
    const visit = await this.visitDS.createVisit({
      ...visitData,
      visitorId: visitor.id,
      status: VisitStatus.CHECKED_IN,
      entryTime: new Date().toISOString(),
    });

    // 3. Generate Pass
    const secureToken = this.generateUUID();
    const pass = await this.passDS.createPass({
      visitId: visit.id,
      qrToken: secureToken,
      token: secureToken, // For web portal compatibility
      visitorName: visitor.name, // For web portal compatibility
      hostName: "Host", // Fallback, could fetch actual host name if needed
      publicUrl: `https://rajeev02.github.io/vms/pass.html?token=${secureToken}`,
      status: PassStatus.GENERATED,
    });

    return { visitor, visit, pass };
  }

  static async updateVisitor(id: string, updates: Partial<Visitor>): Promise<Visitor> {
    return await this.visitorDS.updateVisitor(id, updates);
  }

  static async createVisitor(visitor: Partial<Visitor>): Promise<Visitor> {
    return await this.visitorDS.createVisitor(visitor);
  }
}

