/**
 * Cache Management Service
 * Handles storage quota monitoring and cache cleanup
 */

import { logger } from '@lib/logger';
import { storage } from '@lib/storage';

class CacheService {
  private readonly MAX_ARTICLES_PER_FEED = 100;
  private readonly MAX_TOTAL_ARTICLES = 1000;
  private readonly DELETED_FEED_RETENTION_DAYS = 7;
  private readonly QUOTA_WARNING_THRESHOLD = 0.8; // 80%
  private readonly QUOTA_CRITICAL_THRESHOLD = 0.9; // 90%

  /**
   * Check storage quota and warn if needed
   */
  async checkQuota(): Promise<void> {
    const quota = await storage.getQuota();
    
    if (quota.percentUsed > this.QUOTA_CRITICAL_THRESHOLD * 100) {
      logger.warn('Storage quota critical', { 
        usage: quota.usage, 
        quota: quota.quota, 
        percentUsed: quota.percentUsed 
      });
      await this.performEmergencyCleanup();
    } else if (quota.percentUsed > this.QUOTA_WARNING_THRESHOLD * 100) {
      logger.info('Storage quota warning', { 
        usage: quota.usage, 
        quota: quota.quota, 
        percentUsed: quota.percentUsed 
      });
    }
  }

  /**
   * Prune old articles to stay within limits
   */
  async pruneArticles(): Promise<number> {
    logger.info('Pruning old articles');

    const articles = await storage.getAll('articles');
    const feeds = await storage.getAll('feeds');
    const activeFeeds = feeds.filter(f => !f.deletedAt);

    let pruned = 0;

    // Prune per-feed limits
    for (const feed of activeFeeds) {
      const feedArticles = articles
        .filter(a => a.feedId === feed.id)
        .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

      if (feedArticles.length > this.MAX_ARTICLES_PER_FEED) {
        // Keep: unread, favorites, and most recent
        const toDelete = feedArticles
          .slice(this.MAX_ARTICLES_PER_FEED)
          .filter(a => !a.isFavorite && a.readAt !== null);

        for (const article of toDelete) {
          await storage.delete('articles', article.id);
          pruned++;
        }
      }
    }

    // Prune total article limit
    const totalArticles = await storage.getAll('articles');
    if (totalArticles.length > this.MAX_TOTAL_ARTICLES) {
      const sortedArticles = totalArticles
        .filter(a => !a.isFavorite && a.readAt !== null)
        .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

      const toDelete = sortedArticles.slice(this.MAX_TOTAL_ARTICLES);
      for (const article of toDelete) {
        await storage.delete('articles', article.id);
        pruned++;
      }
    }

    logger.info('Article pruning completed', { pruned });
    return pruned;
  }

  /**
   * Purge soft-deleted feeds older than retention period
   */
  async purgeDeletedFeeds(): Promise<number> {
    logger.info('Purging deleted feeds');

    const feeds = await storage.getAll('feeds');
    const now = new Date();
    const retentionMs = this.DELETED_FEED_RETENTION_DAYS * 24 * 60 * 60 * 1000;

    let purged = 0;

    for (const feed of feeds) {
      if (feed.deletedAt) {
        const deletedAge = now.getTime() - feed.deletedAt.getTime();
        
        if (deletedAge > retentionMs) {
          // Delete feed
          await storage.delete('feeds', feed.id);
          
          // Delete all articles
          const articles = await storage.getAllByIndex('articles', 'feedId', feed.id);
          for (const article of articles) {
            await storage.delete('articles', article.id);
          }
          
          purged++;
          logger.debug('Purged deleted feed', { feedId: feed.id, title: feed.title });
        }
      }
    }

    logger.info('Deleted feed purge completed', { purged });
    return purged;
  }

  /**
   * Emergency cleanup when quota is critical
   */
  private async performEmergencyCleanup(): Promise<void> {
    logger.warn('Performing emergency cleanup');

    // 1. Purge deleted feeds immediately
    await this.purgeDeletedFeeds();

    // 2. Aggressive article pruning
    await this.pruneArticles();

    // 3. Check quota again
    const quota = await storage.getQuota();
    if (quota.percentUsed > this.QUOTA_CRITICAL_THRESHOLD * 100) {
      logger.error('Emergency cleanup insufficient', { percentUsed: quota.percentUsed });
      // TODO: Show user warning
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    totalArticles: number;
    totalFeeds: number;
    totalCategories: number;
    deletedFeeds: number;
    favoriteArticles: number;
    unreadArticles: number;
    storageUsed: number;
    storageQuota: number;
    percentUsed: number;
  }> {
    const articles = await storage.getAll('articles');
    const feeds = await storage.getAll('feeds');
    const categories = await storage.getAll('categories');
    const quota = await storage.getQuota();

    return {
      totalArticles: articles.length,
      totalFeeds: feeds.filter(f => !f.deletedAt).length,
      totalCategories: categories.length,
      deletedFeeds: feeds.filter(f => f.deletedAt).length,
      favoriteArticles: articles.filter(a => a.isFavorite).length,
      unreadArticles: articles.filter(a => !a.readAt).length,
      storageUsed: quota.usage,
      storageQuota: quota.quota,
      percentUsed: quota.percentUsed,
    };
  }

  /**
   * Run periodic maintenance
   */
  async runMaintenance(): Promise<void> {
    logger.info('Running cache maintenance');

    await this.checkQuota();
    await this.pruneArticles();
    await this.purgeDeletedFeeds();

    const stats = await this.getStats();
    logger.info('Cache maintenance completed', stats);
  }
}

export const cacheService = new CacheService();
