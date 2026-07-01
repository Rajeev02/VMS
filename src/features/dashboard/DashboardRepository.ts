import Logger from '../../core/logger/Logger';
import { VisitRepository } from '../../domain/repositories/VisitRepository';
import { VisitorRepository } from '../visitor/VisitorRepository';
import { VisitStatus } from '../../domain/models/enums';

export interface DashboardStats {
  totalVisitors: number;
  todaysVisitors: number;
  upcomingVisits: number;
  pending: number;
  approved: number;
  rejected: number;
  checkedIn: number;
  checkedOut: number;
}

export class DashboardRepository {
  static async getStats(): Promise<DashboardStats> {
    Logger.info(`[DashboardRepository] Fetching Dashboard Stats`);
    try {
      const visitors = await VisitorRepository.getVisitors();
      // Assume we get all visits for the current company/context
      const visits = await VisitRepository.getAllVisits();
      
      const now = new Date();
      const todayString = now.toISOString().split('T')[0];
      
      const todaysVisits = visits.filter((v: any) => v.expectedEntryTime?.startsWith(todayString));
      const upcomingVisits = visits.filter((v: any) => v.status === VisitStatus.APPROVED && new Date(v.expectedEntryTime!) > now);
      
      return {
        totalVisitors: visitors.length,
        todaysVisitors: todaysVisits.length,
        upcomingVisits: upcomingVisits.length,
        pending: visits.filter((v: any) => v.status === VisitStatus.PENDING).length,
        approved: visits.filter((v: any) => v.status === VisitStatus.APPROVED).length,
        rejected: visits.filter((v: any) => v.status === VisitStatus.REJECTED).length,
        checkedIn: visits.filter((v: any) => v.status === VisitStatus.CHECKED_IN).length,
        checkedOut: visits.filter((v: any) => v.status === VisitStatus.CHECKED_OUT).length,
      };
    } catch (e) {
      Logger.error(`[DashboardRepository] Error fetching stats`, e);
      return {
        totalVisitors: 0, todaysVisitors: 0, upcomingVisits: 0,
        pending: 0, approved: 0, rejected: 0, checkedIn: 0, checkedOut: 0
      };
    }
  }
}
