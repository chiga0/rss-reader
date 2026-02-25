/**
 * Article Detail Page - Full article view
 * Auto marks article as read on open, supports favorite toggle
 * Renders sanitized HTML content
 */

import { useCallback } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, ExternalLink } from 'lucide-react';
import { useStore } from '@hooks/useStore';
import { sanitizeHTML } from '@utils/sanitize';
import { formatRelativeTime } from '@utils/dateFormat';
import type { Feed, Article } from '@/models';

interface ArticleDetailLoaderData {
  article: Article;
  feed: Feed;
}

export function ArticleDetailPage() {
  const { article, feed } = useLoaderData() as ArticleDetailLoaderData;
  const navigate = useNavigate();
  const { toggleArticleFavorite } = useStore();

  const handleFavoriteToggle = useCallback(async () => {
    await toggleArticleFavorite(article.id);
  }, [toggleArticleFavorite, article.id]);

  const sanitizedContent = article.content
    ? sanitizeHTML(article.content)
    : article.summary || '';

  return (
    <div className="mx-auto max-w-3xl">
      {/* Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={handleFavoriteToggle}
            className={`inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm transition-colors ${
              article.isFavorite
                ? 'border-red-200 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400'
                : 'bg-card text-card-foreground hover:bg-accent'
            }`}
          >
            <Heart className="h-4 w-4" fill={article.isFavorite ? 'currentColor' : 'none'} />
            {article.isFavorite ? 'Favorited' : 'Favorite'}
          </button>
        </div>
      </div>

      {/* Article Header */}
      <header className="mb-8">
        <div className="mb-3 text-xs font-medium text-muted-foreground">
          {feed?.title || 'Unknown Feed'}
        </div>
        <h1 className="mb-4 text-2xl font-bold leading-tight text-foreground sm:text-3xl">
          {article.title}
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          {article.author && <span>By {article.author}</span>}
          <span>{formatRelativeTime(new Date(article.publishedAt))}</span>
          {article.readAt && (
            <span className="inline-flex items-center gap-1 text-xs">
              ✓ Read
            </span>
          )}
        </div>
      </header>

      {/* Featured Image */}
      {article.imageUrl && (
        <figure className="mb-8 overflow-hidden rounded-lg">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full object-cover"
            loading="lazy"
          />
        </figure>
      )}

      {/* Article Content */}
      <div
        className="prose prose-neutral max-w-none dark:prose-invert
          prose-headings:text-foreground prose-headings:font-semibold
          prose-p:text-foreground prose-p:leading-relaxed
          prose-a:text-primary prose-a:no-underline hover:prose-a:underline
          prose-img:rounded-lg prose-img:my-4
          prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground
          prose-code:text-foreground prose-code:bg-secondary prose-code:rounded prose-code:px-1
          prose-pre:bg-secondary prose-pre:text-foreground"
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />

      {/* Original Article Link */}
      {article.link && (
        <footer className="mt-10 border-t border-border pt-6">
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-card-foreground transition-colors hover:bg-accent"
          >
            <ExternalLink className="h-4 w-4" />
            Read original article
          </a>
        </footer>
      )}
    </div>
  );
}
