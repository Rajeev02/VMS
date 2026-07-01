import { Visitor } from '../models/Visitor';

export interface IVisitorDataSource {
  getVisitorById(id: string): Promise<Visitor | null>;
  searchVisitors(query: string): Promise<Visitor[]>;
  getAllVisitors(): Promise<Visitor[]>;
  createVisitor(visitor: Partial<Visitor>): Promise<Visitor>;
  updateVisitor(id: string, updates: Partial<Visitor>): Promise<Visitor>;
}
