import * as SecureStore from 'expo-secure-store';
import Logger from '../logger/Logger';

/**
 * Secure Storage Utility wrapper around expo-secure-store
 */
class SecureStorage {
  static async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      Logger.error(`Error saving secure data for key: ${key}`, error);
      throw new Error(`Failed to save secure data: ${key}`);
    }
  }

  static async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      Logger.error(`Error reading secure data for key: ${key}`, error);
      return null;
    }
  }

  static async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      Logger.error(`Error deleting secure data for key: ${key}`, error);
      throw new Error(`Failed to delete secure data: ${key}`);
    }
  }
}

export default SecureStorage;
