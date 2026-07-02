import { IStorageService } from '../../domain/services/IStorageService';
import Logger from '../../core/logger/Logger';

export class LocalStorageService implements IStorageService {
  async uploadFile(localUri: string, path: string): Promise<string> {
    Logger.info(`[LocalStorageService] Mock uploading ${localUri} to ${path}`);
    // In Phase 1, we simulate a fast upload and just return the local URI.
    // When Firebase is integrated, this will read the file and put it in Firebase Storage.
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(localUri);
      }, 300); // simulate network delay
    });
  }
}
