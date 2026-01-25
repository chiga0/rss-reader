import { useEffect, useState } from 'react';
import { useStore } from '@hooks/useStore';
import { useTheme } from '@hooks/useTheme';
import { useOfflineDetection } from '@hooks/useOfflineDetection';
import { FeedList } from '@components/FeedList/FeedList';
import { ArticleList } from '@components/ArticleList/ArticleList';
import { ArticleView } from '@components/ArticleView/ArticleView';
import { OfflineIndicator } from '@components/Common/OfflineIndicator';
import Settings from '@pages/Settings';
import { logger } from '@lib/logger';
import { storage } from '@lib/storage';
import { syncService } from '@services/syncService';

export default function App() {
  const { resolvedTheme } = useTheme();
  const { isOnline } = useOfflineDetection();
  const [dbInitialized, setDbInitialized] = useState(false);
  const [currentPage, setCurrentPage] = useState<'reader' | 'settings'>('reader');
  const { selectedFeedId, selectedArticleId, loadFeeds } = useStore();

  // Initialize storage and load feeds on mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await storage.init();
        setDbInitialized(true);
        await loadFeeds();

        // Load settings and start auto-refresh
        const settings = await storage.get('settings', 'default');
        if (settings && settings.enableBackgroundSync && settings.defaultRefreshIntervalMinutes > 0) {
          await syncService.startAutoRefresh(settings.defaultRefreshIntervalMinutes);
          logger.info('Auto-refresh started', { interval: settings.defaultRefreshIntervalMinutes });
        }
      } catch (error) {
        logger.error('Failed to initialize app', error instanceof Error ? error : undefined);
      }
    };
    initializeApp();
  }, [loadFeeds]);

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
      {/* Offline Indicator */}
      <OfflineIndicator />

      {/* Status bar with navigation */}
      <div
        className={`fixed top-0 left-0 right-0 z-40 transition-colors ${
          isOnline
            ? 'bg-green-500 text-white'
            : 'bg-yellow-500 text-dark-950'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-2">
          <div className="text-sm font-medium">
            {isOnline ? '✓ Online' : '⚠ Offline'}
          </div>
          <nav className="flex gap-4">
            <button
              onClick={() => setCurrentPage('reader')}
              className={`text-sm font-medium px-3 py-1 rounded ${
                currentPage === 'reader' 
                  ? 'bg-white/20' 
                  : 'hover:bg-white/10'
              }`}
            >
              阅读器
            </button>
            <button
              onClick={() => setCurrentPage('settings')}
              className={`text-sm font-medium px-3 py-1 rounded ${
                currentPage === 'settings' 
                  ? 'bg-white/20' 
                  : 'hover:bg-white/10'
              }`}
            >
              设置
            </button>
          </nav>
        </div>
      </div>

      {/* Main content area with margin for status bar */}
      <div className="pt-14">
        {currentPage === 'settings' ? (
          <Settings />
        ) : (
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
        )}
      </div>
    </div>
  );
}
