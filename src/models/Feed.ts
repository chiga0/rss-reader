/**
 * Core data models for RSS Reader application
 * Aligned with data-model.md specification
 */

export interface Feed {
  id: string;
  url: string;
  title: string;
  description: string;
  link?: string;
  iconUrl?: string;
  imageUrl?: string; // Alias for iconUrl
  categoryId?: string;
  lastFetchedAt: Date | null;
  refreshIntervalMinutes: number;
  paused: boolean;
  errorCount: number;
  createdAt: Date;
  deletedAt: Date | null;
}

export interface Article {
  id: string;
  feedId: string;
  title: string;
  summary: string;
  content?: string;
  author?: string;
  imageUrl?: string;
  link: string;
  publishedAt: Date;
  readAt: Date | null;
  isFavorite: boolean;
  createdAt: Date;
  deletedAt: Date | null;
}

export interface Category {
  id: string;
  name: string;
  order: number;
  createdAt: Date;
}

export interface UserSettings {
  id: string; // Singleton: always 'default'
  theme: 'light' | 'dark' | 'system';
  defaultRefreshIntervalMinutes: number;
  maxArticlesPerFeed: number;
  enableNotifications: boolean;
  enableBackgroundSync: boolean;
}

export interface SyncState {
  id: string; // Singleton: always 'default'
  isSyncing: boolean;
  lastSyncAt: Date | null;
  queuedOperations: QueuedOperation[];
}

export interface QueuedOperation {
  type: 'ADD_FEED' | 'DELETE_FEED' | 'UPDATE_FEED' | 'REFRESH_FEED';
  data: any;
  timestamp: Date;
}

export interface FeedState {
  feeds: Feed[];
  articles: Article[];
  categories: Category[];
  settings: UserSettings | null;
  syncState: SyncState | null;
  selectedFeedId?: string;
  selectedArticleId?: string;
}

export type FeedStatus = 'idle' | 'loading' | 'success' | 'error';

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}
