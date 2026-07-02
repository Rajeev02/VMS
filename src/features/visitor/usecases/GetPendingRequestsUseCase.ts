import { VisitorRepository } from '../VisitorRepository';
import { Visit } from '../../../domain/models/Visit';
import { Visitor } from '../../../domain/models/Visitor';
import { VisitStatus } from '../../../domain/models/enums';

export class GetPendingRequestsUseCase {
  async execute(hostId: string): Promise<{ visit: Visit, visitor: Visitor | null }[]> {
    if (!hostId) {
      throw new Error('Host ID is required to fetch pending requests');
    }
    
    return await VisitorRepository.getVisitsByHostAndStatus(hostId, VisitStatus.PENDING);
  }
}
