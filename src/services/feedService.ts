/**
 * Feed Service
 * Handles RSS feed fetching, parsing, validation, and storage
 */

import { logger } from '@lib/logger';
import { parseFeed } from '@lib/rssParser';
import { validateFeedURL, looksLikeFeed } from '@utils/validators';
import { storage } from '@lib/storage';
import type { Feed, Article } from '@models/Feed';
import { nanoid } from 'nanoid';

// CORS proxy for development (bypasses browser CORS restrictions)
// Production should use server-side proxy or Service Worker
const CORS_PROXY = 'https://api.allorigins.win/get?url=';
const USE_CORS_PROXY = import.meta.env.DEV; // Only in development

/**
 * Fetch RSS feed from URL with proper headers
 */
export async function fetchFeedXML(url: string): Promise<{ xml: string; contentType: string | null }> {
  logger.info('Fetching feed XML', { url });

  try {
    // Use CORS proxy in development to bypass browser restrictions
    const fetchUrl = USE_CORS_PROXY ? `${CORS_PROXY}${encodeURIComponent(url)}` : url;
    
    const response = await fetch(fetchUrl, {
      headers: {
        'Accept': USE_CORS_PROXY ? 'application/json' : 'application/rss+xml, application/atom+xml, application/xml, text/xml',
        'User-Agent': 'RSS-Reader-PWA/1.0',
      },
      cache: 'no-cache',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    let contentType = response.headers.get('content-type');
    let xml: string;

    // When using CORS proxy, extract contents from JSON response
    if (USE_CORS_PROXY) {
      const jsonData = await response.json();
      xml = jsonData.contents;
      // The original content-type is not preserved, so we'll detect from content
      contentType = null;
    } else {
      xml = await response.text();
    }

    // Validate it looks like a feed
    if (!looksLikeFeed(contentType, xml)) {
      throw new Error('Response does not appear to be an RSS/Atom feed');
    }

    return { xml, contentType };
  } catch (error) {
    logger.error('Failed to fetch feed', error instanceof Error ? error : undefined, { url });
    throw error;
  }
}

/**
 * Subscribe to a new feed (with error handling for tests)
 */
export async function subscribeFeed(
  url: string,
  categoryId?: string
): Promise<{ success: boolean; feed?: Feed; articles?: Article[]; error?: string }> {
  try {
    const normalizedUrl = validateFeedURL(url);
    if (!normalizedUrl) {
      return { success: false, error: 'Invalid feed URL' };
    }

  // Check for duplicate
  const existingFeeds = await storage.getAll('feeds');
  const duplicate = existingFeeds.find(f => f.url === normalizedUrl && !f.deletedAt);
  if (duplicate) {
    logger.warn('Feed already exists', { url: normalizedUrl });
    return { success: false, error: 'You are already subscribed to this feed' };
  }

  // Fetch and parse
  const { xml } = await fetchFeedXML(normalizedUrl);
  const parsed = parseFeed(xml, normalizedUrl);

  // Create Feed entity
  const feed: Feed = {
    id: nanoid(),
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
    id: nanoid(),
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
    deletedAt: null,
  }));

  // Store in IndexedDB
  await storage.put('feeds', feed);
  await storage.bulkPut('articles', articles);

  logger.info('Subscribed to feed', { feedId: feed.id, title: feed.title, articleCount: articles.length });

  return { success: true, feed, articles };
  } catch (error) {
    logger.error('Failed to subscribe to feed', error instanceof Error ? error : undefined, { url });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to subscribe to feed',
    };
  }
}

/**
 * Get articles for a specific feed
 */
export async function getArticlesForFeed(
  feedId: string,
  options: { limit?: number; includeDeleted?: boolean } = {}
): Promise<Article[]> {
  const { limit, includeDeleted = false } = options;

  // Check if feed exists and not deleted
  if (!includeDeleted) {
    const feed = await storage.get('feeds', feedId);
    if (!feed || feed.deletedAt) {
      return [];
    }
  }

  // Get articles for this feed
  let articles = await storage.getAllByIndex('articles', 'feedId', feedId);

  // Sort by publishedAt descending (newest first)
  articles.sort((a, b) => {
    const dateA = new Date(a.publishedAt).getTime();
    const dateB = new Date(b.publishedAt).getTime();
    return dateB - dateA;
  });

  // Apply limit if specified
  if (limit) {
    articles = articles.slice(0, limit);
  }

  return articles;
}

/**
 * Get a single article by ID
 */
export async function getArticleById(articleId: string): Promise<Article | null> {
  const article = await storage.get('articles', articleId);
  return article || null;
}

/**
 * Mark an article as read
 */
export async function markArticleAsRead(articleId: string): Promise<void> {
  const article = await storage.get('articles', articleId);
  if (!article) {
    throw new Error('Article not found');
  }

  // Only update if not already read
  if (!article.readAt) {
    article.readAt = new Date();
    await storage.put('articles', article);
    logger.debug('Marked article as read', { articleId });
  }
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
        id: nanoid(),
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
        deletedAt: null,
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
