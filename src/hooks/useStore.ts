/**
 * Zustand Store
 * Global state management for feeds, articles, and UI
 * Aligned with constitutional Principle V (Observability)
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Feed, Article, Category, UserSettings, SyncState } from '@models/Feed';
import {
  subscribeFeed as subscribeFeedService,
  getArticlesForFeed,
  markArticleAsRead as markArticleAsReadService,
} from '@services/feedService';
import { syncService } from '@services/syncService';
import { storage } from '@lib/storage';
import { logger } from '@lib/logger';

interface StoreState {
  // Data
  feeds: Feed[];
  articles: Article[];
  categories: Category[];
  selectedFeedId: string | null;
  selectedArticleId: string | null;
  settings: UserSettings | null;
  syncState: SyncState | null;

  // UI State
  isLoading: boolean;
  error: string | null;
  isAddFeedDialogOpen: boolean;

  // Actions - Feeds
  loadFeeds: () => Promise<void>;
  subscribeFeed: (url: string, categoryId?: string) => Promise<{ success: boolean; error?: string }>;
  selectFeed: (feedId: string | null) => Promise<void>;
  unsubscribeFeed: (feedId: string) => Promise<void>;
  refreshAllFeeds: () => Promise<void>;
  updateFeed: (feedId: string, updates: Partial<Feed>) => Promise<void>;
  toggleFeedPause: (feedId: string) => Promise<void>;

  // Actions - Articles
  loadArticles: (feedId: string) => Promise<void>;
  selectArticle: (articleId: string | null) => Promise<void>;
  markArticleAsRead: (articleId: string) => Promise<void>;
  toggleArticleFavorite: (articleId: string) => Promise<void>;
  markAllAsRead: (feedId?: string) => Promise<void>;

  // Actions - Categories
  loadCategories: () => Promise<void>;
  createCategory: (name: string) => Promise<void>;
  updateCategory: (id: string, name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Actions - Settings
  loadSettings: () => Promise<void>;
  updateSettings: (settings: UserSettings) => Promise<void>;

  // Actions - Sync
  loadSyncState: () => Promise<void>;

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
      settings: null,
      syncState: null,
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

      // Refresh all feeds
      refreshAllFeeds: async () => {
        try {
          set({ isLoading: true, error: null });
          await syncService.refreshAllFeeds();
          
          // Reload feeds and articles after refresh
          await get().loadFeeds();
          const { selectedFeedId } = get();
          if (selectedFeedId) {
            await get().loadArticles(selectedFeedId);
          }
          
          set({ isLoading: false });
          logger.info('All feeds refreshed');
        } catch (error) {
          logger.error('Failed to refresh feeds', error instanceof Error ? error : undefined);
          set({ error: 'Failed to refresh feeds', isLoading: false });
        }
      },

      // Update feed
      updateFeed: async (feedId: string, updates: Partial<Feed>) => {
        try {
          const feed = await storage.get('feeds', feedId);
          if (!feed) throw new Error('Feed not found');
          
          Object.assign(feed, updates);
          await storage.put('feeds', feed);
          
          const feeds = get().feeds.map(f => f.id === feedId ? feed : f);
          set({ feeds });
          logger.info('Updated feed', { feedId });
        } catch (error) {
          logger.error('Failed to update feed', error instanceof Error ? error : undefined);
          throw error;
        }
      },

      // Toggle feed pause
      toggleFeedPause: async (feedId: string) => {
        try {
          const feed = await storage.get('feeds', feedId);
          if (!feed) return;
          
          feed.paused = !feed.paused;
          await storage.put('feeds', feed);
          
          const feeds = get().feeds.map(f => f.id === feedId ? feed : f);
          set({ feeds });
          logger.info('Toggled feed pause', { feedId, paused: feed.paused });
        } catch (error) {
          logger.error('Failed to toggle feed pause', error instanceof Error ? error : undefined);
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

      // Toggle article favorite
      toggleArticleFavorite: async (articleId: string) => {
        try {
          const article = await storage.get('articles', articleId);
          if (!article) return;

          article.isFavorite = !article.isFavorite;
          await storage.put('articles', article);

          const articles = get().articles.map((a) => 
            a.id === articleId ? { ...a, isFavorite: article.isFavorite } : a
          );
          set({ articles });
          logger.info('Toggled favorite', { articleId, isFavorite: article.isFavorite });
        } catch (error) {
          logger.error('Failed to toggle favorite', error instanceof Error ? error : undefined);
        }
      },

      // Mark all as read
      markAllAsRead: async (feedId?: string) => {
        try {
          const allArticles = await storage.getAll('articles');
          const articlesToMark = feedId 
            ? allArticles.filter(a => a.feedId === feedId && !a.readAt)
            : allArticles.filter(a => !a.readAt);

          for (const article of articlesToMark) {
            article.readAt = new Date();
            await storage.put('articles', article);
          }

          const articles = get().articles.map(a => 
            articlesToMark.some(m => m.id === a.id) ? { ...a, readAt: new Date() } : a
          );
          set({ articles });
          logger.info('Marked all as read', { count: articlesToMark.length });
        } catch (error) {
          logger.error('Failed to mark all as read', error instanceof Error ? error : undefined);
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

      // Create new category
      createCategory: async (name: string) => {
        try {
          const categories = get().categories;
          const newCategory: Category = {
            id: crypto.randomUUID(),
            name,
            order: categories.length,
            createdAt: new Date(),
          };
          await storage.put('categories', newCategory);
          set({ categories: [...categories, newCategory] });
          logger.info('Created category', { name });
        } catch (error) {
          logger.error('Failed to create category', error instanceof Error ? error : undefined);
          throw error;
        }
      },

      // Update category
      updateCategory: async (id: string, name: string) => {
        try {
          const category = await storage.get('categories', id);
          if (!category) throw new Error('Category not found');
          
          category.name = name;
          await storage.put('categories', category);
          
          const categories = get().categories.map(c => c.id === id ? category : c);
          set({ categories });
          logger.info('Updated category', { id, name });
        } catch (error) {
          logger.error('Failed to update category', error instanceof Error ? error : undefined);
          throw error;
        }
      },

      // Delete category
      deleteCategory: async (id: string) => {
        try {
          // Unassign feeds from this category
          const feeds = get().feeds;
          for (const feed of feeds.filter(f => f.categoryId === id)) {
            feed.categoryId = undefined;
            await storage.put('feeds', feed);
          }
          
          await storage.delete('categories', id);
          const categories = get().categories.filter(c => c.id !== id);
          set({ categories, feeds: feeds.map(f => f.categoryId === id ? {...f, categoryId: undefined} : f) });
          logger.info('Deleted category', { id });
        } catch (error) {
          logger.error('Failed to delete category', error instanceof Error ? error : undefined);
          throw error;
        }
      },

      // Load user settings
      loadSettings: async () => {
        try {
          const settings = await storage.get('settings', 'default');
          set({ settings });
          logger.info('Loaded settings');
        } catch (error) {
          logger.error('Failed to load settings', error instanceof Error ? error : undefined);
        }
      },

      // Update user settings
      updateSettings: async (newSettings: UserSettings) => {
        try {
          await storage.put('settings', newSettings);
          set({ settings: newSettings });
          
          // Restart auto-refresh with new interval
          if (newSettings.enableBackgroundSync && newSettings.defaultRefreshIntervalMinutes > 0) {
            await syncService.startAutoRefresh(newSettings.defaultRefreshIntervalMinutes);
          } else {
            syncService.stopAutoRefresh();
          }
          
          logger.info('Settings updated', { settings: newSettings });
        } catch (error) {
          logger.error('Failed to update settings', error instanceof Error ? error : undefined);
          set({ error: 'Failed to save settings' });
        }
      },

      // Load sync state
      loadSyncState: async () => {
        try {
          const syncState = await storage.get('syncState', 'default');
          set({ syncState });
          logger.info('Loaded sync state');
        } catch (error) {
          logger.error('Failed to load sync state', error instanceof Error ? error : undefined);
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

