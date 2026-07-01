import Logger from '../../core/logger/Logger';

export class MockNotificationService {
  static sendPassToVisitor(visitorName: string, channel: 'SMS' | 'WhatsApp' | 'Email', qrCode: string) {
    Logger.info(`[NOTIFICATION - ${channel}] Sent Digital Visitor Pass to ${visitorName}. QR: ${qrCode}`);
  }

  static notifyHostVisitorArrived(hostId: string, visitorName: string) {
    Logger.info(`[NOTIFICATION - Push] Notifying Host (${hostId}): Your visitor ${visitorName} has arrived at the lobby.`);
  }

  static notifyHostApprovalRequired(hostId: string, visitorName: string) {
    Logger.info(`[NOTIFICATION - Push] Notifying Host (${hostId}): Walk-in visitor ${visitorName} requires approval.`);
  }
}
