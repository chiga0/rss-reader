/**
 * Reading Time Estimation Utilities
 * Supports CJK-aware reading time calculation for bilingual content.
 */

/** Result of reading time calculation with language breakdown */
export interface ReadingTimeResult {
  /** Estimated reading time in minutes (≥ 1) */
  minutes: number;
  /** Number of CJK characters found */
  cjkCharCount: number;
  /** Number of Latin words found */
  wordCount: number;
  /** Whether the content is predominantly CJK (≥ 50% CJK characters) */
  isCjkDominant: boolean;
}

/**
 * CJK Unicode ranges:
 * - U+4E00–U+9FFF  CJK Unified Ideographs
 * - U+3400–U+4DBF  CJK Unified Ideographs Extension A
 * - U+F900–U+FAFF  CJK Compatibility Ideographs
 * - U+3000–U+303F  CJK Symbols and Punctuation
 * - U+3040–U+309F  Hiragana
 * - U+30A0–U+30FF  Katakana
 * - U+AC00–U+D7AF  Hangul Syllables
 */
const CJK_REGEX =
  /[\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF]/g;

/**
 * Detect the ratio of CJK characters in a plain text string.
 * @returns ratio between 0.0 and 1.0
 */
export function detectCjkRatio(text: string): number {
  if (!text) return 0;
  const cjkMatches = text.match(CJK_REGEX);
  const cjkCount = cjkMatches ? cjkMatches.length : 0;
  const totalChars = text.replace(/\s/g, '').length;
  if (totalChars === 0) return 0;
  return cjkCount / totalChars;
}

/**
 * Calculate estimated reading time in minutes.
 * Uses 200 WPM for Latin text and 400 CPM for CJK characters.
 * Bilingual content is weighted by character proportion.
 * Strips HTML tags before counting. Minimum 1 minute.
 */
export function calculateReadingTime(html: string): ReadingTimeResult {
  const text = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return { minutes: 1, cjkCharCount: 0, wordCount: 0, isCjkDominant: false };

  // Count CJK characters
  const cjkMatches = text.match(CJK_REGEX);
  const cjkCharCount = cjkMatches ? cjkMatches.length : 0;

  // Remove CJK characters and count remaining Latin words
  const latinText = text.replace(CJK_REGEX, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = latinText ? latinText.split(' ').filter(Boolean).length : 0;

  // Calculate reading time: CJK at 400 CPM, Latin at 200 WPM
  const cjkMinutes = cjkCharCount / 400;
  const latinMinutes = wordCount / 200;
  const minutes = Math.max(1, Math.ceil(cjkMinutes + latinMinutes));

  const cjkRatio = detectCjkRatio(text);
  const isCjkDominant = cjkRatio >= 0.5;

  return { minutes, cjkCharCount, wordCount, isCjkDominant };
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
