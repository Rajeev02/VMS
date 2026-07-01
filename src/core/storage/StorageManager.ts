import { IStorageProvider } from './providers/IStorageProvider';
import { FirebaseStorageProvider } from './providers/FirebaseStorageProvider';

/**
 * StorageManager is a Singleton that manages the active storage provider.
 * This ensures the application is not coupled to Firebase or any specific DB.
 */
class StorageManager {
  private static instance: StorageManager;
  private provider: IStorageProvider;

  private constructor() {
    this.provider = new FirebaseStorageProvider();
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
