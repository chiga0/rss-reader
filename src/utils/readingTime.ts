/**
 * Reading Time Utility
 * Estimates the number of minutes required to read an article.
 */

/** Average reading speed in words per minute for an adult reader. */
const WORDS_PER_MINUTE = 200;

/**
 * Strip HTML tags and return plain text.
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Count the number of words in a plain-text string.
 */
function countWords(text: string): number {
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}

/**
 * Calculate estimated reading time for the given content.
 *
 * @param content - Raw HTML or plain-text article content.
 * @returns Estimated reading time in whole minutes (minimum 1).
 */
export function calculateReadingTime(content: string): number {
  if (!content) return 1;
  const plain = stripHtml(content);
  const words = countWords(plain);
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

/**
 * Format a reading time number as a human-readable string.
 * e.g. 1 → "1 min read", 5 → "5 min read"
 */
export function formatReadingTime(minutes: number): string {
  return `${minutes} min read`;
}
