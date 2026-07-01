import { IStorageProvider } from './IStorageProvider';
import Logger from '../../logger/Logger';

/**
 * Mock Implementation of Firebase Storage Provider
 * In a real application, this would use @react-native-firebase/firestore
 */
export class MockFirebaseProvider implements IStorageProvider {
  private db: Record<string, Map<string, any>> = {};

  private getCollection(collection: string): Map<string, any> {
    if (!this.db[collection]) {
      this.db[collection] = new Map();
    }
    return this.db[collection];
  }

  async getById<T>(collection: string, id: string): Promise<T | null> {
    Logger.info(`[MockFirebase] getById: ${collection}/${id}`);
    await this.simulateNetworkDelay();
    
    const col = this.getCollection(collection);
    return col.has(id) ? (col.get(id) as T) : null;
  }

  async query<T>(collection: string, filters: Record<string, any>): Promise<T[]> {
    Logger.info(`[MockFirebase] query: ${collection} with filters ${JSON.stringify(filters)}`);
    await this.simulateNetworkDelay();
    
    const col = this.getCollection(collection);
    const results: T[] = [];
    
    col.forEach((item) => {
      let matches = true;
      for (const [key, value] of Object.entries(filters)) {
        if (item[key] !== value) {
          matches = false;
          break;
        }
      }
      if (matches) results.push(item as T);
    });
    
    return results;
  }

  async create<T>(collection: string, data: Partial<T>, id?: string): Promise<T> {
    const docId = id || this.generateId();
    Logger.info(`[MockFirebase] create: ${collection}/${docId}`);
    await this.simulateNetworkDelay();
    
    const col = this.getCollection(collection);
    const doc = { id: docId, ...data } as unknown as T;
    col.set(docId, doc);
    
    return doc;
  }

  async update<T>(collection: string, id: string, data: Partial<T>): Promise<T> {
    Logger.info(`[MockFirebase] update: ${collection}/${id}`);
    await this.simulateNetworkDelay();
    
    const col = this.getCollection(collection);
    if (!col.has(id)) {
      throw new Error(`Document ${collection}/${id} not found.`);
    }
    
    const existing = col.get(id);
    const updated = { ...existing, ...data } as T;
    col.set(id, updated);
    
    return updated;
  }

  async delete(collection: string, id: string): Promise<boolean> {
    Logger.info(`[MockFirebase] delete: ${collection}/${id}`);
    await this.simulateNetworkDelay();
    
    const col = this.getCollection(collection);
    return col.delete(id);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private simulateNetworkDelay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));
  }
}
