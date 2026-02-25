/**
 * Router loader functions for data fetching
 * Feature: Replace global components with Shadcn UI
 * Created: 2026-02-05
 */

import { storage } from '@/lib/storage';
import { logger } from '@/lib/logger';
import type { Feed, Article } from '@/models';

/**
 * Load all feeds for the feeds page
 * @returns Feeds data with offline status
 */
export async function loadFeedsData() {
  try {
    await storage.init().catch(() => { /* already initialized */ });
    const feeds = await storage.getAll('feeds') as Feed[];
    return {
      feeds: feeds || [],
      isOffline: !navigator.onLine
    };
  } catch (error) {
    logger.error('Failed to load feeds', error as Error);
    return {
      feeds: [],
      isOffline: true,
      error: error as Error
    };
  }
}

/**
 * Load feed detail with articles
 * @param params - Route params containing feedId
 * @returns Feed and articles data
 */
export async function loadFeedDetail({ params }: { params: { feedId: string } }) {
  try {
    await storage.init().catch(() => { /* already initialized */ });
    const feed = await storage.get('feeds', params.feedId) as Feed;
    if (!feed) {
      throw new Response('Feed not found', { status: 404 });
    }

    const allArticles = await storage.getAll('articles') as Article[];
    const articles = allArticles.filter(a => a.feedId === params.feedId);

    return {
      feed,
      articles,
      isOffline: !navigator.onLine
    };
  } catch (error) {
    if (error instanceof Response) throw error; // Re-throw 404
    logger.error('Failed to load feed detail', error as Error);
    throw new Response('Internal server error', { status: 500 });
  }
}

/**
 * Load article detail and mark as read
 * @param params - Route params containing articleId
 * @returns Article and associated feed
 */
export async function loadArticleDetail({ params }: { params: { articleId: string } }) {
  try {
    await storage.init().catch(() => { /* already initialized */ });
    const article = await storage.get('articles', params.articleId) as Article;
    if (!article) {
      throw new Response('Article not found', { status: 404 });
    }

    // Mark article as read when opened
    if (!article.readAt) {
      article.readAt = new Date();
      await storage.put('articles', article);
    }

    const feed = await storage.get('feeds', article.feedId) as Feed;

    return { article, feed };
  } catch (error) {
    if (error instanceof Response) throw error; // Re-throw 404
    logger.error('Failed to load article detail', error as Error);
    throw new Response('Internal server error', { status: 500 });
  }
}
