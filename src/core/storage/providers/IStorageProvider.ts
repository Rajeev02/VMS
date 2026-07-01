export interface IStorageProvider {
  /**
   * Get a single document by ID
   */
  getById<T>(collection: string, id: string): Promise<T | null>;

  /**
   * Query documents with simple filters
   */
  query<T>(collection: string, filters: Record<string, any>): Promise<T[]>;

  /**
   * Create a new document. If ID is omitted, it should be auto-generated.
   */
  create<T>(collection: string, data: Partial<T>, id?: string): Promise<T>;

  /**
   * Update an existing document
   */
  update<T>(collection: string, id: string, data: Partial<T>): Promise<T>;

  /**
   * Delete a document
   */
  delete(collection: string, id: string): Promise<boolean>;
}
