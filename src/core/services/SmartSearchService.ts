import { VisitorRepository } from '../../domain/repositories/VisitorRepository';
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

    // Priority 1: Government ID (Strict check, mocked as exact match query for now)
    // In a real app, you might have regex to detect Gov ID patterns
    const byGovId = await VisitorRepository.findByGovId(cleanQuery);
    if (byGovId) {
      Logger.info(`[SmartSearchService] Match found via Government ID`);
      return byGovId;
    }

    // Priority 2: Phone
    const phoneRegex = /^[0-9+\-\s()]{7,15}$/;
    if (phoneRegex.test(cleanQuery)) {
      const byPhone = await VisitorRepository.findByPhone(cleanQuery);
      if (byPhone) {
        Logger.info(`[SmartSearchService] Match found via Phone`);
        return byPhone;
      }
    }

    // Priority 3: Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(cleanQuery)) {
      const byEmail = await VisitorRepository.findByEmail(cleanQuery);
      if (byEmail) {
        Logger.info(`[SmartSearchService] Match found via Email`);
        return byEmail;
      }
    }

    // Priority 4: Name (or fallback search)
    // Here we might query a generic search endpoint or text index
    // For mock purposes, assuming we might just check exact name or do a text query.
    // Assuming VisitorRepository has a generic search
    const byName = await VisitorRepository.findByEmail(cleanQuery); // Mocked logic, should be findByName
    // ...
    // Since we didn't implement findByName in Repository yet, let's just return null if not found above for now
    
    return null;
  }
}
