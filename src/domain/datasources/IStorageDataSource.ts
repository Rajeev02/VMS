export interface IStorageDataSource {
  uploadFile(localUri: string, path: string): Promise<string>;
  getDownloadUrl(path: string): Promise<string>;
  deleteFile(path: string): Promise<void>;
}
