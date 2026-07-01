import storage from '@react-native-firebase/storage';
import { IStorageDataSource } from '../../domain/datasources/IStorageDataSource';

export class FirebaseStorageDataSource implements IStorageDataSource {
  async uploadFile(path: string, uri: string): Promise<string> {
    const reference = storage().ref(path);
    await reference.putFile(uri);
    return await reference.getDownloadURL();
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
