/**
 * Feed Service
 * Handles RSS feed fetching, parsing, validation, and storage
 */

import { logger } from '@lib/logger';
import { parseFeed } from '@lib/rssParser';
import { validateFeedURL, looksLikeFeed } from '@utils/validators';
import { storage } from '@lib/storage';
import type { Feed, Article } from '@models/Feed';
import { v4 as uuidv4 } from 'uuid';

/**
 * Fetch RSS feed from URL with proper headers
 */
export async function fetchFeedXML(url: string): Promise<{ xml: string; contentType: string | null }> {
  logger.info('Fetching feed XML', { url });

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml',
        'User-Agent': 'RSS-Reader-PWA/1.0',
      },
      cache: 'no-cache',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    const xml = await response.text();

    // Validate it looks like a feed
    if (!looksLikeFeed(contentType, xml)) {
      throw new Error('Response does not appear to be an RSS/Atom feed');
    }

    return { xml, contentType };
  } catch (error) {
    logger.error('Failed to fetch feed', { url, error });
    throw error;
  }
}

/**
 * Subscribe to a new feed
 */
export async function subscribeFeed(url: string, categoryId?: string): Promise<{ feed: Feed; articles: Article[] }> {
  const normalizedUrl = validateFeedURL(url);
  if (!normalizedUrl) {
    throw new Error('Invalid feed URL');
  }

  // Check for duplicate
  const existingFeeds = await storage.getAll('feeds');
  const duplicate = existingFeeds.find(f => f.url === normalizedUrl && !f.deletedAt);
  if (duplicate) {
    logger.warn('Feed already exists', { url: normalizedUrl });
    throw new Error('Feed already subscribed');
  }

  // Fetch and parse
  const { xml } = await fetchFeedXML(normalizedUrl);
  const parsed = parseFeed(xml, normalizedUrl);

  // Create Feed entity
  const feed: Feed = {
    id: uuidv4(),
    url: normalizedUrl,
    title: parsed.feed.title,
    description: parsed.feed.description || '',
    link: parsed.feed.link,
    iconUrl: parsed.feed.iconUrl,
    categoryId,
    lastFetchedAt: new Date(),
    refreshIntervalMinutes: 60, // Default 1 hour
    paused: false,
    errorCount: 0,
    createdAt: new Date(),
    deletedAt: null,
  };

  // Create Article entities
  const articles: Article[] = parsed.articles.map(a => ({
    id: uuidv4(),
    feedId: feed.id,
    title: a.title,
    summary: a.summary,
    content: a.content,
    author: a.author,
    imageUrl: a.imageUrl,
    link: a.link,
    publishedAt: a.publishedAt,
    readAt: null,
    isFavorite: false,
    createdAt: new Date(),
  }));

  // Store in IndexedDB
  await storage.put('feeds', feed);
  await storage.bulkPut('articles', articles);

  logger.info('Subscribed to feed', { feedId: feed.id, title: feed.title, articleCount: articles.length });

  return { feed, articles };
}

/**
 * Fetch and store new articles for a feed
 */
export async function fetchAndStoreArticles(feedId: string): Promise<Article[]> {
  const feed = await storage.get('feeds', feedId);
  if (!feed) {
    throw new Error('Feed not found');
  }

  if (feed.paused) {
    logger.debug('Feed is paused, skipping refresh', { feedId });
    return [];
  }

  try {
    const { xml } = await fetchFeedXML(feed.url);
    const parsed = parseFeed(xml, feed.url);

    // Get existing article links to avoid duplicates
    const existingArticles = await storage.getAllByIndex('articles', 'feedId', feedId);
    const existingLinks = new Set(existingArticles.map(a => a.link));

    // Filter new articles
    const newArticles: Article[] = parsed.articles
      .filter(a => !existingLinks.has(a.link))
      .map(a => ({
        id: uuidv4(),
        feedId: feed.id,
        title: a.title,
        summary: a.summary,
        content: a.content,
        author: a.author,
        imageUrl: a.imageUrl,
        link: a.link,
        publishedAt: a.publishedAt,
        readAt: null,
        isFavorite: false,
        createdAt: new Date(),
      }));

    if (newArticles.length > 0) {
      await storage.bulkPut('articles', newArticles);
    }

    // Update feed metadata
    feed.lastFetchedAt = new Date();
    feed.errorCount = 0;
    await storage.put('feeds', feed);

    logger.info('Fetched articles for feed', { feedId, newCount: newArticles.length });

    return newArticles;
  } catch (error) {
    // Increment error count
    feed.errorCount++;
    feed.lastFetchedAt = new Date();
    await storage.put('feeds', feed);

    logger.error('Failed to refresh feed', { feedId, error });
    throw error;
  }
}
