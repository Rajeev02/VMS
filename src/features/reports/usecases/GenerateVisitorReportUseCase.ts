import { Visit } from '../../../domain/models/Visit';
import { IDocumentService } from '../../../domain/services/IDocumentService';
import Logger from '../../../core/logger/Logger';

export interface ReportDateRange {
  startDate: string; // ISO string
  endDate: string;
}

export class GenerateVisitorReportUseCase {
  constructor(private documentService: IDocumentService) {}

  async execute(range: ReportDateRange): Promise<void> {
    Logger.info(`[GenerateVisitorReportUseCase] Generating report from ${range.startDate} to ${range.endDate}`);
    
    try {
      const firestore = require('@react-native-firebase/firestore').default;
      
      // Query visits in date range. We are querying by createdAt for simplicity.
      const snapshot = await firestore().collection('visits')
        .where('createdAt', '>=', range.startDate)
        .where('createdAt', '<=', range.endDate)
        .get();

      if (snapshot.empty) {
        throw new Error('No visitor records found in this date range.');
      }

      // Build CSV Data
      // Header
      let csvContent = "Visit ID,Visitor ID,Host ID,Status,Purpose,Scheduled Date,Entry Time,Exit Time\n";

      snapshot.docs.forEach((doc: any) => {
        const v = doc.data() as Visit;
        const row = [
          v.id,
          v.visitorId,
          v.hostId,
          v.status,
          `"${v.purpose}"`,
          v.scheduledDate,
          v.entryTime || 'N/A',
          v.expectedExitTime || 'N/A'
        ].join(",");
        csvContent += row + "\n";
      });

      // Generate file and share using Document Service
      Logger.info(`[GenerateVisitorReportUseCase] Triggering document service to share CSV.`);
      await this.documentService.generateAndShareCsv(csvContent, `Visitor_Report_${new Date().getTime()}.csv`);
      
    } catch (error) {
      Logger.error(`[GenerateVisitorReportUseCase] Failed to generate report`, error);
      throw error;
    }
  }
}
