import storage from '@react-native-firebase/storage';
import { IStorageDataSource } from '../../domain/datasources/IStorageDataSource';
import Logger from '../../core/logger/Logger';

const normalizeLocalFileUri = (localUri: string) => {
  const uriWithoutQuery = localUri.split('?')[0];
  const decodedUri = decodeURIComponent(uriWithoutQuery);
  return decodedUri.startsWith('file://') ? decodedUri.replace('file://', '') : decodedUri;
};

const getExtension = (localUri: string) => {
  const extension = localUri.split('?')[0].split('.').pop();
  return extension && extension.length <= 5 ? extension : 'jpg';
};

export class FirebaseStorageDataSource implements IStorageDataSource {
  async uploadFile(localUri: string, path: string): Promise<string> {
    const folder = path.endsWith('/') ? path : `${path}/`;
    const extension = getExtension(localUri);
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
    const storagePath = `${folder}${fileName}`;
    const reference = storage().ref(storagePath);
    const normalizedUri = normalizeLocalFileUri(localUri);

    try {
      Logger.info(`[FirebaseStorageDataSource] Uploading ${localUri} to ${storagePath}`);
      await reference.putFile(normalizedUri);
      const downloadUrl = await reference.getDownloadURL();
      Logger.info(`[FirebaseStorageDataSource] Uploaded file to ${downloadUrl}`);
      return downloadUrl;
    } catch (firstError) {
      Logger.warn(`[FirebaseStorageDataSource] Upload failed with normalized URI, retrying original URI`, firstError);
      await reference.putFile(localUri);
      const downloadUrl = await reference.getDownloadURL();
      Logger.info(`[FirebaseStorageDataSource] Uploaded file to ${downloadUrl}`);
      return downloadUrl;
    }
  }

  async getDownloadUrl(path: string): Promise<string> {
    const reference = storage().ref(path);
    return await reference.getDownloadURL();
  }

  async deleteFile(path: string): Promise<void> {
    const reference = storage().ref(path);
    await reference.delete();
  }
}
