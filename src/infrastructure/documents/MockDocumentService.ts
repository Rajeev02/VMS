import { IDocumentService } from '../../domain/services/IDocumentService';
import Logger from '../../core/logger/Logger';
import { Alert } from 'react-native';

export class MockDocumentService implements IDocumentService {
  async generatePdf(passData: any): Promise<string> {
    Logger.info(`[MockDocumentService] Generating PDF for Pass: ${passData?.passId}`);
    // Simulate generation time
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUri = 'file:///mock/path/visitor-pass.pdf';
        Logger.info(`[MockDocumentService] PDF generated at: ${mockUri}`);
        resolve(mockUri);
      }, 500);
    });
  }

  async printDocument(uri: string): Promise<void> {
    Logger.info(`[MockDocumentService] Printing document at URI: ${uri}`);
    // Simulate native print dialog
    return new Promise((resolve) => {
      setTimeout(() => {
        Alert.alert('Mock Print', `Printing document: ${uri}`);
        resolve();
      }, 300);
    });
  }

  async generateAndShareCsv(content: string, filename: string): Promise<void> {
    Logger.info(`[MockDocumentService] Generating CSV: ${filename} with content length: ${content.length}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        Alert.alert('Mock Share Sheet', `Native Share Sheet opened for: ${filename}`);
        resolve();
      }, 300);
    });
  }
}
