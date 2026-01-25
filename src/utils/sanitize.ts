/**
 * HTML Sanitization Utility
 * Uses DOMPurify to sanitize article content and prevent XSS attacks
 */

import DOMPurify from 'dompurify';
import { logger } from '@lib/logger';

/**
 * Sanitize HTML content for safe rendering
 * Removes scripts, event handlers, and other dangerous elements/attributes
 */
export function sanitizeHTML(dirty: string): string {
  try {
    const clean = DOMPurify.sanitize(dirty, {
      ALLOWED_TAGS: [
        // Text formatting
        'p', 'br', 'span', 'div', 'pre', 'code', 'blockquote',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'strong', 'em', 'b', 'i', 'u', 's', 'mark', 'small', 'sub', 'sup',
        // Lists
        'ul', 'ol', 'li', 'dl', 'dt', 'dd',
        // Links and media
        'a', 'img', 'figure', 'figcaption',
        // Tables
        'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption',
        // Semantic
        'article', 'section', 'aside', 'header', 'footer', 'main', 'nav',
        'time', 'abbr', 'cite', 'q',
      ],
      ALLOWED_ATTR: [
        'href', 'src', 'alt', 'title', 'class', 'id',
        'width', 'height', 'loading', 'decoding',
        'datetime', 'cite',
        'colspan', 'rowspan',
        'target', 'rel', // for links
      ],
      ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|ftp):)/i,
      ALLOW_DATA_ATTR: false,
      ALLOW_UNKNOWN_PROTOCOLS: false,
      SAFE_FOR_TEMPLATES: true,
      // Add target="_blank" and rel="noopener noreferrer" to external links
      ADD_ATTR: ['target', 'rel'],
    });

    // Add security attributes to external links
    const parser = new DOMParser();
    const doc = parser.parseFromString(clean, 'text/html');
    const links = doc.querySelectorAll('a[href]');
    
    links.forEach((link) => {
      const href = link.getAttribute('href');
      if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      }
    });

    return doc.body.innerHTML;
  } catch (error) {
    logger.error('HTML sanitization failed', { error });
    return ''; // Return empty string on error (fail safe)
  }
}

/**
 * Sanitize plain text (strip all HTML tags)
 */
export function sanitizeText(text: string): string {
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] });
}

/**
 * Check if content contains potentially dangerous elements
 */
export function isDangerous(html: string): boolean {
  const dangerous = /<script|<iframe|javascript:|onerror=|onload=/i;
  return dangerous.test(html);
}
