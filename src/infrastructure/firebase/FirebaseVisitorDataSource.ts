import firestore from '@react-native-firebase/firestore';
import { IVisitorDataSource } from '../../domain/datasources/IVisitorDataSource';
import { Visitor } from '../../domain/models/Visitor';

export class FirebaseVisitorDataSource implements IVisitorDataSource {
  private collection = firestore().collection('visitors');

  async getVisitorById(id: string): Promise<Visitor | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;
    return doc.data() as Visitor;
  }

  async getAllVisitors(): Promise<Visitor[]> {
    const snapshot = await this.collection.orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => doc.data() as Visitor);
  }

  async searchVisitors(query: string): Promise<Visitor[]> {
    // Basic search on multiple fields using multiple queries
    // In production with large datasets, Algolia or Typesense might be needed.
    // For now, we perform queries based on exactly matching the query to email or phone.
    const results: Visitor[] = [];
    
    // Check phone
    const phoneSnapshot = await this.collection.where('phone', '==', query).get();
    phoneSnapshot.forEach(doc => results.push(doc.data() as Visitor));

    // Check email
    const emailSnapshot = await this.collection.where('email', '==', query).get();
    emailSnapshot.forEach(doc => {
      if (!results.find(v => v.id === doc.id)) results.push(doc.data() as Visitor);
    });

    // Check governmentId
    const govSnapshot = await this.collection.where('governmentId', '==', query).get();
    govSnapshot.forEach(doc => {
      if (!results.find(v => v.id === doc.id)) results.push(doc.data() as Visitor);
    });

    return results;
  }

  async createVisitor(visitor: Partial<Visitor>): Promise<Visitor> {
    const id = visitor.id || firestore().collection('visitors').doc().id;
    const newVisitor: Visitor = {
      ...(visitor as any),
      id,
      createdAt: firestore.FieldValue.serverTimestamp() as any,
      updatedAt: firestore.FieldValue.serverTimestamp() as any,
    };
    await this.collection.doc(id).set(newVisitor);
    return newVisitor;
  }

  async updateVisitor(id: string, updates: Partial<Visitor>): Promise<Visitor> {
    const docRef = this.collection.doc(id);
    await docRef.update({
      ...updates,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
    const doc = await docRef.get();
    return doc.data() as Visitor;
  }
}
