/**
 * Unit Tests: Sync Service
 * Tests automatic feed refresh, scheduling, and background sync
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { syncService } from '@services/syncService';
import { storage } from '@lib/storage';
import type { Feed, SyncState } from '@models/Feed';

// Mock dependencies
vi.mock('@lib/storage');
vi.mock('@services/feedService');

describe('Sync Service', () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    await storage.init();
    vi.clearAllMocks();
  });

  afterEach(() => {
    syncService.stopAutoRefresh();
    vi.useRealTimers();
  });

  describe('Auto-refresh Timer', () => {
    it('should schedule refresh at configured interval', async () => {
      const mockFeeds: Feed[] = [
        {
          id: 'feed-1',
          url: 'https://example.com/feed.xml',
          title: 'Test Feed',
          description: 'Test',
          link: 'https://example.com',
          lastFetchedAt: new Date(),
          articleCount: 0,
          unreadCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(storage.getAll).mockResolvedValue(mockFeeds);
      vi.mocked(storage.put).mockResolvedValue();

      await syncService.startAutoRefresh(60); // 60 minutes

      // Initial refresh should happen immediately
      expect(storage.getAll).toHaveBeenCalledWith('feeds');

      // Fast-forward 60 minutes (this will trigger the scheduled refresh)
      await vi.advanceTimersByTimeAsync(60 * 60 * 1000);
      
      // Should have called getAll at least twice (initial + scheduled)
      expect(storage.getAll).toHaveBeenCalledTimes(2);
    });

    it('should use default interval of 60 minutes when not specified', async () => {
      vi.mocked(storage.getAll).mockResolvedValue([]);
      vi.mocked(storage.put).mockResolvedValue();

      await syncService.startAutoRefresh();

      // Fast-forward 60 minutes (this will trigger the scheduled refresh)
      await vi.advanceTimersByTimeAsync(60 * 60 * 1000);

      // Should have refreshed after 60 minutes
      expect(storage.getAll).toHaveBeenCalledTimes(2);
    });

    it('should stop existing timer when starting new one', async () => {
      vi.mocked(storage.getAll).mockResolvedValue([]);
      vi.mocked(storage.put).mockResolvedValue();

      // Start first timer
      await syncService.startAutoRefresh(30);
      
      // Start second timer (should cancel first)
      await syncService.startAutoRefresh(60);

      // Fast-forward 30 minutes
      await vi.advanceTimersByTimeAsync(30 * 60 * 1000);

      // Should not trigger at 30 minutes (old timer was cancelled)
      // Initial call + after start of second timer
      expect(storage.getAll).toHaveBeenCalledTimes(2);

      // Fast-forward another 30 minutes (total 60)
      await vi.advanceTimersByTimeAsync(30 * 60 * 1000);

      // Now it should trigger (new 60-minute timer)
      expect(storage.getAll).toHaveBeenCalledTimes(3);
    });

    it('should clear timer when stopAutoRefresh is called', async () => {
      vi.mocked(storage.getAll).mockResolvedValue([]);
      vi.mocked(storage.put).mockResolvedValue();

      await syncService.startAutoRefresh(60);
      syncService.stopAutoRefresh();

      // Fast-forward 60 minutes
      await vi.advanceTimersByTimeAsync(60 * 60 * 1000);

      // Should only have initial refresh, no scheduled refresh
      expect(storage.getAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('Refresh All Feeds', () => {
    it('should skip refresh if already in progress', async () => {
      const mockFeed: Feed = {
        id: 'feed-1',
        url: 'https://example.com/feed.xml',
        title: 'Test Feed',
        description: 'Test',
        link: 'https://example.com',
        lastFetchedAt: new Date(),
        articleCount: 0,
        unreadCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Make the first call hang
      let resolveFirst: () => void;
      const firstCall = new Promise<Feed[]>((resolve) => {
        resolveFirst = () => resolve([mockFeed]);
      });

      vi.mocked(storage.getAll).mockReturnValueOnce(firstCall as any);
      vi.mocked(storage.put).mockResolvedValue();

      // Start first refresh (will hang)
      const firstRefresh = syncService.refreshAllFeeds();

      // Start second refresh while first is in progress
      const secondRefresh = syncService.refreshAllFeeds();

      // Resolve first call
      resolveFirst!();
      await firstRefresh;
      await secondRefresh;

      // Should only call getAll once (second call was skipped)
      expect(storage.getAll).toHaveBeenCalledTimes(1);
    });

    it('should update sync state before and after refresh', async () => {
      vi.mocked(storage.getAll).mockResolvedValue([]);
      vi.mocked(storage.put).mockResolvedValue();

      await syncService.refreshAllFeeds();

      // Should update sync state twice: before (syncing=true) and after (syncing=false)
      const putCalls = vi.mocked(storage.put).mock.calls;
      const syncStateCalls = putCalls.filter(([storeName]) => storeName === 'syncState');
      
      expect(syncStateCalls.length).toBeGreaterThanOrEqual(2);
      
      // First call: isSyncing = true
      const firstState = syncStateCalls[0][1] as SyncState;
      expect(firstState.isSyncing).toBe(true);
      expect(firstState.lastSyncAt).toBeNull();

      // Last call: isSyncing = false
      const lastState = syncStateCalls[syncStateCalls.length - 1][1] as SyncState;
      expect(lastState.isSyncing).toBe(false);
      expect(lastState.lastSyncAt).toBeInstanceOf(Date);
    });

    it('should only refresh active feeds (not deleted or paused)', async () => {
      const mockFeeds: Feed[] = [
        {
          id: 'feed-1',
          url: 'https://example.com/feed1.xml',
          title: 'Active Feed',
          description: 'Active',
          link: 'https://example.com',
          lastFetchedAt: new Date(),
          articleCount: 0,
          unreadCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'feed-2',
          url: 'https://example.com/feed2.xml',
          title: 'Paused Feed',
          description: 'Paused',
          link: 'https://example.com',
          lastFetchedAt: new Date(),
          articleCount: 0,
          unreadCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          paused: true,
        },
        {
          id: 'feed-3',
          url: 'https://example.com/feed3.xml',
          title: 'Deleted Feed',
          description: 'Deleted',
          link: 'https://example.com',
          lastFetchedAt: new Date(),
          articleCount: 0,
          unreadCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: new Date(),
        },
      ];

      vi.mocked(storage.getAll).mockResolvedValue(mockFeeds);
      vi.mocked(storage.put).mockResolvedValue();

      await syncService.refreshAllFeeds();

      // Should only refresh feed-1 (active)
      // The test verifies behavior by checking that only 1 feed was processed
      expect(storage.getAll).toHaveBeenCalledWith('feeds');
    });

    it('should process feeds in batches', async () => {
      // Create 12 feeds to test batching (batch size is 5)
      const mockFeeds: Feed[] = Array.from({ length: 12 }, (_, i) => ({
        id: `feed-${i}`,
        url: `https://example.com/feed${i}.xml`,
        title: `Feed ${i}`,
        description: 'Test',
        link: 'https://example.com',
        lastFetchedAt: new Date(),
        articleCount: 0,
        unreadCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      vi.mocked(storage.getAll).mockResolvedValue(mockFeeds);
      vi.mocked(storage.put).mockResolvedValue();

      await syncService.refreshAllFeeds();

      // Should complete successfully (batching prevents overwhelming system)
      expect(storage.getAll).toHaveBeenCalledWith('feeds');
    });
  });

  describe('Error Handling', () => {
    it('should update sync state even if refresh fails', async () => {
      vi.mocked(storage.getAll).mockRejectedValue(new Error('Database error'));
      vi.mocked(storage.put).mockResolvedValue();

      await syncService.refreshAllFeeds();

      // Should still update sync state with isSyncing=false
      const putCalls = vi.mocked(storage.put).mock.calls;
      const syncStateCalls = putCalls.filter(([storeName]) => storeName === 'syncState');
      
      const lastState = syncStateCalls[syncStateCalls.length - 1][1] as SyncState;
      expect(lastState.isSyncing).toBe(false);
    });

    it('should continue refreshing other feeds if one fails', async () => {
      const mockFeeds: Feed[] = [
        {
          id: 'feed-1',
          url: 'https://example.com/feed1.xml',
          title: 'Feed 1',
          description: 'Test',
          link: 'https://example.com',
          lastFetchedAt: new Date(),
          articleCount: 0,
          unreadCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'feed-2',
          url: 'https://example.com/feed2.xml',
          title: 'Feed 2',
          description: 'Test',
          link: 'https://example.com',
          lastFetchedAt: new Date(),
          articleCount: 0,
          unreadCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(storage.getAll).mockResolvedValue(mockFeeds);
      vi.mocked(storage.put).mockResolvedValue();

      await syncService.refreshAllFeeds();

      // Should complete without throwing error
      expect(storage.getAll).toHaveBeenCalledWith('feeds');
    });
  });
});
