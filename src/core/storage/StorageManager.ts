import { IStorageProvider } from './providers/IStorageProvider';
import { MockFirebaseProvider } from './providers/MockFirebaseProvider';

/**
 * StorageManager is a Singleton that manages the active storage provider.
 * This ensures the application is not coupled to Firebase or any specific DB.
 */
class StorageManager {
  private static instance: StorageManager;
  private provider: IStorageProvider;

  private constructor() {
    // Inject mock by default for this assignment. 
    // Can switch to Supabase/REST via env config.
    this.provider = new MockFirebaseProvider();
  }

  public static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  public getProvider(): IStorageProvider {
    return this.provider;
  }

  public setProvider(provider: IStorageProvider) {
    this.provider = provider;
  }
}

export default StorageManager.getInstance();
