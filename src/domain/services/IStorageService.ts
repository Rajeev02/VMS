export interface IStorageService {
  /**
   * Uploads a file and returns its public URL or local URI.
   * @param localUri The local file path/URI to upload.
   * @param path The destination path/folder.
   * @returns A promise that resolves to the URL/URI of the uploaded file.
   */
  uploadFile(localUri: string, path: string): Promise<string>;
}
