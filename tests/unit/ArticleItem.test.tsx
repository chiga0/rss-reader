/**
 * Unit tests for ArticleItem component
 * Tests rendering of title, summary, date, unread indicator,
 * reading time, favourite heart, cached badge, and article image
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ArticleItem } from '@components/ArticleList/ArticleItem';
import type { Article } from '@models/Feed';

// Mock the useOfflineDetection hook
vi.mock('../../src/hooks/useOfflineDetection', () => ({
  useOfflineDetection: vi.fn(() => ({ isOnline: true })),
}));

import { useOfflineDetection } from '../../src/hooks/useOfflineDetection';

const mockUseOfflineDetection = vi.mocked(useOfflineDetection);

const makeArticle = (overrides: Partial<Article> = {}): Article => ({
  id: 'article-1',
  feedId: 'feed-1',
  title: 'Test Article Title',
  summary: 'This is a test article summary',
  content: '<p>' + 'word '.repeat(400) + '</p>', // ~400 words = 2 min read
  author: 'Test Author',
  imageUrl: undefined,
  link: 'https://example.com/article1',
  publishedAt: new Date('2026-01-15T10:30:00Z'),
  readAt: null, // unread
  isFavorite: false,
  createdAt: new Date('2026-01-15T10:30:00Z'),
  deletedAt: null,
  ...overrides,
});

describe('ArticleItem', () => {
  const onClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseOfflineDetection.mockReturnValue({ isOnline: true });
  });

  // --- Basic rendering ---

  it('renders article title', () => {
    render(<ArticleItem article={makeArticle()} onClick={onClick} />);
    expect(screen.getByText('Test Article Title')).toBeInTheDocument();
  });

  it('renders article summary', () => {
    render(<ArticleItem article={makeArticle()} onClick={onClick} />);
    expect(screen.getByText('This is a test article summary')).toBeInTheDocument();
  });

  it('renders author name', () => {
    render(<ArticleItem article={makeArticle()} onClick={onClick} />);
    expect(screen.getByText('Test Author')).toBeInTheDocument();
  });

  it('does not render summary when not provided', () => {
    render(<ArticleItem article={makeArticle({ summary: '' })} onClick={onClick} />);
    // No summary paragraph should exist
    const paragraphs = document.querySelectorAll('p');
    const summaryP = Array.from(paragraphs).find((p) => p.className.includes('line-clamp'));
    expect(summaryP).toBeUndefined();
  });

  it('does not render author when not provided', () => {
    render(<ArticleItem article={makeArticle({ author: undefined })} onClick={onClick} />);
    expect(screen.queryByText('Test Author')).not.toBeInTheDocument();
  });

  // --- Click handler ---

  it('calls onClick when article is clicked', () => {
    render(<ArticleItem article={makeArticle()} onClick={onClick} />);
    const articleEl = screen.getByRole('article');
    fireEvent.click(articleEl);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  // --- Unread indicator ---

  it('shows unread indicator (blue dot) for unread articles', () => {
    render(<ArticleItem article={makeArticle({ readAt: null })} onClick={onClick} />);
    const dot = screen.getByLabelText('Unread');
    expect(dot).toBeInTheDocument();
  });

  it('hides unread indicator for read articles', () => {
    render(<ArticleItem article={makeArticle({ readAt: new Date() })} onClick={onClick} />);
    expect(screen.queryByLabelText('Unread')).not.toBeInTheDocument();
  });

  it('applies bold styling for unread articles', () => {
    render(<ArticleItem article={makeArticle({ readAt: null })} onClick={onClick} />);
    const title = screen.getByText('Test Article Title');
    expect(title.className).toContain('font-bold');
  });

  it('applies semibold styling for read articles', () => {
    render(<ArticleItem article={makeArticle({ readAt: new Date() })} onClick={onClick} />);
    const title = screen.getByText('Test Article Title');
    expect(title.className).toContain('font-semibold');
  });

  // --- Reading time ---

  it('displays reading time estimate', () => {
    render(<ArticleItem article={makeArticle()} onClick={onClick} />);
    // ~400 words / 200 wpm = 2 min read
    expect(screen.getByText('2 min read')).toBeInTheDocument();
  });

  it('does not display reading time for articles without content', () => {
    render(
      <ArticleItem article={makeArticle({ content: undefined, summary: '' })} onClick={onClick} />
    );
    expect(screen.queryByText(/min read/)).not.toBeInTheDocument();
  });

  it('falls back to summary for reading time when no content', () => {
    const longSummary = 'word '.repeat(200); // ~200 words = 1 min
    render(
      <ArticleItem
        article={makeArticle({ content: undefined, summary: longSummary })}
        onClick={onClick}
      />
    );
    expect(screen.getByText('1 min read')).toBeInTheDocument();
  });

  // --- Favourite indicator ---

  it('shows filled red heart for favourite articles', () => {
    render(<ArticleItem article={makeArticle({ isFavorite: true })} onClick={onClick} />);
    const heart = screen.getByLabelText('Favourite');
    expect(heart).toBeInTheDocument();
  });

  it('hides heart icon for non-favourite articles', () => {
    render(<ArticleItem article={makeArticle({ isFavorite: false })} onClick={onClick} />);
    expect(screen.queryByLabelText('Favourite')).not.toBeInTheDocument();
  });

  // --- Article image ---

  it('renders article image when imageUrl is provided', () => {
    render(
      <ArticleItem
        article={makeArticle({ imageUrl: 'https://example.com/thumb.jpg' })}
        onClick={onClick}
      />
    );
    const img = document.querySelector('img');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('src')).toBe('https://example.com/thumb.jpg');
    expect(img?.getAttribute('loading')).toBe('lazy');
  });

  it('does not render image when imageUrl is not provided', () => {
    render(<ArticleItem article={makeArticle({ imageUrl: undefined })} onClick={onClick} />);
    const img = document.querySelector('img');
    expect(img).toBeNull();
  });

  // --- Date formatting ---

  it('shows time format for today articles', () => {
    const today = new Date();
    today.setHours(14, 30, 0, 0);
    render(<ArticleItem article={makeArticle({ publishedAt: today })} onClick={onClick} />);
    // Should show time like "2:30 PM"
    const timeStr = today.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
    expect(screen.getByText(timeStr)).toBeInTheDocument();
  });

  it('shows date format for older articles', () => {
    const oldDate = new Date('2025-06-15T10:00:00Z');
    render(<ArticleItem article={makeArticle({ publishedAt: oldDate })} onClick={onClick} />);
    const dateStr = oldDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    expect(screen.getByText(dateStr)).toBeInTheDocument();
  });

  // --- Offline cached badge ---

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

  // --- Hover/transition classes ---

  it('applies hover transition classes', () => {
    render(<ArticleItem article={makeArticle()} onClick={onClick} />);
    const article = screen.getByRole('article');
    expect(article.className).toContain('transition-all');
    expect(article.className).toContain('cursor-pointer');
  });

  it('applies unread background tint', () => {
    render(<ArticleItem article={makeArticle({ readAt: null })} onClick={onClick} />);
    const article = screen.getByRole('article');
    expect(article.className).toContain('bg-blue-50/30');
  });
});
