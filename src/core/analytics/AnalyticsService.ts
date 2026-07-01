import Logger from '../logger/Logger';

export enum AnalyticsEvent {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  VISITOR_CREATED = 'VISITOR_CREATED',
  PASS_GENERATED = 'PASS_GENERATED',
  PASS_VIEWED = 'PASS_VIEWED',
  QR_SCANNED = 'QR_SCANNED',
  CHECK_IN = 'CHECK_IN',
  CHECK_OUT = 'CHECK_OUT',
}

/**
 * Analytics Tracking Service.
 * Abstracted to easily plug in Firebase Analytics, Mixpanel, Segment, etc.
 */
export class AnalyticsService {
  static async track(event: AnalyticsEvent, properties?: Record<string, any>): Promise<void> {
    // Mock analytics tracking
    Logger.info(`[AnalyticsService] Track Event: ${event}`, properties);
    // e.g., analytics().logEvent(event, properties);
  }

  static async setUserId(userId: string): Promise<void> {
    Logger.info(`[AnalyticsService] Set User ID: ${userId}`);
  }

  static async setUserProperties(properties: Record<string, any>): Promise<void> {
    Logger.info(`[AnalyticsService] Set User Properties`, properties);
  }
}
