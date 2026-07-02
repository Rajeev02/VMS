import { IDocumentService } from '../../../domain/services/IDocumentService';
import Logger from '../../../core/logger/Logger';
import { ReportDateRange } from './GenerateVisitorReportUseCase';

export class ExportAuditLogsUseCase {
  constructor(private documentService: IDocumentService) {}

  async execute(range: ReportDateRange): Promise<void> {
    Logger.info(`[ExportAuditLogsUseCase] Exporting audit logs from ${range.startDate} to ${range.endDate}`);
    
    try {
      const firestore = require('@react-native-firebase/firestore').default;
      
      const snapshot = await firestore().collection('system_audit_logs')
        .where('timestamp', '>=', range.startDate)
        .where('timestamp', '<=', range.endDate)
        .orderBy('timestamp', 'desc')
        .get();

      if (snapshot.empty) {
        throw new Error('No audit logs found in this date range.');
      }

      // Build CSV Data
      let csvContent = "Timestamp,Action,User ID,Visit ID,Visitor ID,Details\n";

      snapshot.docs.forEach((doc: any) => {
        const log = doc.data();
        const detailsStr = log.details ? `"${JSON.stringify(log.details).replace(/"/g, '""')}"` : '""';
        
        const row = [
          log.timestamp,
          log.action,
          log.userId || '',
          log.visitId || '',
          log.visitorId || '',
          detailsStr
        ].join(",");
        csvContent += row + "\n";
      });

      Logger.info(`[ExportAuditLogsUseCase] Triggering document service to share CSV.`);
      await this.documentService.generateAndShareCsv(csvContent, `System_Audit_Logs_${new Date().getTime()}.csv`);
      
    } catch (error) {
      Logger.error(`[ExportAuditLogsUseCase] Failed to export audit logs`, error);
      throw error;
    }
  }
}
