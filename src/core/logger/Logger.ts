/**
 * Centralized Logger
 * Avoid using console.log directly in the application.
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

// Define __DEV__ for Node environments
declare const __DEV__: boolean;
const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';

const CURRENT_LOG_LEVEL = isDev ? LogLevel.DEBUG : LogLevel.WARN;

class Logger {
  static debug(message: string, ...optionalParams: any[]) {
    if (CURRENT_LOG_LEVEL <= LogLevel.DEBUG) {
      console.debug(`[DEBUG] ${message}`, ...optionalParams);
    }
  }

  static info(message: string, ...optionalParams: any[]) {
    if (CURRENT_LOG_LEVEL <= LogLevel.INFO) {
      console.info(`[INFO] ${message}`, ...optionalParams);
    }
  }

  static warn(message: string, ...optionalParams: any[]) {
    if (CURRENT_LOG_LEVEL <= LogLevel.WARN) {
      console.warn(`[WARN] ${message}`, ...optionalParams);
    }
  }

  static error(message: string, error?: Error | unknown, ...optionalParams: any[]) {
    if (CURRENT_LOG_LEVEL <= LogLevel.ERROR) {
      console.error(`[ERROR] ${message}`, error, ...optionalParams);
      // Here we could also log to Crashlytics / Sentry
    }
  }
}

export default Logger;
