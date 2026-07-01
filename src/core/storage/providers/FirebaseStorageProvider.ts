import firestore from '@react-native-firebase/firestore';
import { IStorageProvider } from './IStorageProvider';
import Logger from '../../logger/Logger';

/**
 * Firebase Implementation of Storage Provider
 */
export class FirebaseStorageProvider implements IStorageProvider {
  async getById<T>(collection: string, id: string): Promise<T | null> {
    try {
      const doc = await firestore().collection(collection).doc(id).get();
      if (!doc.exists) return null;
      return doc.data() as T;
    } catch (error) {
      Logger.error(`[FirebaseStorageProvider] Error in getById: ${collection}/${id}`, error);
      throw error;
    }
  }

  async query<T>(collection: string, filters: Record<string, any>): Promise<T[]> {
    try {
      let queryRef: any = firestore().collection(collection);
      
      for (const [key, value] of Object.entries(filters)) {
        queryRef = queryRef.where(key, '==', value);
      }
      
      const snapshot = await queryRef.get();
      const results: T[] = [];
      snapshot.forEach((doc: any) => results.push(doc.data() as T));
      return results;
    } catch (error) {
      Logger.error(`[FirebaseStorageProvider] Error in query: ${collection}`, error);
      throw error;
    }
  }

  async create<T>(collection: string, data: Partial<T>, id?: string): Promise<T> {
    try {
      const docRef = id 
        ? firestore().collection(collection).doc(id) 
        : firestore().collection(collection).doc();
        
      const docId = docRef.id;
      
      const newDoc = {
        ...data,
        id: docId,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      };
      
      await docRef.set(newDoc);
      return newDoc as T;
    } catch (error) {
      Logger.error(`[FirebaseStorageProvider] Error in create: ${collection}`, error);
      throw error;
    }
  }

  async update<T>(collection: string, id: string, data: Partial<T>): Promise<T> {
    try {
      const docRef = firestore().collection(collection).doc(id);
      await docRef.update({
        ...data,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
      
      const doc = await docRef.get();
      return doc.data() as T;
    } catch (error) {
      Logger.error(`[FirebaseStorageProvider] Error in update: ${collection}/${id}`, error);
      throw error;
    }
  }

  async delete(collection: string, id: string): Promise<boolean> {
    try {
      await firestore().collection(collection).doc(id).delete();
      return true;
    } catch (error) {
      Logger.error(`[FirebaseStorageProvider] Error in delete: ${collection}/${id}`, error);
      throw error;
    }
  }
}
