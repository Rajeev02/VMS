import { VisitorRepository } from '../VisitorRepository';
import { Visit } from '../../../domain/models/Visit';
import { Visitor } from '../../../domain/models/Visitor';
import { VisitStatus } from '../../../domain/models/enums';

export class GetPendingRequestsUseCase {
  async execute(hostId: string): Promise<{ visit: Visit, visitor: Visitor | null }[]> {
    const firestore = require('@react-native-firebase/firestore').default;
    const snapshot = await firestore().collection('visits').where('status', '==', VisitStatus.PENDING).get();
    
    const result = await Promise.all(snapshot.docs.map(async (doc: any) => {
      const visit = doc.data() as Visit;
      const visitorDoc = await firestore().collection('visitors').doc(visit.visitorId).get();
      const visitor = visitorDoc.exists ? (visitorDoc.data() as Visitor) : null;
      return { visit, visitor };
    }));
    return result;
  }
}
