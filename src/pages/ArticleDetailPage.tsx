/**
 * Article Detail Page - Full article view
 * Auto marks article as read on open, supports favorite toggle
 * Renders sanitized HTML content with inline translation and AI summary support
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, ExternalLink, RefreshCw } from 'lucide-react';
import { useStore } from '@hooks/useStore';
import { sanitizeHTML } from '@utils/sanitize';
import { formatRelativeTime } from '@utils/dateFormat';
import { fetchAndCacheFullContent } from '@services/articleContentService';
import { translateText, summarizeText } from '@services/aiService';
import { ArticleActionBar } from '@components/ArticleView/ArticleActionBar';
import { storage } from '@lib/storage';
import type { Feed, Article, UserSettings } from '@/models';

interface ArticleDetailLoaderData {
  article: Article;
  feed: Feed;
}

/** Parse HTML content into top-level block segments for paragraph-by-paragraph translation. */
function parseContentSegments(html: string): { html: string; text: string }[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
  const container = doc.body.firstElementChild;
  if (!container) return [{ html, text: '' }];

  const segments: { html: string; text: string }[] = [];
  for (const child of Array.from(container.childNodes)) {
    if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as Element;
      segments.push({ html: el.outerHTML, text: el.textContent?.trim() || '' });
    } else if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
      segments.push({
        html: `<p>${child.textContent}</p>`,
        text: child.textContent.trim(),
      });
    }
  }
  return segments;
}

export function ArticleDetailPage() {
  const { article: loaderArticle, feed } = useLoaderData() as ArticleDetailLoaderData;
  const navigate = useNavigate();
  const { toggleArticleFavorite } = useStore();
  const [article, setArticle] = useState<Article>(loaderArticle);
  const [isLoadingFullContent, setIsLoadingFullContent] = useState(false);
  const [fullContentError, setFullContentError] = useState<string | null>(null);

  const [isFavorite, setIsFavorite] = useState(article.isFavorite);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [translations, setTranslations] = useState<Record<number, string>>({});
  const [translatingIndex, setTranslatingIndex] = useState<number>(-1);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto-fetch full content from original URL if RSS content appears incomplete
  useEffect(() => {
    let cancelled = false;

    async function loadFullContent() {
      if (!loaderArticle.link) return;

      const currentContent = loaderArticle.content || loaderArticle.summary || '';
      const textOnly = currentContent.replace(/<[^>]*>/g, '').trim();

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
        if (!cancelled) setIsLoadingFullContent(false);
      }
    }

    loadFullContent();
    return () => { cancelled = true; };
  }, [loaderArticle]);

  useEffect(() => {
    storage.get('settings', 'default').then((s) => {
      if (s) setSettings(s);
    });
  }, []);
  // settings are loaded above

  const handleFavoriteToggle = useCallback(async () => {
    await toggleArticleFavorite(article.id);
    setIsFavorite((prev) => !prev);
    setArticle((prev) => ({ ...prev, isFavorite: !prev.isFavorite }));
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

  const segments = useMemo(() => parseContentSegments(sanitizedContent), [sanitizedContent]);

  const plainText = useMemo(
    () => segments.map((s) => s.text).filter(Boolean).join('\n\n'),
    [segments],
  );

  const handleTranslate = useCallback(async () => {
    if (isTranslating) return;

    // If already translated, toggle off
    if (Object.keys(translations).length > 0) {
      setTranslations({});
      return;
    }

    setIsTranslating(true);
    setError(null);

    try {
      for (let i = 0; i < segments.length; i++) {
        const text = segments[i].text;
        if (!text || text.length < 2) continue;
        setTranslatingIndex(i);
        // Stream translation chunk-by-chunk for real-time feedback
        await translateText(text, settings!, '中文', (chunk) => {
          setTranslations((prev) => ({ ...prev, [i]: (prev[i] || '') + chunk }));
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '翻译失败');
    } finally {
      setIsTranslating(false);
      setTranslatingIndex(-1);
    }
  }, [settings, isTranslating, translations, segments]);

  const handleSummarize = useCallback(async () => {
    if (isSummarizing) return;

    // If already summarized, toggle off
    if (summary) {
      setSummary(null);
      return;
    }

    setIsSummarizing(true);
    setSummary('');
    setError(null);

    try {
      // Stream summary tokens for real-time display
      await summarizeText(plainText, settings!, (chunk) => {
        setSummary((prev) => (prev || '') + chunk);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI 总结失败');
    } finally {
      setIsSummarizing(false);
    }
  }, [settings, isSummarizing, summary, plainText]);



  return (
    <div className="mx-auto max-w-3xl overflow-x-hidden pb-20">
      {/* Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
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
            <span className="inline-flex items-center gap-1 text-xs">✓ Read</span>
          )}
        </div>
      </header>

      {/* AI Summary */}
      {summary && (
        <div className="mb-8 rounded-lg border border-primary/30 bg-primary/5 p-4">
          <div className="mb-2 text-sm font-semibold text-primary">AI 总结</div>
          <p className="text-sm leading-relaxed text-foreground">{summary}</p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

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

      {/* Article Content (rendered as segments to support inline translations) */}
      <div className="article-content">
        {segments.map((segment, index) => (
          <div key={index}>
            <div dangerouslySetInnerHTML={{ __html: segment.html }} />
            {translations[index] && (
              <p className="my-1 italic text-muted-foreground">{translations[index]}</p>
            )}
            {isTranslating && translatingIndex === index && !translations[index] && (
              <p className="my-1 animate-pulse italic text-muted-foreground">翻译中...</p>
            )}
          </div>
        ))}
      </div>

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

      {/* Fixed Bottom Action Bar */}
      <ArticleActionBar
        isFavorite={isFavorite}
        isTranslating={isTranslating}
        isSummarizing={isSummarizing}
        onToggleFavorite={handleFavoriteToggle}
        onTranslate={handleTranslate}
        onSummarize={handleSummarize}
      />
    </div>
  );
}
