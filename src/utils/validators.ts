/**
 * Validation Utilities
 * URL validation, feed validation, and input sanitization
 */

import { logger } from '@lib/logger';

/**
 * Validate if string is a valid HTTP/HTTPS URL
 */
export function isValidURL(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validate and normalize feed URL
 * Returns normalized URL or null if invalid
 */
export function validateFeedURL(urlString: string): string | null {
  const trimmed = urlString.trim();
  
  if (!trimmed) {
    return null;
  }

  // Check for invalid protocols first
  if (trimmed.match(/^(javascript|data|file):/i)) {
    logger.warn('Invalid feed URL protocol', { url: urlString });
    return null;
  }

  // Add https:// if no protocol specified
  let normalized = trimmed;
  if (!normalized.match(/^https?:\/\//i)) {
    normalized = `https://${normalized}`;
  }

  // Additional validation for malformed URLs
  if (!normalized.match(/^https?:\/\/[a-z0-9]+(?:[-.][a-z0-9]+)*\.[a-z]{2,}(:[0-9]{1,5})?(\/.*)?$/i)) {
    if (!normalized.match(/^https?:\/\/localhost(:[0-9]{1,5})?(\/.*)?$/i)) {
      logger.warn('Invalid feed URL format', { url: urlString });
      return null;
    }
  }

  if (!isValidURL(normalized)) {
    logger.warn('Invalid feed URL', { url: urlString });
    return null;
  }

  return normalized;
}

/**
 * Validate feed title
 */
export function validateFeedTitle(title: string): boolean {
  const trimmed = title.trim();
  return trimmed.length > 0 && trimmed.length <= 200;
}

/**
 * Validate category name
 */
export function validateCategoryName(name: string): boolean {
  const trimmed = name.trim();
  return trimmed.length > 0 && trimmed.length <= 50;
}

/**
 * Validate refresh interval (in minutes)
 */
export function validateRefreshInterval(minutes: number): boolean {
  return Number.isInteger(minutes) && minutes >= 5 && minutes <= 1440; // 5 min to 24 hours
}

/**
 * Sanitize string for safe storage (trim, max length)
 */
export function sanitizeString(str: string, maxLength: number = 1000): string {
  return str.trim().slice(0, maxLength);
}

/**
 * Check if response is likely an RSS/Atom feed
 */
export function looksLikeFeed(contentType: string | null, content: string): boolean {
  // Check Content-Type header
  if (contentType) {
    const lowerContentType = contentType.toLowerCase();
    const feedTypes = [
      'application/rss+xml',
      'application/atom+xml',
      'application/xml',
      'text/xml',
      'application/rdf+xml',
    ];
    
    if (feedTypes.some(type => lowerContentType.includes(type))) {
      return true;
    }
  }

  // Check content for RSS/Atom markers
  const hasRSSMarker = content.includes('<rss') && content.includes('</rss>');
  const hasAtomMarker = content.includes('<feed') && content.includes('</feed>');
  
  return hasRSSMarker || hasAtomMarker;
}
