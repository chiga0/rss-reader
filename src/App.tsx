import { useEffect, useState } from 'react';
import { useStore } from '@hooks/useStore';
import { useTheme } from '@hooks/useTheme';
import { FeedList } from '@components/FeedList/FeedList';
import { ArticleList } from '@components/ArticleList/ArticleList';
import { ArticleView } from '@components/ArticleView/ArticleView';
import { logger } from '@lib/logger';
import { storage } from '@lib/storage';

export default function App() {
  const { resolvedTheme } = useTheme();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [dbInitialized, setDbInitialized] = useState(false);
  const { selectedFeedId, selectedArticleId, loadFeeds } = useStore();

  // Initialize storage and load feeds on mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await storage.init();
        setDbInitialized(true);
        await loadFeeds();
      } catch (error) {
        logger.error('Failed to initialize app', error instanceof Error ? error : undefined);
      }
    };
    initializeApp();
  }, [loadFeeds]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      logger.info('Application is online');
    };
    const handleOffline = () => {
      setIsOnline(false);
      logger.info('Application is offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Show loading screen while initializing
  if (!dbInitialized) {
    return (
      <div
        className={`flex h-screen items-center justify-center ${
          resolvedTheme === 'dark' ? 'bg-dark-950 text-white' : 'bg-white text-dark-900'
        }`}
      >
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        resolvedTheme === 'dark' ? 'bg-dark-950 text-white' : 'bg-white text-dark-900'
      }`}
    >
      {/* Status bar */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 p-2 text-center text-sm font-medium ${
          isOnline
            ? 'bg-green-500 text-white'
            : 'bg-yellow-500 text-dark-950'
        }`}
      >
        {isOnline ? '✓ Online' : '⚠ Offline'}
      </div>

      {/* Main content area with margin for status bar */}
      <div className="pt-10">
        <div className="grid grid-cols-1 tablet:grid-cols-12 gap-0 min-h-screen">
          {/* Feed list - left sidebar on tablet+, full width on mobile */}
          <div className={`${selectedFeedId ? 'hidden tablet:block' : ''} tablet:col-span-3 border-r border-gray-200 dark:border-dark-800 h-screen overflow-y-auto`}>
            <FeedList />
          </div>

          {/* Article list - middle panel */}
          {selectedFeedId && (
            <div className={`${selectedArticleId ? 'hidden tablet:block' : ''} tablet:col-span-4 border-r border-gray-200 dark:border-dark-800 h-screen`}>
              <ArticleList />
            </div>
          )}

          {/* Article view - right panel */}
          {selectedArticleId ? (
            <div className="tablet:col-span-5 h-screen">
              <ArticleView />
            </div>
          ) : selectedFeedId ? (
            <div className="hidden tablet:col-span-5 tablet:flex items-center justify-center text-gray-500 dark:text-gray-400 h-screen">
              <p>Select an article to read</p>
            </div>
          ) : (
            <div className="hidden tablet:col-span-9 tablet:flex items-center justify-center text-gray-500 dark:text-gray-400 h-screen">
              <p>Select a feed to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
