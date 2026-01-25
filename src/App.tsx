import { useEffect, useState } from 'react';
import { useAppStore } from '@hooks/useStore';
import { useTheme } from '@hooks/useTheme';
import FeedList from '@pages/FeedList';
import ArticleDetail from '@pages/ArticleDetail';
import { logger } from '@lib/logger';

export default function App() {
  const { resolvedTheme } = useTheme();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const selectedFeedId = useAppStore((state: any) => state.selectedFeedId);

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
        <div className="grid grid-cols-1 tablet:grid-cols-3 gap-0 min-h-screen">
          {/* Feed list - left sidebar on tablet+, full width on mobile */}
          <div className="tablet:col-span-1 border-r border-gray-200 dark:border-dark-800">
            <FeedList />
          </div>

          {/* Article detail - full width on mobile when selected, 2 cols on tablet+ */}
          {selectedFeedId ? (
            <div className="tablet:col-span-2">
              <ArticleDetail />
            </div>
          ) : (
            <div className="hidden tablet:col-span-2 tablet:flex items-center justify-center text-gray-500 dark:text-gray-400">
              <p>Select a feed or article to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
