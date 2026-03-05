/**
 * IndexedDB storage utilities for offline-first app
 * Handles local persistence of feeds, articles, categories, settings, and sync state
 */

import { logger } from './logger';
import type { Feed, Article, Category, UserSettings, SyncState, Annotation } from '@models/Feed';

const DB_NAME = 'rss-reader';
// v1 → initial schema; v2 → added 'annotations' object store
const DB_VERSION = 2;

export interface StorageObjects {
  feeds: Feed;
  articles: Article;
  categories: Category;
  settings: UserSettings;
  syncState: SyncState;
  annotations: Annotation;
}

export interface StorageQuota {
  usage: number;
  quota: number;
  percentUsed: number;
  available: number;
}

class Storage {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize IndexedDB (idempotent — safe to call multiple times)
   */
  async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        logger.error('IndexedDB initialization failed');
        this.initPromise = null;
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        logger.info('IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create feeds object store
        if (!db.objectStoreNames.contains('feeds')) {
          const feedStore = db.createObjectStore('feeds', { keyPath: 'id' });
          feedStore.createIndex('categoryId', 'categoryId', { unique: false });
          feedStore.createIndex('deletedAt', 'deletedAt', { unique: false });
          feedStore.createIndex('paused', 'paused', { unique: false });
        }

        // Create articles object store
        if (!db.objectStoreNames.contains('articles')) {
          const articleStore = db.createObjectStore('articles', { keyPath: 'id' });
          articleStore.createIndex('feedId', 'feedId', { unique: false });
          articleStore.createIndex('publishedAt', 'publishedAt', { unique: false });
          articleStore.createIndex('readAt', 'readAt', { unique: false });
          articleStore.createIndex('isFavorite', 'isFavorite', { unique: false });
        }

        // Create categories object store
        if (!db.objectStoreNames.contains('categories')) {
          const categoryStore = db.createObjectStore('categories', { keyPath: 'id' });
          categoryStore.createIndex('order', 'order', { unique: false });
        }

        // Create settings object store (singleton)
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }

        // Create syncState object store (singleton)
        if (!db.objectStoreNames.contains('syncState')) {
          db.createObjectStore('syncState', { keyPath: 'id' });
        }

        // Create annotations object store
        if (!db.objectStoreNames.contains('annotations')) {
          const annotationStore = db.createObjectStore('annotations', { keyPath: 'id' });
          annotationStore.createIndex('articleId', 'articleId', { unique: false });
        }

        logger.info('Database upgraded to version ' + DB_VERSION);
      };
    });

    return this.initPromise;
  }

  /**
   * Ensure database is initialized before performing operations
   */
  private async ensureInit(): Promise<void> {
    if (!this.db) {
      await this.init();
    }
  }

  /**
   * Add or update an object
   */
  async put<K extends keyof StorageObjects>(
    storeName: K,
    value: StorageObjects[K],
  ): Promise<IDBValidKey> {
    await this.ensureInit();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(value);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Get a single object by key
   */
  async get<K extends keyof StorageObjects>(
    storeName: K,
    key: IDBValidKey,
  ): Promise<StorageObjects[K] | undefined> {
    await this.ensureInit();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Get all objects from a store
   */
  async getAll<K extends keyof StorageObjects>(
    storeName: K,
  ): Promise<StorageObjects[K][]> {
    await this.ensureInit();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Delete an object
   */
  async delete<K extends keyof StorageObjects>(
    storeName: K,
    key: IDBValidKey,
  ): Promise<void> {
    await this.ensureInit();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Clear all objects from a store
   */
  async clear<K extends keyof StorageObjects>(storeName: K): Promise<void> {
    await this.ensureInit();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Bulk write operations for OPML import
   * More efficient than multiple put() calls
   */
  async bulkPut<K extends keyof StorageObjects>(
    storeName: K,
    values: StorageObjects[K][],
  ): Promise<void> {
    await this.ensureInit();
    if (values.length === 0) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      let completed = 0;
      const errors: Error[] = [];

      values.forEach((value) => {
        const request = store.put(value);
        
        request.onerror = () => {
          errors.push(request.error as Error);
        };
        
        request.onsuccess = () => {
          completed++;
          if (completed === values.length) {
            if (errors.length > 0) {
              logger.warn('Bulk put completed with errors', { 
                total: values.length, 
                errors: errors.length 
              });
            }
            resolve();
          }
        };
      });

      transaction.onerror = () => reject(transaction.error);
    });
  }

  /**
   * Get storage quota information
   */
  async getQuota(): Promise<StorageQuota> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 0;
      const percentUsed = quota > 0 ? (usage / quota) * 100 : 0;
      const available = quota - usage;

      logger.debug('Storage quota', { usage, quota, percentUsed });

      return {
        usage,
        quota,
        percentUsed,
        available,
      };
    }

    // Fallback for browsers without storage.estimate()
    return {
      usage: 0,
      quota: 0,
      percentUsed: 0,
      available: 0,
    };
  }

  /**
   * Check if storage quota is exceeded or near limit
   */
  async isQuotaExceeded(): Promise<boolean> {
    const quota = await this.getQuota();
    return quota.percentUsed > 90; // Consider 90% as near limit
  }

  /**
   * Get database size estimate
   */
  async getDatabaseSize(): Promise<number> {
    const quota = await this.getQuota();
    return quota.usage;
  }
  
  /**
   * Query by index
   */
  async getAllByIndex<K extends keyof StorageObjects>(
    storeName: K,
    indexName: string,
    value: IDBValidKey,
  ): Promise<StorageObjects[K][]> {
    await this.ensureInit();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }
}

export const storage = new Storage();
