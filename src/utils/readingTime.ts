/**
 * Reading Time Estimation Utilities
 */

/**
 * Calculate estimated reading time in minutes.
 * Strips HTML tags, counts words at 200 wpm, minimum 1 minute.
 */
export function calculateReadingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!text) return 1;
  const words = text.split(' ').filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

/**
 * Format reading time as a human-readable string.
 * @param minutes - estimated reading time in minutes
 * @param lang - language code (e.g. 'zh', 'zh-CN'); defaults to English
 */
export function formatReadingTime(minutes: number, lang?: string): string {
  const isChinese = lang && lang.startsWith('zh');
  if (isChinese) {
    return `${minutes} 分钟阅读`;
  }
  return `${minutes} min read`;
}
