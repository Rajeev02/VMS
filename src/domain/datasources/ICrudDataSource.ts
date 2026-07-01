export interface ICrudDataSource<T> {
  getById(id: string): Promise<T | null>;
  getAll(): Promise<T[]>;
  create(item: T, id?: string): Promise<T>;
  update(id: string, item: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
}
