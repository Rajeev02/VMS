export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

export interface INotificationDataSource {
  sendToUser(userId: string, payload: NotificationPayload): Promise<void>;
  sendToTopic(topic: string, payload: NotificationPayload): Promise<void>;
  registerDeviceToken(token: string): Promise<void>;
}
