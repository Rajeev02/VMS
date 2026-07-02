import { VisitStatus } from '../../../domain/models/enums';

export interface DashboardStats {
  expected: number;
  active: number;
  completed: number;
}

export class GetDashboardStatsUseCase {
  async execute(): Promise<DashboardStats> {
    const firestore = require('@react-native-firebase/firestore').default;
    
    // For Phase 9, we simplify by getting all visits (in a real app we'd filter by today's date).
    const snapshot = await firestore().collection('visits').get();
    let expected = 0;
    let active = 0;
    let completed = 0;

    snapshot.docs.forEach((doc: any) => {
      const status = doc.data().status;
      if (status === VisitStatus.APPROVED || status === VisitStatus.PENDING) {
        expected++;
      } else if (status === VisitStatus.CHECKED_IN) {
        active++;
      } else if (status === VisitStatus.COMPLETED || status === VisitStatus.CHECKED_OUT) {
        completed++;
      }
    });

    return { expected, active, completed };
  }
}
