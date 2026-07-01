import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import SecureStorage from '../storage/SecureStorage';
import ApiClient from './ApiClient';
import Logger from '../logger/Logger';

const QUEUE_KEY = 'OFFLINE_QUEUE';

interface QueuedRequest {
  id: string;
  url: string;
  method: string;
  data?: any;
}

export class OfflineManager {
  private static isConnected: boolean = true;
  private static isProcessing: boolean = false;

  static init() {
    NetInfo.addEventListener((state: NetInfoState) => {
      this.isConnected = !!state.isConnected && !!state.isInternetReachable;
      Logger.info(`Network state changed: ${this.isConnected ? 'ONLINE' : 'OFFLINE'}`);
      
      if (this.isConnected) {
        this.processQueue();
      }
    });
  }

  static async enqueue(url: string, method: string, data?: any) {
    const request: QueuedRequest = {
      id: Math.random().toString(36).substr(2, 9),
      url,
      method,
      data,
    };
    
    try {
      const queueRaw = await SecureStorage.getItem(QUEUE_KEY);
      const queue: QueuedRequest[] = queueRaw ? JSON.parse(queueRaw) : [];
      queue.push(request);
      await SecureStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
      Logger.info(`Request queued: ${request.id}`);
    } catch (e) {
      Logger.error('Failed to enqueue request', e);
    }
  }

  static async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const queueRaw = await SecureStorage.getItem(QUEUE_KEY);
      const queue: QueuedRequest[] = queueRaw ? JSON.parse(queueRaw) : [];

      if (queue.length === 0) {
        this.isProcessing = false;
        return;
      }

      Logger.info(`Processing offline queue of length: ${queue.length}`);
      const remainingQueue: QueuedRequest[] = [];

      for (const req of queue) {
        if (!this.isConnected) {
          remainingQueue.push(req);
          continue;
        }

        try {
          await ApiClient.request({
            url: req.url,
            method: req.method,
            data: req.data,
          });
          Logger.info(`Successfully processed queued request: ${req.id}`);
        } catch (error) {
          Logger.error(`Failed to process queued request: ${req.id}`, error);
          remainingQueue.push(req); // Keep it in queue
        }
      }

      await SecureStorage.setItem(QUEUE_KEY, JSON.stringify(remainingQueue));
    } catch (e) {
      Logger.error('Failed to process queue', e);
    } finally {
      this.isProcessing = false;
    }
  }

  // Wrapper for API calls to automatically enqueue on failure
  static async execute(url: string, method: string, data?: any) {
    if (this.isConnected) {
      try {
        const response = await ApiClient.request({ url, method, data });
        return response.data;
      } catch (error: any) {
        if (!error.response) { // Network error
           Logger.warn('Network error during API call, enqueuing request...');
           await this.enqueue(url, method, data);
           return { queued: true };
        }
        throw error;
      }
    } else {
      Logger.warn('App is offline, enqueuing request...');
      await this.enqueue(url, method, data);
      return { queued: true };
    }
  }
}
