import { VisitRepository } from '../../domain/repositories/VisitRepository';
import { VisitorRepository } from './VisitorRepository';
import { Visit } from '../../domain/models/Visit';
import { Visitor } from '../../domain/models/Visitor';
import { VisitStatus } from '../../domain/models/enums';

export interface VisitListItem {
  id: string; // visit ID
  visitorId: string;
  name: string;
  phone?: string;
  company?: string;
  date: string;
  time: string;
  status: VisitStatus;
  purpose: string;
}

export class VisitorListUseCase {
  static async getVisitsWithDetails(): Promise<VisitListItem[]> {
    const visits = await VisitRepository.getAllVisits();
    
    // For large scale, we should batch or cache, but for now we fetch in parallel
    const enhancedVisits = await Promise.all(
      visits.map(async (visit) => {
        const visitor = await VisitorRepository.getVisitorById(visit.visitorId);
        
        return {
          id: visit.id,
          visitorId: visit.visitorId,
          name: visitor?.name || 'Unknown Visitor',
          phone: visitor?.phone,
          company: visitor?.company,
          date: visit.scheduledDate,
          time: visit.entryTime || 'Pending',
          status: visit.status,
          purpose: visit.purpose,
        };
      })
    );
    
    return enhancedVisits;
  }
}
