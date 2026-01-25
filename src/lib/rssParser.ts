/**
 * RSS/Atom Feed Parser
 * Uses browser's native DOMParser (zero dependencies)
 */

import type { Feed, Article } from '@models/Feed';
import { logger } from './logger';

export type FeedFormat = 'RSS 2.0' | 'Atom 1.0' | 'Unknown';

export interface ParsedFeed {
  feed: Omit<Feed, 'id' | 'categoryId' | 'lastFetchedAt' | 'refreshIntervalMinutes' | 'paused' | 'errorCount' | 'createdAt' | 'deletedAt'>;
  articles: Omit<Article, 'id' | 'feedId' | 'createdAt'>[];
  format: FeedFormat;
}

/**
 * Parse RSS 2.0 or Atom 1.0 feed from XML string
 */
export function parseFeed(xmlString: string, feedUrl: string): ParsedFeed {
  logger.info('Parsing feed', { feedUrl, size: xmlString.length });

  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'text/xml');

  // Check for parser errors
  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    logger.error('XML parser error', { feedUrl, error: parserError.textContent });
    throw new Error(`Failed to parse XML: ${parserError.textContent}`);
  }

  // Detect feed format
  const format = detectFeedFormat(doc);
  logger.debug('Detected feed format', { feedUrl, format });

  if (format === 'RSS 2.0') {
    return parseRSS2(doc, feedUrl);
  } else if (format === 'Atom 1.0') {
    return parseAtom(doc, feedUrl);
  } else {
    throw new Error('Unsupported feed format. Only RSS 2.0 and Atom 1.0 are supported.');
  }
}

/**
 * Detect feed format from XML document
 */
function detectFeedFormat(doc: Document): FeedFormat {
  const root = doc.documentElement;

  if (root.nodeName === 'rss' && root.getAttribute('version') === '2.0') {
    return 'RSS 2.0';
  }

  if (root.nodeName === 'feed' && root.namespaceURI === 'http://www.w3.org/2005/Atom') {
    return 'Atom 1.0';
  }

  return 'Unknown';
}

/**
 * Parse RSS 2.0 feed
 */
function parseRSS2(doc: Document, feedUrl: string): ParsedFeed {
  const channel = doc.querySelector('channel');
  if (!channel) {
    throw new Error('Invalid RSS 2.0 feed: missing <channel> element');
  }

  // Extract feed metadata
  const title = getTextContent(channel, 'title') || 'Untitled Feed';
  const description = getTextContent(channel, 'description') || '';
  const link = getTextContent(channel, 'link') || feedUrl;
  
  // Extract feed icon (RSS 2.0 uses <image><url>)
  const imageElement = channel.querySelector('image');
  const iconUrl = imageElement ? getTextContent(imageElement, 'url') : undefined;

  const feed: ParsedFeed['feed'] = {
    url: feedUrl,
    title,
    description,
    link,
    iconUrl,
  };

  // Extract articles
  const items = Array.from(channel.querySelectorAll('item'));
  const articles: ParsedFeed['articles'] = items.map((item) => {
    const title = getTextContent(item, 'title') || 'Untitled';
    const link = getTextContent(item, 'link') || '';
    const description = getTextContent(item, 'description') || '';
    
    // Try <content:encoded> for full content (common extension)
    const contentEncoded = item.getElementsByTagNameNS('http://purl.org/rss/1.0/modules/content/', 'encoded')[0];
    const content = contentEncoded?.textContent || description;
    
    // Handle Dublin Core creator (common extension for author)
    const dcCreator = item.getElementsByTagNameNS('http://purl.org/dc/elements/1.1/', 'creator')[0];
    const author = getTextContent(item, 'author') || dcCreator?.textContent?.trim() || undefined;
    const pubDateStr = getTextContent(item, 'pubDate');
    const publishedAt = pubDateStr ? new Date(pubDateStr) : new Date();

    // Extract first image from content or enclosure
    let imageUrl: string | undefined;
    const enclosure = item.querySelector('enclosure[type^="image"]');
    if (enclosure) {
      imageUrl = enclosure.getAttribute('url') || undefined;
    } else {
      imageUrl = extractFirstImage(content);
    }

    return {
      title,
      summary: description,
      content,
      author,
      imageUrl,
      link,
      publishedAt,
      readAt: null,
      isFavorite: false,
      deletedAt: null,
    };
  });

  logger.info('Parsed RSS 2.0 feed', { feedUrl, title, articleCount: articles.length });

  return { feed, articles, format: 'RSS 2.0' };
}

/**
 * Parse Atom 1.0 feed
 */
function parseAtom(doc: Document, feedUrl: string): ParsedFeed {
  const feedElement = doc.documentElement;

  // Extract feed metadata
  const title = getTextContent(feedElement, 'title') || 'Untitled Feed';
  const subtitle = getTextContent(feedElement, 'subtitle') || '';
  
  // Atom uses <link rel="alternate">
  const linkElement = feedElement.querySelector('link[rel="alternate"]') || feedElement.querySelector('link');
  const link = linkElement?.getAttribute('href') || feedUrl;

  // Atom icon
  const iconUrl = getTextContent(feedElement, 'icon') || getTextContent(feedElement, 'logo') || undefined;

  const feed: ParsedFeed['feed'] = {
    url: feedUrl,
    title,
    description: subtitle,
    link,
    iconUrl,
  };

  // Extract articles (Atom uses <entry>)
  const entries = Array.from(feedElement.querySelectorAll('entry'));
  const articles: ParsedFeed['articles'] = entries.map((entry) => {
    const title = getTextContent(entry, 'title') || 'Untitled';
    
    const linkElement = entry.querySelector('link[rel="alternate"]') || entry.querySelector('link');
    const link = linkElement?.getAttribute('href') || '';

    const summary = getTextContent(entry, 'summary') || '';
    const content = getTextContent(entry, 'content') || summary;

    // Atom author
    const authorElement = entry.querySelector('author name');
    const author = authorElement?.textContent || undefined;

    // Atom published/updated dates
    const publishedStr = getTextContent(entry, 'published') || getTextContent(entry, 'updated');
    const publishedAt = publishedStr ? new Date(publishedStr) : new Date();

    // Extract image
    let imageUrl: string | undefined;
    const mediaContent = entry.querySelector('media\\:content[medium="image"], [medium="image"]');
    if (mediaContent) {
      imageUrl = mediaContent.getAttribute('url') || undefined;
    } else {
      imageUrl = extractFirstImage(content);
    }

    return {
      title,
      summary,
      content,
      author,
      imageUrl,
      link,
      publishedAt,
      readAt: null,
      isFavorite: false,
      deletedAt: null,
    };
  });

  logger.info('Parsed Atom 1.0 feed', { feedUrl, title, articleCount: articles.length });

  return { feed, articles, format: 'Atom 1.0' };
}

/**
 * Get text content from first matching child element
 */
function getTextContent(parent: Element, selector: string): string {
  const element = parent.querySelector(selector);
  return element?.textContent?.trim() || '';
}

/**
 * Extract first image URL from HTML content
 */
function extractFirstImage(html: string): string | undefined {
  const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return imgMatch?.[1];
}
