/**
 * FeedList Component
 * Grid layout displaying all RSS feeds
 */

import { useStore } from '../../hooks/useStore';
import { FeedCard } from './FeedCard';
import { LoadingSpinner } from '../Common/LoadingSpinner';
import { ErrorMessage } from '../Common/ErrorMessage';
import { AddFeedDialog } from '../AddFeedDialog/AddFeedDialog';

export function FeedList() {
  const {
    feeds,
    articles,
    isLoading,
    error,
    isAddFeedDialogOpen,
    selectFeed,
    setError,
    openAddFeedDialog,
    closeAddFeedDialog,
  } = useStore();

  // Get article count for each feed
  const getArticleCount = (feedId: string) => {
    return articles.filter((a) => a.feedId === feedId && !a.deletedAt).length;
  };

  // Handle feed click
  const handleFeedClick = (feedId: string) => {
    selectFeed(feedId);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          My Feeds
        </h1>
        <button
          onClick={openAddFeedDialog}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-white hover:bg-primary/90 transition-colors"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Feed
        </button>
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
