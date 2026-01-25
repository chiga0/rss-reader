/**
 * Sync Service
 * Handles background feed refresh and offline operation queuing
 */

import { logger } from '@lib/logger';
import { storage } from '@lib/storage';
import { fetchAndStoreArticles } from './feedService';
import type { SyncState, QueuedOperation } from '@models/Feed';

class SyncService {
  private refreshTimer: number | null = null;
  private isRefreshing = false;

  /**
   * Start automatic feed refresh
   */
  async startAutoRefresh(intervalMinutes: number = 60): Promise<void> {
    logger.info('Starting auto-refresh', { intervalMinutes });

    // Stop existing timer
    if (this.refreshTimer !== null) {
      clearTimeout(this.refreshTimer);
    }

    // Initial refresh
    await this.refreshAllFeeds();

    // Schedule next refresh
    this.scheduleNextRefresh(intervalMinutes);
  }

  /**
   * Schedule next refresh
   */
  private scheduleNextRefresh(intervalMinutes: number): void {
    const intervalMs = intervalMinutes * 60 * 1000;
    
    this.refreshTimer = window.setTimeout(async () => {
      await this.refreshAllFeeds();
      this.scheduleNextRefresh(intervalMinutes);
    }, intervalMs);

    logger.debug('Next refresh scheduled', { intervalMinutes });
  }

  /**
   * Refresh all active feeds
   */
  async refreshAllFeeds(): Promise<void> {
    if (this.isRefreshing) {
      logger.debug('Refresh already in progress, skipping');
      return;
    }

    this.isRefreshing = true;
    logger.info('Refreshing all feeds');

    try {
      // Update sync state
      await this.updateSyncState(true);

      const feeds = await storage.getAll('feeds');
      const activeFeeds = feeds.filter(f => !f.deletedAt && !f.paused);

      logger.info('Refreshing active feeds', { count: activeFeeds.length });

      // Refresh feeds in batches to avoid overwhelming the system
      const batchSize = 5;
      for (let i = 0; i < activeFeeds.length; i += batchSize) {
        const batch = activeFeeds.slice(i, i + batchSize);
        await Promise.allSettled(
          batch.map(feed => this.refreshFeed(feed.id))
        );
      }

      // Update sync state
      await this.updateSyncState(false);

      logger.info('Feed refresh completed');
    } catch (error) {
      logger.error('Feed refresh failed', { error });
      await this.updateSyncState(false);
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Refresh a single feed
   */
  private async refreshFeed(feedId: string): Promise<void> {
    try {
      logger.debug('Refreshing feed', { feedId });
      await fetchAndStoreArticles(feedId);
    } catch (error) {
      logger.warn('Failed to refresh feed', { feedId, error });
    }
  }

  /**
   * Update sync state in storage
   */
  private async updateSyncState(isSyncing: boolean): Promise<void> {
    const syncState: SyncState = {
      id: 'default',
      isSyncing,
      lastSyncAt: isSyncing ? null : new Date(),
      queuedOperations: [],
    };

    await storage.put('syncState', syncState);
  }

  /**
   * Queue operation for offline execution
   */
  async queueOperation(operation: QueuedOperation): Promise<void> {
    logger.info('Queueing operation', { type: operation.type });

    let syncState = await storage.get('syncState', 'default');
    if (!syncState) {
      syncState = {
        id: 'default',
        isSyncing: false,
        lastSyncAt: null,
        queuedOperations: [],
      };
    }

    syncState.queuedOperations.push(operation);
    await storage.put('syncState', syncState);
  }

  /**
   * Process queued operations when back online
   */
  async processQueuedOperations(): Promise<void> {
    logger.info('Processing queued operations');

    const syncState = await storage.get('syncState', 'default');
    if (!syncState || syncState.queuedOperations.length === 0) {
      logger.debug('No queued operations');
      return;
    }

    const operations = [...syncState.queuedOperations];
    syncState.queuedOperations = [];
    await storage.put('syncState', syncState);

    for (const operation of operations) {
      try {
        await this.executeOperation(operation);
        logger.debug('Executed queued operation', { type: operation.type });
      } catch (error) {
        logger.error('Failed to execute queued operation', { operation, error });
      }
    }
  }

  /**
   * Execute a queued operation
   */
  private async executeOperation(operation: QueuedOperation): Promise<void> {
    logger.debug('Executing operation', { type: operation.type, data: operation.data });
    
    switch (operation.type) {
      case 'ADD_FEED':
        // Re-attempt feed subscription
        if (operation.data?.url) {
          const { subscribeFeed } = await import('./feedService');
          await subscribeFeed(operation.data.url, operation.data.categoryId);
        }
        break;
      
      case 'REFRESH_FEED':
        // Re-attempt feed refresh
        if (operation.data?.feedId) {
          const { fetchAndStoreArticles } = await import('./feedService');
          await fetchAndStoreArticles(operation.data.feedId);
        }
        break;
      
      case 'UPDATE_FEED':
        // Mark article as read (already cached locally, no network needed)
        logger.debug('Feed update already processed locally');
        break;
      
      default:
        logger.warn('Unknown operation type', { type: operation.type });
    }
  }

  /**
   * Stop auto-refresh
   */
  stopAutoRefresh(): void {
    if (this.refreshTimer !== null) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
      logger.info('Auto-refresh stopped');
    }
  }
}

export const syncService = new SyncService();
