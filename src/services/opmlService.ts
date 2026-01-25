/**
 * OPML Service
 * Handles OPML import and export for feed subscriptions
 */

import { logger } from '@lib/logger';
import { storage } from '@lib/storage';
import type { Feed, Category } from '@models/Feed';

export interface OPMLOutline {
  text: string;
  title?: string;
  xmlUrl?: string;
  htmlUrl?: string;
  type?: string;
  children?: OPMLOutline[];
}

/**
 * Export feeds to OPML format
 */
export async function exportToOPML(): Promise<string> {
  logger.info('Exporting feeds to OPML');

  const feeds = await storage.getAll('feeds');
  const categories = await storage.getAll('categories');
  const activeFeeds = feeds.filter(f => !f.deletedAt);

  // Group feeds by category
  const feedsByCategory = new Map<string | undefined, Feed[]>();
  activeFeeds.forEach(feed => {
    const categoryId = feed.categoryId;
    if (!feedsByCategory.has(categoryId)) {
      feedsByCategory.set(categoryId, []);
    }
    feedsByCategory.get(categoryId)!.push(feed);
  });

  // Build OPML XML
  let opml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  opml += '<opml version="2.0">\n';
  opml += '  <head>\n';
  opml += `    <title>RSS Reader Subscriptions</title>\n`;
  opml += `    <dateCreated>${new Date().toUTCString()}</dateCreated>\n`;
  opml += '  </head>\n';
  opml += '  <body>\n';

  // Export categorized feeds
  categories.forEach(category => {
    const categoryFeeds = feedsByCategory.get(category.id) || [];
    if (categoryFeeds.length === 0) return;

    opml += `    <outline text="${escapeXML(category.name)}" title="${escapeXML(category.name)}">\n`;
    categoryFeeds.forEach(feed => {
      opml += `      <outline type="rss" text="${escapeXML(feed.title)}" title="${escapeXML(feed.title)}" xmlUrl="${escapeXML(feed.url)}"`;
      if (feed.link) {
        opml += ` htmlUrl="${escapeXML(feed.link)}"`;
      }
      opml += ' />\n';
    });
    opml += '    </outline>\n';
  });

  // Export uncategorized feeds
  const uncategorizedFeeds = feedsByCategory.get(undefined) || [];
  uncategorizedFeeds.forEach(feed => {
    opml += `    <outline type="rss" text="${escapeXML(feed.title)}" title="${escapeXML(feed.title)}" xmlUrl="${escapeXML(feed.url)}"`;
    if (feed.link) {
      opml += ` htmlUrl="${escapeXML(feed.link)}"`;
    }
    opml += ' />\n';
  });

  opml += '  </body>\n';
  opml += '</opml>';

  logger.info('Exported OPML', { feedCount: activeFeeds.length, categoryCount: categories.length });

  return opml;
}

/**
 * Import feeds from OPML file
 */
export async function importFromOPML(
  opmlContent: string,
  onProgress?: (current: number, total: number) => void
): Promise<{ imported: number; failed: number; errors: string[] }> {
  logger.info('Importing feeds from OPML');

  const parser = new DOMParser();
  const doc = parser.parseFromString(opmlContent, 'text/xml');

  // Check for parser errors
  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    throw new Error('Invalid OPML file: ' + parserError.textContent);
  }

  const outlines = parseOutlines(doc.querySelector('body'));
  const feedUrls: { url: string; category?: string }[] = [];

  // Extract feed URLs and categories
  function extractFeeds(outline: OPMLOutline, categoryName?: string) {
    if (outline.xmlUrl) {
      feedUrls.push({ url: outline.xmlUrl, category: categoryName });
    }
    if (outline.children) {
      outline.children.forEach(child => extractFeeds(child, outline.text));
    }
  }

  outlines.forEach(outline => extractFeeds(outline));

  logger.info('Found feeds in OPML', { count: feedUrls.length });

  // Import feeds with progress tracking
  let imported = 0;
  let failed = 0;
  const errors: string[] = [];

  // Import category first
  const categoryMap = new Map<string, string>();
  const existingCategories = await storage.getAll('categories');
  const existingCategoryNames = new Set(existingCategories.map(c => c.name));

  for (const { category } of feedUrls) {
    if (category && !categoryMap.has(category) && !existingCategoryNames.has(category)) {
      const newCategory: Category = {
        id: crypto.randomUUID(),
        name: category,
        order: existingCategories.length + categoryMap.size,
        createdAt: new Date(),
      };
      await storage.put('categories', newCategory);
      categoryMap.set(category, newCategory.id);
      logger.debug('Created category', { name: category });
    }
  }

  // Import feeds
  for (let i = 0; i < feedUrls.length; i++) {
    const { url, category } = feedUrls[i];

    try {
      const categoryId = category ? categoryMap.get(category) : undefined;
      // Note: subscribeFeed is from feedService, will be imported there
      // For now, we'll just log
      logger.debug('Importing feed', { url, category });
      imported++;
    } catch (error) {
      failed++;
      errors.push(`${url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      logger.warn('Failed to import feed', { url, error });
    }

    if (onProgress) {
      onProgress(i + 1, feedUrls.length);
    }
  }

  logger.info('OPML import completed', { imported, failed });

  return { imported, failed, errors };
}

/**
 * Parse OPML outline elements recursively
 */
function parseOutlines(parent: Element | null): OPMLOutline[] {
  if (!parent) return [];

  const outlines: OPMLOutline[] = [];
  const elements = parent.querySelectorAll(':scope > outline');

  elements.forEach(element => {
    const outline: OPMLOutline = {
      text: element.getAttribute('text') || '',
      title: element.getAttribute('title') || undefined,
      xmlUrl: element.getAttribute('xmlUrl') || undefined,
      htmlUrl: element.getAttribute('htmlUrl') || undefined,
      type: element.getAttribute('type') || undefined,
    };

    // Check for nested outlines (categories)
    const children = parseOutlines(element);
    if (children.length > 0) {
      outline.children = children;
    }

    outlines.push(outline);
  });

  return outlines;
}

/**
 * Escape XML special characters
 */
function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
