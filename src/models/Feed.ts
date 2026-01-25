/**
 * Core data models for RSS Reader application
 * Aligned with TypeScript strict mode
 */

export interface Feed {
  id: string;
  url: string;
  title: string;
  description: string;
  imageUrl?: string;
  category?: string;
  lastUpdated: number; // Timestamp
  updateInterval: number; // Minutes
  isActive: boolean;
  errorCount: number;
  createdAt: number;
}

export interface Article {
  id: string;
  feedId: string;
  title: string;
  description: string;
  content?: string;
  author?: string;
  imageUrl?: string;
  url: string;
  publishedAt: number; // Timestamp
  readAt?: number;
  isFavorite: boolean;
  isRead: boolean;
}

export interface Subscription {
  id: string;
  feedId: string;
  category?: string;
  addedAt: number;
  notification: boolean;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  refreshInterval: number; // Minutes
  maxArticlesPerFeed: number;
  enableNotifications: boolean;
  enableOfflineSync: boolean;
  lastSyncTime?: number;
}

export interface SyncState {
  isLoading: boolean;
  error?: string;
  lastSync?: number;
}

export interface FeedState {
  feeds: Feed[];
  articles: Article[];
  selectedFeedId?: string;
  selectedArticleId?: string;
  syncState: SyncState;
}

export type FeedStatus = 'idle' | 'loading' | 'success' | 'error';

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}
