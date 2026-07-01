import firestore from '@react-native-firebase/firestore';
import { IVisitDataSource } from '../../domain/datasources/IVisitDataSource';
import { Visit } from '../../domain/models/Visit';

export class FirebaseVisitDataSource implements IVisitDataSource {
  private collection = firestore().collection('visits');

  async getVisitById(id: string): Promise<Visit | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;
    return doc.data() as Visit;
  }

  async getAllVisits(): Promise<Visit[]> {
    const snapshot = await this.collection.orderBy('expectedEntry', 'desc').get();
    return snapshot.docs.map(doc => doc.data() as Visit);
  }

  async getVisitsByVisitor(visitorId: string): Promise<Visit[]> {
    const snapshot = await this.collection
      .where('visitorId', '==', visitorId)
      .orderBy('expectedEntry', 'desc')
      .get();
    return snapshot.docs.map(doc => doc.data() as Visit);
  }

  async getVisitsByHost(hostId: string): Promise<Visit[]> {
    const snapshot = await this.collection
      .where('hostId', '==', hostId)
      .orderBy('expectedEntry', 'desc')
      .get();
    return snapshot.docs.map(doc => doc.data() as Visit);
  }

  async createVisit(visit: Partial<Visit>): Promise<Visit> {
    const id = visit.id || this.collection.doc().id;
    const newVisit: Visit = {
      ...(visit as any),
      id,
      createdAt: firestore.FieldValue.serverTimestamp() as any,
    };
    await this.collection.doc(id).set(newVisit);
    return newVisit;
  }

  async updateVisit(id: string, updates: Partial<Visit>): Promise<Visit> {
    const docRef = this.collection.doc(id);
    await docRef.update(updates);
    const doc = await docRef.get();
    return doc.data() as Visit;
  }

  subscribeToVisits(hostId: string, onUpdate: (visits: Visit[]) => void): () => void {
    let query = this.collection.orderBy('expectedEntry', 'desc');
    
    // If not admin/security, filter by hostId
    if (hostId) {
      query = query.where('hostId', '==', hostId);
    }

    const unsubscribe = query.onSnapshot(
      snapshot => {
        const visits = snapshot.docs.map(doc => doc.data() as Visit);
        onUpdate(visits);
      },
      error => {
        console.error('Visits subscription error:', error);
      }
    );

    return unsubscribe;
  }
}
