/**
 * Unit tests for FeedsPage component
 * Tests: floating FAB, category grouping, bottom filter banner
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FeedsPage } from '@pages/FeedsPage';
import { useStore } from '@hooks/useStore';
import type { Feed, Category } from '@models/Feed';

// Mock storage and syncService
vi.mock('@lib/storage', () => ({
  storage: {
    init: vi.fn().mockResolvedValue(undefined),
    getAll: vi.fn().mockResolvedValue([]),
    getAllByIndex: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('@services/syncService', () => ({
  syncService: {
    refreshAllFeeds: vi.fn().mockResolvedValue(undefined),
  },
}));

const makeFeed = (overrides: Partial<Feed> = {}): Feed => ({
  id: crypto.randomUUID(),
  url: 'https://example.com/feed.xml',
  title: 'Test Feed',
  description: 'A test feed',
  iconUrl: undefined,
  imageUrl: undefined,
  categoryId: undefined,
  lastFetchedAt: null,
  refreshIntervalMinutes: 60,
  paused: false,
  errorCount: 0,
  createdAt: new Date(),
  deletedAt: null,
  ...overrides,
});

const makeCategory = (overrides: Partial<Category> = {}): Category => ({
  id: crypto.randomUUID(),
  name: 'Test Category',
  order: 0,
  createdAt: new Date(),
  ...overrides,
});

function renderFeedsPage() {
  return render(
    <MemoryRouter>
      <FeedsPage />
    </MemoryRouter>
  );
}

describe('FeedsPage', () => {
  beforeEach(() => {
    useStore.setState({
      feeds: [],
      categories: [],
      isLoading: false,
      error: null,
      isAddFeedDialogOpen: false,
      feedsFilter: 'unread',
    });
  });

  describe('Floating Add Feed Button (FAB)', () => {
    it('should render the floating add feed button', () => {
      useStore.setState({ feeds: [makeFeed()] });
      renderFeedsPage();
      const fab = screen.getByRole('button', { name: 'Add Feed' });
      expect(fab).toBeInTheDocument();
    });

    it('should open add feed dialog when FAB is clicked', () => {
      useStore.setState({ feeds: [makeFeed()] });
      renderFeedsPage();
      const fab = screen.getByRole('button', { name: 'Add Feed' });
      fireEvent.click(fab);
      expect(useStore.getState().isAddFeedDialogOpen).toBe(true);
    });
  });

  describe('Category Grouping', () => {
    it('should show feeds grouped by category', () => {
      const catId = 'cat-1';
      const category = makeCategory({ id: catId, name: 'Tech' });
      const feed1 = makeFeed({ title: 'Feed A', categoryId: catId });
      const feed2 = makeFeed({ title: 'Feed B' });

      useStore.setState({
        feeds: [feed1, feed2],
        categories: [category],
        feedsFilter: 'all',
      });

      renderFeedsPage();
      expect(screen.getByText('Tech')).toBeInTheDocument();
      expect(screen.getByText('Uncategorized')).toBeInTheDocument();
      expect(screen.getByText('Feed A')).toBeInTheDocument();
      expect(screen.getByText('Feed B')).toBeInTheDocument();
    });

    it('should show uncategorized group for feeds without category', () => {
      const feed = makeFeed({ title: 'No Cat Feed' });
      useStore.setState({
        feeds: [feed],
        categories: [],
        feedsFilter: 'all',
      });
      renderFeedsPage();
      expect(screen.getByText('Uncategorized')).toBeInTheDocument();
    });
  });

  describe('Bottom Filter Banner', () => {
    it('should render three filter tabs: 收藏, 未读, 全部', () => {
      useStore.setState({ feeds: [makeFeed()] });
      renderFeedsPage();
      expect(screen.getByRole('button', { name: '收藏' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '未读' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '全部' })).toBeInTheDocument();
    });

    it('should default to 未读 filter', () => {
      useStore.setState({ feeds: [makeFeed()] });
      renderFeedsPage();
      const unreadBtn = screen.getByRole('button', { name: '未读' });
      expect(unreadBtn).toHaveAttribute('aria-pressed', 'true');
    });

    it('should switch filter when tab is clicked', () => {
      useStore.setState({ feeds: [makeFeed()] });
      renderFeedsPage();
      const allBtn = screen.getByRole('button', { name: '全部' });
      fireEvent.click(allBtn);
      expect(useStore.getState().feedsFilter).toBe('all');
    });

    it('should switch to starred filter when 收藏 tab is clicked', () => {
      useStore.setState({ feeds: [makeFeed()] });
      renderFeedsPage();
      const starredBtn = screen.getByRole('button', { name: '收藏' });
      fireEvent.click(starredBtn);
      expect(useStore.getState().feedsFilter).toBe('starred');
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no feeds exist', () => {
      useStore.setState({ feeds: [], isLoading: false });
      renderFeedsPage();
      expect(screen.getByText('No feeds yet')).toBeInTheDocument();
    });
  });
});
