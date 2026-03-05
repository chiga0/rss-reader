/**
 * Integration test: Enhanced Article Card Features
 * Tests the complete article card rendering with enhanced features:
 * CJK reading time, favourite indicator, unread styling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ArticleItem } from '@components/ArticleList/ArticleItem';
import { calculateReadingTime, formatReadingTime, detectCjkRatio } from '@utils/readingTime';
import type { Article } from '@models/Feed';

// Mock online detection
vi.mock('../../src/hooks/useOfflineDetection', () => ({
  useOfflineDetection: vi.fn(() => ({ isOnline: true })),
}));

import { useOfflineDetection } from '../../src/hooks/useOfflineDetection';

const mockUseOfflineDetection = vi.mocked(useOfflineDetection);

const makeArticle = (overrides: Partial<Article> = {}): Article => ({
  id: 'art-1',
  feedId: 'feed-1',
  title: 'Test Article',
  summary: 'Test summary text',
  content: undefined,
  author: undefined,
  imageUrl: undefined,
  link: 'https://example.com/article',
  publishedAt: new Date('2025-06-15T10:00:00Z'),
  readAt: null,
  isFavorite: false,
  createdAt: new Date('2025-06-15T10:00:00Z'),
  deletedAt: null,
  ...overrides,
});

describe('Enhanced Article Card Integration', () => {
  const onClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseOfflineDetection.mockReturnValue({ isOnline: true });
  });

  describe('CJK-Aware Reading Time', () => {
    it('calculates correct reading time for English content', () => {
      const englishContent = 'word '.repeat(600); // 600 words ÷ 200 WPM = 3 min
      const result = calculateReadingTime(englishContent);
      expect(result.minutes).toBe(3);
      expect(result.isCjkDominant).toBe(false);
    });

    it('calculates correct reading time for CJK content', () => {
      const cjkContent = '测试文字内容'.repeat(100); // 600 CJK chars ÷ 400 CPM ≈ 2 min
      const result = calculateReadingTime(cjkContent);
      expect(result.minutes).toBeGreaterThanOrEqual(1);
      expect(result.isCjkDominant).toBe(true);
    });

    it('detects CJK dominance correctly', () => {
      const pureEnglish = 'Hello world this is a test';
      const pureCjk = '这是一个中文测试';
      const mixed = 'Hello world 你好世界';

      expect(detectCjkRatio(pureEnglish)).toBe(0);
      expect(detectCjkRatio(pureCjk)).toBeGreaterThan(0.5);
      expect(detectCjkRatio(mixed)).toBeGreaterThan(0);
    });

    it('formats reading time correctly', () => {
      expect(formatReadingTime(1)).toBe('1 min read');
      expect(formatReadingTime(5)).toBe('5 min read');
      expect(formatReadingTime(3, 'zh')).toBe('3 分钟阅读');
    });

    it('renders English reading time in article card', () => {
      const content = '<p>' + 'word '.repeat(400) + '</p>';
      render(<ArticleItem article={makeArticle({ content })} onClick={onClick} />);
      expect(screen.getByText('2 min read')).toBeInTheDocument();
    });

    it('minimum reading time is 1 minute', () => {
      const shortContent = '<p>Hello</p>';
      render(<ArticleItem article={makeArticle({ content: shortContent })} onClick={onClick} />);
      expect(screen.getByText('1 min read')).toBeInTheDocument();
    });
  });

  describe('Favourite Indicator', () => {
    it('shows heart icon for favourite articles', () => {
      render(<ArticleItem article={makeArticle({ isFavorite: true })} onClick={onClick} />);
      expect(screen.getByLabelText('Favourite')).toBeInTheDocument();
    });

    it('hides heart icon for non-favourite articles', () => {
      render(<ArticleItem article={makeArticle({ isFavorite: false })} onClick={onClick} />);
      expect(screen.queryByLabelText('Favourite')).not.toBeInTheDocument();
    });

    it('favourite heart has correct fill styling', () => {
      render(<ArticleItem article={makeArticle({ isFavorite: true })} onClick={onClick} />);
      const heart = screen.getByLabelText('Favourite');
      // Lucide icons apply className to SVG element or its parent
      const svgClasses = heart.getAttribute('class') || '';
      expect(svgClasses).toContain('fill-red-500');
      expect(svgClasses).toContain('text-red-500');
    });
  });

  describe('Unread Styling', () => {
    it('unread articles have blue dot + bold title + tinted background', () => {
      render(<ArticleItem article={makeArticle({ readAt: null })} onClick={onClick} />);

      // Blue dot
      expect(screen.getByLabelText('Unread')).toBeInTheDocument();

      // Bold title
      const title = screen.getByText('Test Article');
      expect(title.className).toContain('font-bold');

      // Background tint
      const article = screen.getByRole('article');
      expect(article.className).toContain('bg-blue-50/30');
    });

    it('read articles have no dot, semibold title, no tint', () => {
      render(<ArticleItem article={makeArticle({ readAt: new Date() })} onClick={onClick} />);

      // No blue dot
      expect(screen.queryByLabelText('Unread')).not.toBeInTheDocument();

      // Semibold title
      const title = screen.getByText('Test Article');
      expect(title.className).toContain('font-semibold');
      expect(title.className).not.toContain('font-bold');

      // No background tint
      const article = screen.getByRole('article');
      expect(article.className).not.toContain('bg-blue-50/30');
    });
  });

  describe('Complete Card Rendering', () => {
    it('renders all metadata in correct order: author · reading time · date', () => {
      render(
        <ArticleItem
          article={makeArticle({
            author: 'Jane Smith',
            content: '<p>' + 'word '.repeat(400) + '</p>',
          })}
          onClick={onClick}
        />
      );

      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('2 min read')).toBeInTheDocument();
      // Date should be present
      const dateStr = new Date('2025-06-15T10:00:00Z').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      expect(screen.getByText(dateStr)).toBeInTheDocument();
    });

    it('renders complete card with all features combined', () => {
      render(
        <ArticleItem
          article={makeArticle({
            title: 'Comprehensive Article',
            summary: 'A complete article with all features',
            author: 'Author X',
            content: '<p>' + 'word '.repeat(600) + '</p>',
            imageUrl: 'https://example.com/thumb.jpg',
            isFavorite: true,
            readAt: null,
          })}
          onClick={onClick}
        />
      );

      // Title
      expect(screen.getByText('Comprehensive Article')).toBeInTheDocument();
      // Summary
      expect(screen.getByText('A complete article with all features')).toBeInTheDocument();
      // Author
      expect(screen.getByText('Author X')).toBeInTheDocument();
      // Reading time
      expect(screen.getByText('3 min read')).toBeInTheDocument();
      // Favourite
      expect(screen.getByLabelText('Favourite')).toBeInTheDocument();
      // Unread
      expect(screen.getByLabelText('Unread')).toBeInTheDocument();
      // Image
      const img = document.querySelector('img');
      expect(img).not.toBeNull();
      expect(img?.getAttribute('src')).toBe('https://example.com/thumb.jpg');
    });

    it('handles click on complete card', () => {
      render(
        <ArticleItem
          article={makeArticle({
            title: 'Clickable Article',
            content: 'Some content',
            isFavorite: true,
          })}
          onClick={onClick}
        />
      );

      fireEvent.click(screen.getByRole('article'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Offline Mode', () => {
    it('shows cached badge when offline', () => {
      mockUseOfflineDetection.mockReturnValue({ isOnline: false });
      render(<ArticleItem article={makeArticle()} onClick={onClick} />);
      expect(screen.getByText('Cached')).toBeInTheDocument();
    });

    it('hides cached badge when online', () => {
      mockUseOfflineDetection.mockReturnValue({ isOnline: true });
      render(<ArticleItem article={makeArticle()} onClick={onClick} />);
      expect(screen.queryByText('Cached')).not.toBeInTheDocument();
    });
  });
});
