/**
 * FeedList Component
 * Grid layout displaying all RSS feeds
 */

import { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { FeedCard } from './FeedCard';
import { LoadingSpinner } from '../Common/LoadingSpinner';
import { ErrorMessage } from '../Common/ErrorMessage';
import { AddFeedDialog } from '../AddFeedDialog/AddFeedDialog';

export function FeedList() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const {
    feeds,
    articles,
    isLoading,
    error,
    isAddFeedDialogOpen,
    syncState,
    selectFeed,
    setError,
    openAddFeedDialog,
    closeAddFeedDialog,
    refreshAllFeeds,
    loadSyncState,
  } = useStore();

  // Get article count for each feed
  const getArticleCount = (feedId: string) => {
    return articles.filter((a) => a.feedId === feedId && !a.deletedAt).length;
  };

  // Handle feed click
  const handleFeedClick = (feedId: string) => {
    selectFeed(feedId);
  };

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshAllFeeds();
      await loadSyncState(); // Reload sync state after refresh
    } catch (error) {
      setError('刷新失败,请重试');
    } finally {
      setIsRefreshing(false);
    }
  };

  const isSyncing = syncState?.isSyncing || isRefreshing;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between gap-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          My Feeds
        </h1>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={isSyncing}
            className="flex items-center gap-2 rounded-lg bg-gray-200 dark:bg-gray-700 px-3 py-2 font-medium text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="刷新所有订阅源"
          >
            <svg 
              className={`h-5 w-5 ${isSyncing ? 'animate-spin' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden sm:inline">
              {isSyncing ? '刷新中...' : '刷新'}
            </span>
          </button>
          <button
            onClick={openAddFeedDialog}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-white hover:bg-primary/90 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Add Feed</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      {/* Loading State */}
      {isLoading && <LoadingSpinner message="Loading feeds..." />}

      {/* Empty State */}
      {!isLoading && feeds.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <svg
            className="mb-4 h-16 w-16 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z"
            />
          </svg>
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
            No feeds yet
          </h2>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            Get started by adding your first RSS feed
          </p>
          <button
            onClick={openAddFeedDialog}
            className="rounded-lg bg-primary px-6 py-3 font-medium text-white hover:bg-primary/90 transition-colors"
          >
            Add Your First Feed
          </button>
        </div>
      )}

      {/* Feed Grid */}
      {!isLoading && feeds.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {feeds.map((feed) => (
            <FeedCard
              key={feed.id}
              feed={feed}
              articleCount={getArticleCount(feed.id)}
              onClick={() => handleFeedClick(feed.id)}
            />
          ))}
        </div>
      )}

      {/* Add Feed Dialog */}
      <AddFeedDialog
        isOpen={isAddFeedDialogOpen}
        onClose={closeAddFeedDialog}
      />
    </div>
  );
}
