/**
 * Unit tests for ReadingProgressBar component
 * Tests rendering, ARIA attributes, visibility, and progress display
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReadingProgressBar } from '@components/ArticleView/ReadingProgressBar';

// Mock the useReadingProgress hook
vi.mock('@hooks/useReadingProgress', () => ({
  useReadingProgress: vi.fn(),
}));

import { useReadingProgress } from '@hooks/useReadingProgress';

const mockUseReadingProgress = vi.mocked(useReadingProgress);

describe('ReadingProgressBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders null when article fits in viewport (isFullyVisible=true)', () => {
    mockUseReadingProgress.mockReturnValue({ progress: 1, isFullyVisible: true });
    const { container } = render(<ReadingProgressBar />);
    expect(container.innerHTML).toBe('');
  });

  it('renders progress bar when content is scrollable', () => {
    mockUseReadingProgress.mockReturnValue({ progress: 0, isFullyVisible: false });
    render(<ReadingProgressBar />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toBeInTheDocument();
  });

  it('has correct ARIA attributes at 0% progress', () => {
    mockUseReadingProgress.mockReturnValue({ progress: 0, isFullyVisible: false });
    render(<ReadingProgressBar />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '0');
    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '100');
    expect(progressbar).toHaveAttribute('aria-label', 'Reading progress');
  });

  it('has correct ARIA attributes at 50% progress', () => {
    mockUseReadingProgress.mockReturnValue({ progress: 0.5, isFullyVisible: false });
    render(<ReadingProgressBar />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '50');
  });

  it('has correct ARIA attributes at 100% progress', () => {
    mockUseReadingProgress.mockReturnValue({ progress: 1, isFullyVisible: false });
    render(<ReadingProgressBar />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '100');
  });

  it('applies scaleX transform based on progress value', () => {
    mockUseReadingProgress.mockReturnValue({ progress: 0.75, isFullyVisible: false });
    render(<ReadingProgressBar />);
    const progressbar = screen.getByRole('progressbar');
    const innerBar = progressbar.firstChild as HTMLElement;
    expect(innerBar.style.transform).toBe('scaleX(0.75)');
    expect(innerBar.style.transformOrigin).toBe('left');
  });

  it('has fixed positioning with z-50 class', () => {
    mockUseReadingProgress.mockReturnValue({ progress: 0.5, isFullyVisible: false });
    render(<ReadingProgressBar />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar.className).toContain('fixed');
    expect(progressbar.className).toContain('z-50');
  });

  it('has 3px height', () => {
    mockUseReadingProgress.mockReturnValue({ progress: 0.5, isFullyVisible: false });
    render(<ReadingProgressBar />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar.className).toContain('h-[3px]');
  });

  it('rounds ARIA progress to nearest integer', () => {
    mockUseReadingProgress.mockReturnValue({ progress: 0.333, isFullyVisible: false });
    render(<ReadingProgressBar />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '33');
  });
});
