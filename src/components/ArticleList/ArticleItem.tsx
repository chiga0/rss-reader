/**
 * ArticleItem Component
 * Individual article list item with title, summary, date, and read status
 */

import { Article } from '../../models/Feed';

interface ArticleItemProps {
  article: Article;
  onClick: () => void;
}

export function ArticleItem({ article, onClick }: ArticleItemProps) {
  const isUnread = !article.readAt;
  const publishDate = new Date(article.publishedAt);
  const isToday = publishDate.toDateString() === new Date().toDateString();
  const dateStr = isToday
    ? publishDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : publishDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <article
      className={`group cursor-pointer border-b border-gray-200 px-4 py-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50 ${
        isUnread ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        {/* Unread Indicator */}
        {isUnread && (
          <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />
        )}

        {/* Article Content */}
        <div className="min-w-0 flex-1">
          <h3
            className={`mb-1 line-clamp-2 text-base font-semibold group-hover:text-primary ${
              isUnread
                ? 'text-gray-900 dark:text-gray-100'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            {article.title}
          </h3>

          {article.summary && (
            <p className="mb-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
              {article.summary}
            </p>
          )}

          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
            {article.author && <span className="truncate">{article.author}</span>}
            <span>{dateStr}</span>
          </div>
        </div>

        {/* Article Image */}
        {article.imageUrl && (
          <img
            src={article.imageUrl}
            alt=""
            className="h-20 w-20 shrink-0 rounded-lg object-cover"
            loading="lazy"
          />
        )}
      </div>
    </article>
  );
}
