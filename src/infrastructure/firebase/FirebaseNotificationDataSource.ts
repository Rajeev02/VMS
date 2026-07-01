import messaging from '@react-native-firebase/messaging';
import { INotificationDataSource, NotificationPayload } from '../../domain/datasources/INotificationDataSource';
import Logger from '../../core/logger/Logger';

export class FirebaseNotificationDataSource implements INotificationDataSource {
  async sendToUser(userId: string, payload: NotificationPayload): Promise<void> {
    // In a real app, this should call a Firebase Cloud Function which sends the FCM.
    // Client SDKs cannot send FCM messages directly to other users.
    Logger.info(`[FCM] Sending message to user ${userId}`, payload);
  }

  async sendToTopic(topic: string, payload: NotificationPayload): Promise<void> {
    // Similarly, calling a Cloud Function to broadcast to a topic
    Logger.info(`[FCM] Broadcasting message to topic ${topic}`, payload);
  }

  async registerDeviceToken(token: string): Promise<void> {
    try {
      const fcmToken = await messaging().getToken();
      Logger.info('Registered FCM token:', fcmToken);
      // Here we would save the fcmToken to the current user's profile in Firestore
    } catch (error) {
      Logger.error('Failed to register FCM token', error);
    }
  }
}
