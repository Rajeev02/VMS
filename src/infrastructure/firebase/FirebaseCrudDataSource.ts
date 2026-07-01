import firestore from '@react-native-firebase/firestore';
import { ICrudDataSource } from '../../domain/datasources/ICrudDataSource';

export class FirebaseCrudDataSource<T> implements ICrudDataSource<T> {
  constructor(private collectionName: string) {}

  protected get collection() {
    return firestore().collection(this.collectionName);
  }

  async getById(id: string): Promise<T | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as T;
  }

  async getAll(): Promise<T[]> {
    const snapshot = await this.collection.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
  }

  async create(item: T, id?: string): Promise<T> {
    const docRef = id ? this.collection.doc(id) : this.collection.doc();
    
    const dataToSave = { ...item } as Record<string, any>;
    // Remove undefined fields
    Object.keys(dataToSave).forEach(key => dataToSave[key] === undefined && delete dataToSave[key]);

    await docRef.set(dataToSave);
    return { ...item, id: docRef.id };
  }

  async update(id: string, item: Partial<T>): Promise<T> {
    await this.collection.doc(id).update(item as any);
    const updated = await this.getById(id);
    return updated as T;
  }

  async delete(id: string): Promise<boolean> {
    await this.collection.doc(id).delete();
    return true;
  }
}
