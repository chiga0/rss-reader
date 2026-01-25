/**
 * Zustand store for global app state management
 * Aligned with constitutional Principle V (Observability)
 */

import { create } from 'zustand';
import { logger } from '@lib/logger';
import type { Feed, Article, AppSettings, SyncState } from '@models/Feed';

interface AppStore {
  // Feed management
  feeds: Feed[];
  articles: Article[];
  selectedFeedId?: string;
  selectedArticleId?: string;

  // Sync state
  syncState: SyncState;

  // Settings
  settings: AppSettings;

  // Actions
  setFeeds: (feeds: Feed[]) => void;
  addFeed: (feed: Feed) => void;
  removeFeed: (feedId: string) => void;

  setArticles: (articles: Article[]) => void;
  addArticle: (article: Article) => void;
  markArticleAsRead: (articleId: string) => void;
  toggleFavorite: (articleId: string) => void;

  selectFeed: (feedId?: string) => void;
  selectArticle: (articleId?: string) => void;

  setSyncState: (state: SyncState) => void;
  setSettings: (settings: Partial<AppSettings>) => void;
}

export const useAppStore = create<AppStore>((set: any) => ({
  feeds: [],
  articles: [],
  syncState: { isLoading: false },
  settings: {
    theme: 'system',
    refreshInterval: 60,
    maxArticlesPerFeed: 100,
    enableNotifications: true,
    enableOfflineSync: true,
  },

  setFeeds: (feeds) => {
    logger.debug('Setting feeds', { count: feeds.length });
    set({ feeds });
  },

  addFeed: (feed) => {
    logger.info('Adding feed', { feedId: feed.id, title: feed.title });
    set((state: AppStore) => ({ feeds: [...state.feeds, feed] }));
  },

  removeFeed: (feedId) => {
    logger.info('Removing feed', { feedId });
    set((state: AppStore) => ({ feeds: state.feeds.filter((f: Feed) => f.id !== feedId) }));
  },

  setArticles: (articles) => {
    logger.debug('Setting articles', { count: articles.length });
    set({ articles });
  },

  addArticle: (article) => {
    logger.debug('Adding article', { articleId: article.id, feedId: article.feedId });
    set((state: AppStore) => ({ articles: [...state.articles, article] }));
  },

  markArticleAsRead: (articleId) => {
    logger.debug('Marking article as read', { articleId });
    set((state: AppStore) => ({
      articles: state.articles.map((article: Article) =>
        article.id === articleId ? { ...article, isRead: true, readAt: Date.now() } : article,
      ),
    }));
  },

  toggleFavorite: (articleId) => {
    logger.debug('Toggling favorite', { articleId });
    set((state: AppStore) => ({
      articles: state.articles.map((article: Article) =>
        article.id === articleId ? { ...article, isFavorite: !article.isFavorite } : article,
      ),
    }));
  },

  selectFeed: (feedId) => {
    logger.debug('Selecting feed', { feedId: feedId || 'none' });
    set({ selectedFeedId: feedId });
  },

  selectArticle: (articleId) => {
    logger.debug('Selecting article', { articleId: articleId || 'none' });
    set({ selectedArticleId: articleId });
  },

  setSyncState: (syncState) => {
    if (syncState.error) {
      logger.warn('Sync state updated with error', { error: syncState.error });
    } else {
      logger.debug('Sync state updated', { isLoading: syncState.isLoading });
    }
    set({ syncState });
  },

  setSettings: (settings) => {
    logger.info('Settings updated', settings);
    set((state: AppStore) => ({ settings: { ...state.settings, ...settings } }));
  },
}));
