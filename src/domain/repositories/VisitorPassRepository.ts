import Logger from '../../core/logger/Logger';
import { IPassDataSource } from '../datasources/IPassDataSource';
import { FirebasePassDataSource } from '../../infrastructure/firebase/FirebasePassDataSource';
import { VisitorPass } from '../models/VisitorPass';

export class VisitorPassRepository {
  private static passDS: IPassDataSource = new FirebasePassDataSource();

  static async getById(id: string): Promise<VisitorPass | null> {
    Logger.info(`[VisitorPassRepository] getById id=${id}`);
    return await this.passDS.getPassById(id);
  }

  static async getByPassId(passId: string): Promise<VisitorPass | null> {
    Logger.info(`[VisitorPassRepository] getByPassId passId=${passId}`);
    return await this.passDS.getPassById(passId); // Assuming passId is id for now
  }

  static async getByQrToken(qrToken: string): Promise<VisitorPass | null> {
    Logger.info(`[VisitorPassRepository] getByQrToken token=${qrToken}`);
    return await this.passDS.getPassByToken(qrToken);
  }

  static async getByVisitId(visitId: string): Promise<VisitorPass | null> {
    Logger.info(`[VisitorPassRepository] getByVisitId visitId=${visitId}`);
    return await this.passDS.getPassByVisitId(visitId);
  }

  static async createPass(pass: Partial<VisitorPass>): Promise<VisitorPass> {
    Logger.info(`[VisitorPassRepository] createPass`);
    return await this.passDS.createPass(pass);
  }
}
