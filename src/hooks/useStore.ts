/**
 * Zustand Store
 * Global state management for feeds, articles, and UI
 * Aligned with constitutional Principle V (Observability)
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Feed, Article, Category } from '@models/Feed';
import {
  subscribeFeed as subscribeFeedService,
  getArticlesForFeed,
  markArticleAsRead as markArticleAsReadService,
} from '@services/feedService';
import { storage } from '@lib/storage';
import { logger } from '@lib/logger';

interface StoreState {
  // Data
  feeds: Feed[];
  articles: Article[];
  categories: Category[];
  selectedFeedId: string | null;
  selectedArticleId: string | null;

  // UI State
  isLoading: boolean;
  error: string | null;
  isAddFeedDialogOpen: boolean;

  // Actions - Feeds
  loadFeeds: () => Promise<void>;
  subscribeFeed: (url: string, categoryId?: string) => Promise<{ success: boolean; error?: string }>;
  selectFeed: (feedId: string | null) => Promise<void>;
  unsubscribeFeed: (feedId: string) => Promise<void>;

  // Actions - Articles
  loadArticles: (feedId: string) => Promise<void>;
  selectArticle: (articleId: string | null) => Promise<void>;
  markArticleAsRead: (articleId: string) => Promise<void>;

  // Actions - Categories
  loadCategories: () => Promise<void>;

  // Actions - UI
  setError: (error: string | null) => void;
  openAddFeedDialog: () => void;
  closeAddFeedDialog: () => void;
}

export const useStore = create<StoreState>()(
  devtools(
    (set, get) => ({
      // Initial state
      feeds: [],
      articles: [],
      categories: [],
      selectedFeedId: null,
      selectedArticleId: null,
      isLoading: false,
      error: null,
      isAddFeedDialogOpen: false,

      // Load all feeds from storage
      loadFeeds: async () => {
        try {
          set({ isLoading: true, error: null });
          const feeds = await storage.getAll('feeds');
          const activeFeeds = feeds.filter(f => !f.deletedAt);
          set({ feeds: activeFeeds, isLoading: false });
          logger.info('Loaded feeds', { count: activeFeeds.length });
        } catch (error) {
          logger.error('Failed to load feeds', error instanceof Error ? error : undefined);
          set({ error: 'Failed to load feeds', isLoading: false });
        }
      },

      // Subscribe to a new feed
      subscribeFeed: async (url: string, categoryId?: string) => {
        set({ isLoading: true, error: null });
        const result = await subscribeFeedService(url, categoryId);

        if (result.success && result.feed) {
          const { feeds } = get();
          set({
            feeds: [...feeds, result.feed],
            isLoading: false,
            isAddFeedDialogOpen: false,
          });
          logger.info('Feed subscribed', { feedId: result.feed.id });
          return { success: true };
        } else {
          set({ error: result.error || 'Failed to subscribe', isLoading: false });
          return { success: false, error: result.error };
        }
      },

      // Select a feed and load its articles
      selectFeed: async (feedId: string | null) => {
        set({ selectedFeedId: feedId, selectedArticleId: null });
        if (feedId) {
          await get().loadArticles(feedId);
        } else {
          set({ articles: [] });
        }
      },

      // Unsubscribe from a feed (soft delete)
      unsubscribeFeed: async (feedId: string) => {
        try {
          const feed = await storage.get('feeds', feedId);
          if (feed) {
            feed.deletedAt = new Date();
            await storage.put('feeds', feed);

            const { feeds } = get();
            set({ feeds: feeds.filter(f => f.id !== feedId) });
            logger.info('Feed unsubscribed', { feedId });
          }
        } catch (error) {
          logger.error('Failed to unsubscribe feed', error instanceof Error ? error : undefined, { feedId });
          set({ error: 'Failed to unsubscribe from feed' });
        }
      },

      // Load articles for a specific feed
      loadArticles: async (feedId: string) => {
        try {
          set({ isLoading: true, error: null });
          const articles = await getArticlesForFeed(feedId);
          set({ articles, isLoading: false });
          logger.info('Loaded articles', { feedId, count: articles.length });
        } catch (error) {
          logger.error('Failed to load articles', error instanceof Error ? error : undefined, { feedId });
          set({ error: 'Failed to load articles', isLoading: false });
        }
      },

      // Select an article for reading
      selectArticle: async (articleId: string | null) => {
        set({ selectedArticleId: articleId });

        if (articleId) {
          // Mark as read when selected
          await get().markArticleAsRead(articleId);
        }
      },

      // Mark article as read
      markArticleAsRead: async (articleId: string) => {
        try {
          await markArticleAsReadService(articleId);

          // Update article in state
          const { articles } = get();
          const updatedArticles = articles.map(a =>
            a.id === articleId ? { ...a, readAt: new Date() } : a
          );
          set({ articles: updatedArticles });
        } catch (error) {
          logger.error('Failed to mark article as read', error instanceof Error ? error : undefined, { articleId });
        }
      },

      // Load all categories
      loadCategories: async () => {
        try {
          const categories = await storage.getAll('categories');
          set({ categories });
          logger.info('Loaded categories', { count: categories.length });
        } catch (error) {
          logger.error('Failed to load categories', error instanceof Error ? error : undefined);
        }
      },

      // Set error message
      setError: (error: string | null) => {
        set({ error });
      },

      // Open add feed dialog
      openAddFeedDialog: () => {
        set({ isAddFeedDialogOpen: true, error: null });
      },

      // Close add feed dialog
      closeAddFeedDialog: () => {
        set({ isAddFeedDialogOpen: false, error: null });
      },
    }),
    { name: 'RSS Reader Store' }
  )
);

