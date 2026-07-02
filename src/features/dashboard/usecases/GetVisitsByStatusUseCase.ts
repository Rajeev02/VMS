import { VisitStatus } from '../../../domain/models/enums';
import { Visit } from '../../../domain/models/Visit';

export interface PopulatedVisit extends Visit {
  visitorName?: string;
  hostName?: string;
}

export class GetVisitsByStatusUseCase {
  async execute(statuses: VisitStatus[]): Promise<PopulatedVisit[]> {
    const firestore = require('@react-native-firebase/firestore').default;
    
    // In Firestore, we can't do an 'in' array if it's too large, but for 2-3 statuses it is fine.
    // However, to keep it simple and robust, we fetch all and filter in memory if needed, 
    // or run multiple queries. Let's run a query for `in`.
    const snapshot = await firestore().collection('visits')
      .where('status', 'in', statuses)
      .get();

    const visits: PopulatedVisit[] = [];

    // To prevent N+1 queries making UI slow, we'd normally do a join or cache, 
    // but for the mock demo we can fetch visitor details in parallel.
    const promises = snapshot.docs.map(async (doc: any) => {
      const visitData = doc.data() as Visit;
      let visitorName = 'Unknown';
      let hostName = 'Host';

      try {
        const visitorDoc = await firestore().collection('visitors').doc(visitData.visitorId).get();
        if (visitorDoc.exists) visitorName = visitorDoc.data().name;
      } catch (e) {}

      return {
        ...visitData,
        visitorName,
        hostName
      };
    });

    const results = await Promise.all(promises);
    results.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return results;
  }
}
