/**
 * Article Detail Page - Full article view
 * Auto marks article as read on open, supports favorite toggle
 * Renders sanitized HTML content
 * Auto-fetches full content from original URL if RSS content is incomplete
 */

import { useCallback, useEffect, useState } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, ExternalLink, RefreshCw } from 'lucide-react';
import { useStore } from '@hooks/useStore';
import { sanitizeHTML } from '@utils/sanitize';
import { formatRelativeTime } from '@utils/dateFormat';
import { fetchAndCacheFullContent } from '@services/articleContentService';
import type { Feed, Article } from '@/models';

interface ArticleDetailLoaderData {
  article: Article;
  feed: Feed;
}

export function ArticleDetailPage() {
  const { article: loaderArticle, feed } = useLoaderData() as ArticleDetailLoaderData;
  const navigate = useNavigate();
  const { toggleArticleFavorite } = useStore();

  const [article, setArticle] = useState<Article>(loaderArticle);
  const [isLoadingFullContent, setIsLoadingFullContent] = useState(false);
  const [fullContentError, setFullContentError] = useState<string | null>(null);

  // Auto-fetch full content from original URL if RSS content appears incomplete
  useEffect(() => {
    let cancelled = false;

    async function loadFullContent() {
      // Skip if no link to fetch from
      if (!loaderArticle.link) return;

      // Get plain text length to check if content is likely just a summary
      const currentContent = loaderArticle.content || loaderArticle.summary || '';
      const textOnly = currentContent.replace(/<[^>]*>/g, '').trim();

      // If content is shorter than a threshold, it's likely just a summary/excerpt
      // Most full articles are at least 500 characters of text
      if (textOnly.length >= 500) return;

      setIsLoadingFullContent(true);
      setFullContentError(null);

      try {
        const updated = await fetchAndCacheFullContent(loaderArticle);
        if (!cancelled) {
          setArticle(updated);
        }
      } catch {
        if (!cancelled) {
          setFullContentError('Failed to load full article content');
        }
      } finally {
        if (!cancelled) {
          setIsLoadingFullContent(false);
        }
      }
    }

    loadFullContent();
    return () => { cancelled = true; };
  }, [loaderArticle]);

  const handleFavoriteToggle = useCallback(async () => {
    await toggleArticleFavorite(article.id);
  }, [toggleArticleFavorite, article.id]);

  // Manual retry: fetch full content from original URL
  const handleLoadFullContent = useCallback(async () => {
    if (!article.link) return;
    setIsLoadingFullContent(true);
    setFullContentError(null);
    try {
      const updated = await fetchAndCacheFullContent(article);
      setArticle(updated);
    } catch {
      setFullContentError('Failed to load full article content');
    } finally {
      setIsLoadingFullContent(false);
    }
  }, [article]);

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

      {/* Loading Full Content Indicator */}
      {isLoadingFullContent && (
        <div className="mb-6 flex items-center gap-2 rounded-md border border-border bg-secondary p-3 text-sm text-secondary-foreground">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading full article content...
        </div>
      )}

      {/* Full Content Error */}
      {fullContentError && (
        <div className="mb-6 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {fullContentError}
        </div>
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

      {/* Original Article Link + Load Full Content */}
      {article.link && (
        <footer className="mt-10 border-t border-border pt-6">
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-card-foreground transition-colors hover:bg-accent"
            >
              <ExternalLink className="h-4 w-4" />
              Read original article
            </a>
            <button
              onClick={handleLoadFullContent}
              disabled={isLoadingFullContent}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-card-foreground transition-colors hover:bg-accent disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingFullContent ? 'animate-spin' : ''}`} />
              Reload full content
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}
