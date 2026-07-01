import firestore from '@react-native-firebase/firestore';
import { IPassDataSource } from '../../domain/datasources/IPassDataSource';
import { VisitorPass } from '../../domain/models/VisitorPass';

export class FirebasePassDataSource implements IPassDataSource {
  private collection = firestore().collection('visitor_passes');

  async getPassById(id: string): Promise<VisitorPass | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;
    return doc.data() as VisitorPass;
  }

  async getPassByToken(token: string): Promise<VisitorPass | null> {
    const snapshot = await this.collection.where('qrToken', '==', token).limit(1).get();
    if (snapshot.empty) return null;
    return snapshot.docs[0].data() as VisitorPass;
  }

  async getPassByVisitId(visitId: string): Promise<VisitorPass | null> {
    const snapshot = await this.collection.where('visitId', '==', visitId).limit(1).get();
    if (snapshot.empty) return null;
    return snapshot.docs[0].data() as VisitorPass;
  }

  async createPass(pass: Partial<VisitorPass>): Promise<VisitorPass> {
    const id = pass.id || this.collection.doc().id;
    const newPass: VisitorPass = {
      ...(pass as any),
      id,
      generatedTime: firestore.FieldValue.serverTimestamp() as any,
    };
    await this.collection.doc(id).set(newPass);
    return newPass;
  }

  async updatePass(id: string, updates: Partial<VisitorPass>): Promise<VisitorPass> {
    const docRef = this.collection.doc(id);
    await docRef.update(updates);
    const doc = await docRef.get();
    return doc.data() as VisitorPass;
  }
}
