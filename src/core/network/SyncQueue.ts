import SecureStorage from '../storage/SecureStorage';
import NetInfo from '@react-native-community/netinfo';
import Logger from '../logger/Logger';

export interface SyncOperation {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: 'VISIT' | 'VISITOR' | 'PASS';
  payload: any;
  timestamp: string;
  retryCount: number;
}

export class SyncQueue {
  private static readonly QUEUE_KEY = 'vms_offline_queue';
  private static isSyncing = false;

  static async enqueue(operation: Omit<SyncOperation, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    const newOp: SyncOperation = {
      ...operation,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      retryCount: 0,
    };

    const queue = await this.getQueue();
    queue.push(newOp);
    await SecureStorage.setItem(this.QUEUE_KEY, queue);
    
    Logger.info(`[SyncQueue] Queued operation ${newOp.id} for ${newOp.entity}`);

    // Try syncing immediately if online
    this.attemptSync();
  }

  static async attemptSync(): Promise<void> {
    if (this.isSyncing) return;
    
    const state = await NetInfo.fetch();
    if (!state.isConnected) {
      Logger.info('[SyncQueue] Offline, aborting sync.');
      return;
    }

    this.isSyncing = true;
    try {
      const queue = await this.getQueue();
      if (queue.length === 0) return;

      Logger.info(`[SyncQueue] Starting sync for ${queue.length} items`);
      const remainingQueue: SyncOperation[] = [];

      for (const op of queue) {
        try {
          await this.processOperation(op);
        } catch (error) {
          Logger.error(`[SyncQueue] Failed to process op ${op.id}`, error);
          if (op.retryCount < 3) {
            op.retryCount++;
            remainingQueue.push(op);
          } else {
            Logger.warn(`[SyncQueue] Dropping op ${op.id} after max retries`);
          }
        }
      }

      await SecureStorage.setItem(this.QUEUE_KEY, remainingQueue);
    } finally {
      this.isSyncing = false;
    }
  }

  private static async processOperation(op: SyncOperation): Promise<void> {
    // In a real app, this would route to the appropriate API endpoint
    // For now, we mock the network request
    Logger.info(`[SyncQueue] Processing ${op.type} for ${op.entity}`);
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  private static async getQueue(): Promise<SyncOperation[]> {
    const queue = await SecureStorage.getItem<SyncOperation[]>(this.QUEUE_KEY);
    return queue || [];
  }
}
