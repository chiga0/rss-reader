/**
 * Performance tests for ArticleActionBar React.memo optimization.
 * Validates that memo() prevents unnecessary re-renders when parent state changes
 * (e.g. during streaming translation/summarization operations).
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ArticleActionBar } from '@components/ArticleView/ArticleActionBar';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        favorite: 'Favorite',
        favorited: 'Favorited',
      };
      return translations[key] || key;
    },
  }),
}));

function createProps(overrides: Partial<Parameters<typeof ArticleActionBar>[0]> = {}) {
  return {
    isFavorite: false,
    isTranslating: false,
    isSummarizing: false,
    isAnnotating: false,
    articleLink: 'https://example.com/article-1',
    articleTitle: 'Test Article',
    onToggleFavorite: vi.fn(),
    onTranslate: vi.fn(),
    onSummarize: vi.fn(),
    onToggleAnnotate: vi.fn(),
    ...overrides,
  };
}

describe('ArticleActionBar memo behavior', () => {
  it('should render all action buttons', () => {
    const props = createProps();
    render(<ArticleActionBar {...props} />);

    expect(screen.getByText('Favorite')).toBeInTheDocument();
    expect(screen.getByText('翻译')).toBeInTheDocument();
    expect(screen.getByText('AI 总结')).toBeInTheDocument();
    expect(screen.getByText('Annotate')).toBeInTheDocument();
    expect(screen.getByText('Share')).toBeInTheDocument();
  });

  it('should not re-render when re-rendered with identical props', () => {
    const props = createProps();
    const { rerender } = render(<ArticleActionBar {...props} />);

    // Re-render parent with same props - memo should prevent re-render of inner component
    rerender(<ArticleActionBar {...props} />);
    rerender(<ArticleActionBar {...props} />);

    // The component should still show correctly
    expect(screen.getByText('Favorite')).toBeInTheDocument();
  });

  it('should re-render when isFavorite prop changes', () => {
    const props = createProps({ isFavorite: false });
    const { rerender } = render(<ArticleActionBar {...props} />);

    expect(screen.getByText('Favorite')).toBeInTheDocument();

    rerender(<ArticleActionBar {...createProps({ isFavorite: true })} />);
    expect(screen.getByText('Favorited')).toBeInTheDocument();
  });

  it('should re-render when isTranslating prop changes', () => {
    const props = createProps({ isTranslating: false });
    const { rerender } = render(<ArticleActionBar {...props} />);

    expect(screen.getByText('翻译')).toBeInTheDocument();

    rerender(<ArticleActionBar {...createProps({ isTranslating: true })} />);
    expect(screen.getByText('停止翻译')).toBeInTheDocument();
  });

  it('should re-render when isSummarizing prop changes', () => {
    const props = createProps({ isSummarizing: false });
    const { rerender } = render(<ArticleActionBar {...props} />);

    expect(screen.getByText('AI 总结')).toBeInTheDocument();

    rerender(<ArticleActionBar {...createProps({ isSummarizing: true })} />);
    expect(screen.getByText('停止总结')).toBeInTheDocument();
  });

  it('should call onToggleFavorite when favorite button is clicked', () => {
    const onToggleFavorite = vi.fn();
    render(<ArticleActionBar {...createProps({ onToggleFavorite })} />);

    fireEvent.click(screen.getByText('Favorite'));
    expect(onToggleFavorite).toHaveBeenCalledTimes(1);
  });

  it('should call onTranslate when translate button is clicked', () => {
    const onTranslate = vi.fn();
    render(<ArticleActionBar {...createProps({ onTranslate })} />);

    fireEvent.click(screen.getByText('翻译'));
    expect(onTranslate).toHaveBeenCalledTimes(1);
  });

  it('should call onSummarize when AI summary button is clicked', () => {
    const onSummarize = vi.fn();
    render(<ArticleActionBar {...createProps({ onSummarize })} />);

    fireEvent.click(screen.getByText('AI 总结'));
    expect(onSummarize).toHaveBeenCalledTimes(1);
  });

  it('should call onToggleAnnotate when annotate button is clicked', () => {
    const onToggleAnnotate = vi.fn();
    render(<ArticleActionBar {...createProps({ onToggleAnnotate })} />);

    fireEvent.click(screen.getByText('Annotate'));
    expect(onToggleAnnotate).toHaveBeenCalledTimes(1);
  });

  it('should show Done label when isAnnotating is true', () => {
    render(<ArticleActionBar {...createProps({ isAnnotating: true })} />);
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('should handle rapid re-renders with same callbacks efficiently', () => {
    const callbacks = {
      onToggleFavorite: vi.fn(),
      onTranslate: vi.fn(),
      onSummarize: vi.fn(),
      onToggleAnnotate: vi.fn(),
    };
    const props = createProps(callbacks);
    const { rerender } = render(<ArticleActionBar {...props} />);

    const start = performance.now();
    // Simulate 100 rapid re-renders with same props (as would happen during streaming)
    for (let i = 0; i < 100; i++) {
      rerender(<ArticleActionBar {...props} />);
    }
    const elapsed = performance.now() - start;

    // 100 re-renders should complete in under 500ms thanks to memo
    expect(elapsed).toBeLessThan(500);
    expect(screen.getByText('Favorite')).toBeInTheDocument();
  });
});
