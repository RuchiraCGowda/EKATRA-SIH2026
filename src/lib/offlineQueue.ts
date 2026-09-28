import { OfflineQueueItem } from '../types/database';
import { EkatraDB } from './supabase';

const QUEUE_STORAGE_KEY = 'ekatra_offline_queue_v1';

class OfflineSyncEngine {
  private queue: OfflineQueueItem[] = [];
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private isSyncing: boolean = false;
  private listeners: Set<(status: { isOnline: boolean; isSyncing: boolean; queueLength: number }) => void> = new Set();

  constructor() {
    this.loadQueue();

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.notify();
        this.processQueue();
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.notify();
      });
    }
  }

  private loadQueue(): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (raw) {
        this.queue = JSON.parse(raw);
      }
    } catch (e) {
      console.error('Failed to load offline queue:', e);
      this.queue = [];
    }
  }

  private persistQueue(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
    } catch (e) {
      console.warn('Failed to persist offline queue:', e);
    }
    this.notify();
  }

  public subscribe(
    callback: (status: { isOnline: boolean; isSyncing: boolean; queueLength: number }) => void
  ): () => void {
    this.listeners.add(callback);
    callback({
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      queueLength: this.getPendingCount(),
    });
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notify(): void {
    const payload = {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      queueLength: this.getPendingCount(),
    };
    this.listeners.forEach((fn) => fn(payload));
  }

  public getPendingCount(): number {
    return this.queue.filter((item) => item.status === 'pending' || item.status === 'failed').length;
  }

  public getNetworkStatus(): { isOnline: boolean; isSyncing: boolean; pendingCount: number } {
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      pendingCount: this.getPendingCount(),
    };
  }

  // Toggle simulate offline for demonstration/testing
  public setSimulatedOffline(offline: boolean): void {
    this.isOnline = !offline;
    this.notify();
    if (!offline) {
      this.processQueue();
    }
  }

  public enqueue(
    operation: OfflineQueueItem['operation'],
    payload: Record<string, unknown>
  ): OfflineQueueItem {
    const item: OfflineQueueItem = {
      id: `queue-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      operation,
      payload,
      timestamp: Date.now(),
      status: 'pending',
      retryCount: 0,
    };

    this.queue.push(item);
    this.persistQueue();

    // If online, immediately try syncing
    if (this.isOnline && !this.isSyncing) {
      this.processQueue();
    }

    return item;
  }

  public async processQueue(): Promise<void> {
    if (!this.isOnline || this.isSyncing) return;
    const pendingItems = this.queue.filter((i) => i.status === 'pending' || i.status === 'failed');
    if (pendingItems.length === 0) return;

    this.isSyncing = true;
    this.notify();

    for (const item of pendingItems) {
      item.status = 'syncing';
      this.notify();

      try {
        // Safe processing of operation
        await this.executeOperation(item);
        item.status = 'synced';
      } catch (err: unknown) {
        item.status = 'failed';
        item.retryCount += 1;
        item.error = err instanceof Error ? err.message : 'Unknown sync error';
        console.error('Failed to sync item:', item, err);
      }
    }

    // Keep synced items for a short while, then purge synced to keep storage lean
    this.queue = this.queue.filter((i) => i.status !== 'synced');
    this.isSyncing = false;
    this.persistQueue();
  }

  private async executeOperation(item: OfflineQueueItem): Promise<void> {
    // Artificial small delay to reflect real network handshake
    await new Promise((resolve) => setTimeout(resolve, 400));

    switch (item.operation) {
      case 'create_lot': {
        const p = item.payload as {
          category_id: string;
          approx_weight_kg: number;
          location_name: string;
          latitude: number;
          longitude: number;
          primary_image_url?: string;
          description?: string;
        };
        EkatraDB.createLot(
          p.category_id,
          p.approx_weight_kg,
          p.location_name,
          p.latitude,
          p.longitude,
          p.primary_image_url,
          p.description
        );
        break;
      }
      case 'accept_offer': {
        const p = item.payload as { lot_id: string; offer_id: string };
        EkatraDB.acceptOffer(p.lot_id, p.offer_id);
        break;
      }
      case 'confirm_handover': {
        const p = item.payload as {
          lot_id: string;
          recycler_id: string;
          verified_weight_kg: number;
          handover_photo_url?: string;
          payment_mode: 'cash' | 'upi';
          payment_reference?: string;
        };
        EkatraDB.confirmHandover(
          p.lot_id,
          p.recycler_id,
          p.verified_weight_kg,
          p.handover_photo_url,
          p.payment_mode,
          p.payment_reference
        );
        break;
      }
      case 'file_complaint': {
        const p = item.payload as {
          category: string;
          description: string;
          lot_id?: string;
          against_user?: string;
        };
        EkatraDB.fileComplaint(p.category, p.description, p.lot_id, p.against_user);
        break;
      }
      default:
        console.warn('Unknown offline operation:', item.operation);
    }
  }
}

export const offlineSyncEngine = new OfflineSyncEngine();
