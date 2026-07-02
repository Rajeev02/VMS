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

  static async saveWalkInRegistration(visitor: Visitor, visit: Visit, pass: VisitorPass): Promise<void> {
    Logger.info(`[VisitorRepository] saveWalkInRegistration`);
    if ((await this.visitorDS.getVisitorById(visitor.id))) {
      await this.visitorDS.updateVisitor(visitor.id, visitor);
    } else {
      await this.visitorDS.createVisitor(visitor);
    }
    await this.visitDS.createVisit(visit);
    await this.passDS.createPass(pass);
  }

  static async getVisitsByHostAndStatus(hostId: string, status: VisitStatus): Promise<{ visit: Visit, visitor: Visitor | null }[]> {
    Logger.info(`[VisitorRepository] getVisitsByHostAndStatus hostId=${hostId} status=${status}`);
    const visits = await this.visitDS.getVisitsByHost(hostId);
    const filteredVisits = visits.filter(v => v.status === status);
    
    // Fetch associated visitors
    const result = await Promise.all(filteredVisits.map(async (visit) => {
      const visitor = await this.visitorDS.getVisitorById(visit.visitorId);
      return { visit, visitor };
    }));
    
    return result;
  }

  static async updateVisitStatus(visitId: string, status: VisitStatus): Promise<Visit> {
    Logger.info(`[VisitorRepository] updateVisitStatus visitId=${visitId} status=${status}`);
    return await this.visitDS.updateVisit(visitId, {
      status,
      updatedAt: new Date().toISOString()
    });
  }

  static async executeCheckInTransaction(visitId: string, qrToken: string): Promise<void> {
    Logger.info(`[VisitorRepository] executeCheckInTransaction visitId=${visitId} qrToken=${qrToken}`);
    const firestore = require('@react-native-firebase/firestore').default;
    
    // Using Firestore directly here as requested by User to retain transaction safety
    const passesSnapshot = await firestore().collection('visitor_passes').where('qrToken', '==', qrToken).limit(1).get();
    if (passesSnapshot.empty) {
        throw new Error('Pass not found or invalid in Firestore.');
    }
    const passDoc = passesSnapshot.docs[0];
    const visitRef = firestore().collection('visits').doc(visitId);

    await firestore().runTransaction(async (transaction: any) => {
        const visitSnap = await transaction.get(visitRef);
        if (!visitSnap.exists) {
            throw new Error('Visit record not found in Firestore.');
        }

        const visitData = visitSnap.data();
        if (visitData?.status === VisitStatus.CHECKED_IN) {
            throw new Error('Visitor is already checked in.');
        }

        // Execute check-in
        transaction.update(visitRef, {
            status: VisitStatus.CHECKED_IN,
            entryTime: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        // Update Pass status
        transaction.update(passDoc.ref, {
            status: 'CHECKED_IN',
            updatedAt: new Date().toISOString()
        });
    });
  }

  static async logCheckpointVerification(visitId: string, passId: string, checkpointName: string, scannedBy: string): Promise<void> {
    Logger.info(`[VisitorRepository] logCheckpointVerification visitId=${visitId} checkpoint=${checkpointName}`);
    const firestore = require('@react-native-firebase/firestore').default;
    
    await firestore().collection('checkpoint_logs').add({
      visitId,
      passId,
      checkpointName,
      scannedBy,
      timestamp: new Date().toISOString(),
    });
  }

  static async executeCheckOutTransaction(visitId: string): Promise<void> {
    Logger.info(`[VisitorRepository] executeCheckOutTransaction visitId=${visitId}`);
    const firestore = require('@react-native-firebase/firestore').default;
    
    const visitRef = firestore().collection('visits').doc(visitId);
    // Find the pass associated with this visit to expire it
    const passesSnapshot = await firestore().collection('visitor_passes').where('visitId', '==', visitId).limit(1).get();
    const passDoc = passesSnapshot.empty ? null : passesSnapshot.docs[0];

    await firestore().runTransaction(async (transaction: any) => {
        const visitSnap = await transaction.get(visitRef);
        if (!visitSnap.exists) {
            throw new Error('Visit record not found in Firestore.');
        }

        const visitData = visitSnap.data();
        if (visitData?.status === VisitStatus.CHECKED_OUT || visitData?.status === VisitStatus.COMPLETED) {
            throw new Error('Visitor is already checked out.');
        }

        // Execute check-out
        transaction.update(visitRef, {
            status: VisitStatus.COMPLETED,
            exitTime: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        // Expire Pass status
        if (passDoc) {
          transaction.update(passDoc.ref, {
              status: PassStatus.EXPIRED,
              updatedAt: new Date().toISOString()
          });
        }
    });
  }

  static async updateVisitor(id: string, updates: Partial<Visitor>): Promise<Visitor> {
    return await this.visitorDS.updateVisitor(id, updates);
  }

  static async createVisitor(visitor: Partial<Visitor>): Promise<Visitor> {
    return await this.visitorDS.createVisitor(visitor);
  }
}

