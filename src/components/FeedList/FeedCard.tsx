/**
 * FeedCard Component
 * Individual feed card with title, description, and article count
 */

import { Feed } from '../../models/Feed';
import { formatRelativeTime } from '../../utils/dateFormat';

interface FeedCardProps {
  feed: Feed;
  articleCount: number;
  onClick: () => void;
}

export function FeedCard({ feed, articleCount, onClick }: FeedCardProps) {
  return (
    <article
      className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-primary hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-primary"
      onClick={onClick}
    >
      {/* Feed Header */}
      <div className="mb-3 flex items-start gap-3">
        {feed.imageUrl && (
          <img
            src={feed.imageUrl}
            alt={`${feed.title} logo`}
            className="h-12 w-12 shrink-0 rounded-lg object-cover"
            loading="lazy"
          />
        )}
        <div className="min-w-0 flex-1">
          <h3 className="mb-1 truncate text-lg font-semibold text-gray-900 group-hover:text-primary dark:text-gray-100 dark:group-hover:text-primary">
            {feed.title}
          </h3>
          {feed.description && (
            <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
              {feed.description}
            </p>
          )}
        </div>
      </div>

      {/* Feed Stats */}
      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
        <span className="flex items-center gap-1">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          {articleCount} {articleCount === 1 ? 'article' : 'articles'}
        </span>
        {feed.lastFetchedAt && (
          <span className="flex items-center gap-1" title={`Last refreshed: ${new Date(feed.lastFetchedAt).toLocaleString()}`}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatRelativeTime(new Date(feed.lastFetchedAt))}
          </span>
        )}
      </div>
    </article>
  );
}
