/**
 * ArticleView Component
 * Full article reader with sanitized HTML content
 */

import { useStore } from '../../hooks/useStore';
import { LoadingSpinner } from '../Common/LoadingSpinner';
import { ErrorMessage } from '../Common/ErrorMessage';

export function ArticleView() {
  const { articles, selectedArticleId, isLoading, error, setError } = useStore();

  // Get selected article
  const article = articles.find((a) => a.id === selectedArticleId);

  if (isLoading) {
    return <LoadingSpinner message="Loading article..." />;
  }

  if (!selectedArticleId) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
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
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
        <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
          No article selected
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Select an article to read
        </p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="p-8">
        <ErrorMessage
          message="Article not found"
          onDismiss={() => setError(null)}
        />
      </div>
    );
  }

  return (
    <article className="mx-auto h-full max-w-3xl overflow-y-auto px-6 py-8">
      {/* Error Message */}
      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      {/* Article Header */}
      <header className="mb-8">
        <h1 className="mb-4 text-3xl font-bold leading-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
          {article.title}
        </h1>

        {/* Article Meta */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
          {article.author && (
            <span className="font-medium">By {article.author}</span>
          )}
          <span>•</span>
          <time dateTime={new Date(article.publishedAt).toISOString()}>
            {new Date(article.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
          {article.readAt && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path
                    fillRule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Read
              </span>
            </>
          )}
        </div>
      </header>

      {/* Article Image */}
      {article.imageUrl && (
        <figure className="mb-8">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full rounded-lg object-cover"
            loading="lazy"
          />
        </figure>
      )}

      {/* Article Content */}
      <div
        className="prose prose-gray max-w-none dark:prose-invert prose-headings:font-semibold prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg"
        dangerouslySetInnerHTML={{ __html: article.content || '' }}
      />

      {/* Article Link */}
      {article.link && (
        <footer className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            Read original article
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </footer>
      )}
    </article>
  );
}
