export interface INotificationPayload {
  recipientId?: string;
  recipientName?: string;
  contactDetail: string; // email, phone number, or push token
  subject?: string;
  message: string;
  data?: Record<string, any>;
}

export interface IEmailService {
  sendEmail(payload: INotificationPayload): Promise<void>;
}

export interface ISmsService {
  sendSms(payload: INotificationPayload): Promise<void>;
}

export interface IWhatsAppService {
  sendWhatsAppMessage(payload: INotificationPayload): Promise<void>;
}

export interface IPushNotificationService {
  sendPushNotification(payload: INotificationPayload): Promise<void>;
}
