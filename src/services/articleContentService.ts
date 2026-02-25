/**
 * Article Content Service
 * Fetches full article content from the original URL using Readability.
 * Many RSS feeds only include summaries/excerpts. This service fetches
 * the full article from the original page when needed.
 */

import { Readability } from '@mozilla/readability';
import { logger } from '@lib/logger';
import { storage } from '@lib/storage';
import type { Article } from '@models/Feed';

// CORS proxy (same as feedService)
const CORS_PROXY = 'https://api.allorigins.win/get?url=';
const USE_CORS_PROXY = import.meta.env.DEV;

/**
 * Fetch and extract full article content from the original URL.
 * Returns the extracted HTML content, or null if extraction fails.
 */
export async function fetchFullArticleContent(url: string): Promise<string | null> {
  logger.info('Fetching full article content', { url });

  try {
    const fetchUrl = USE_CORS_PROXY ? `${CORS_PROXY}${encodeURIComponent(url)}` : url;

    const response = await fetch(fetchUrl, {
      headers: {
        'Accept': USE_CORS_PROXY ? 'application/json' : 'text/html',
        'User-Agent': 'RSS-Reader-PWA/1.0',
      },
      cache: 'no-cache',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    let html: string;
    if (USE_CORS_PROXY) {
      const jsonData = await response.json();
      html = jsonData.contents;
    } else {
      html = await response.text();
    }

    if (!html) {
      return null;
    }

    // Parse the HTML and extract article content using Readability
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Set the base URL for resolving relative URLs in the article
    const baseEl = doc.createElement('base');
    baseEl.href = url;
    doc.head.appendChild(baseEl);

    const reader = new Readability(doc);
    const article = reader.parse();

    if (!article || !article.content) {
      logger.warn('Readability could not extract content', { url });
      return null;
    }

    logger.info('Extracted full article content', {
      url,
      contentLength: article.content.length,
    });

    return article.content;
  } catch (error) {
    logger.error('Failed to fetch full article content', error instanceof Error ? error : undefined, { url });
    return null;
  }
}

/**
 * Fetch full content for an article and update it in storage.
 * Returns the updated article with full content.
 */
export async function fetchAndCacheFullContent(article: Article): Promise<Article> {
  if (!article.link) {
    return article;
  }

  const fullContent = await fetchFullArticleContent(article.link);
  if (fullContent) {
    article.content = fullContent;
    await storage.put('articles', article);
    logger.info('Cached full article content', { articleId: article.id });
  }

  return article;
}
