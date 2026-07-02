import { 
  IEmailService, 
  ISmsService, 
  IWhatsAppService, 
  IPushNotificationService, 
  INotificationPayload 
} from '../../domain/services/INotificationService';
import Logger from '../../core/logger/Logger';

export class MockEmailService implements IEmailService {
  async sendEmail(payload: INotificationPayload): Promise<void> {
    Logger.info(`[MockEmailService] Sending EMAIL to ${payload.contactDetail}`);
    Logger.info(`[MockEmailService] Subject: ${payload.subject}`);
    Logger.info(`[MockEmailService] Message: ${payload.message}`);
  }
}

export class MockSmsService implements ISmsService {
  async sendSms(payload: INotificationPayload): Promise<void> {
    Logger.info(`[MockSmsService] Sending SMS to ${payload.contactDetail}`);
    Logger.info(`[MockSmsService] Message: ${payload.message}`);
  }
}

export class MockWhatsAppService implements IWhatsAppService {
  async sendWhatsAppMessage(payload: INotificationPayload): Promise<void> {
    Logger.info(`[MockWhatsAppService] Sending WhatsApp to ${payload.contactDetail}`);
    Logger.info(`[MockWhatsAppService] Message: ${payload.message}`);
  }
}

export class MockPushNotificationService implements IPushNotificationService {
  async sendPushNotification(payload: INotificationPayload): Promise<void> {
    Logger.info(`[MockPushNotificationService] Sending PUSH to token ${payload.contactDetail}`);
    Logger.info(`[MockPushNotificationService] Message: ${payload.message}`);
  }
}
