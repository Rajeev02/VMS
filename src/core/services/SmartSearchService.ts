import { VisitorRepository } from '../../features/visitor/VisitorRepository';
import { Visitor } from '../../domain/models/Visitor';
import Logger from '../logger/Logger';

export class SmartSearchService {
  /**
   * Searches for a visitor using the priority sequence:
   * 1. Government ID (if it matches a specific format, e.g., 12 digits for Aadhar, or alphanumeric for passport)
   * 2. Phone Number
   * 3. Email
   * 4. Name
   */
  static async findVisitor(query: string): Promise<Visitor | null> {
    if (!query || query.trim() === '') return null;
    
    const cleanQuery = query.trim();
    Logger.info(`[SmartSearchService] Searching for: ${cleanQuery}`);

    const results = await VisitorRepository.searchVisitors(cleanQuery);
    if (results && results.length > 0) {
      Logger.info(`[SmartSearchService] Match found for query: ${cleanQuery}`);
      return results[0];
    }

    return null;
  }
}
