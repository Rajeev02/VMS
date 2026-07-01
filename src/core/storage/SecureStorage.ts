import * as SecureStore from 'expo-secure-store';
import Logger from '../logger/Logger';

/**
 * Secure Storage Utility wrapper around expo-secure-store
 */
class SecureStorage {
  static async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      await SecureStore.setItemAsync(key, stringValue);
    } catch (error) {
      Logger.error(`Error saving secure data for key: ${key}`, error);
      throw new Error(`Failed to save secure data: ${key}`);
    }
  }

  static async getItem<T>(key: string): Promise<T | null> {
    try {
      const value = await SecureStore.getItemAsync(key);
      if (!value) return null;
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as unknown as T;
      }
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
