/**
 * Article Detail Page - Full article view
 * Auto marks article as read on open, supports favorite toggle
 * Renders sanitized HTML content with inline translation support
 */

import { useCallback, useState, useMemo, useEffect } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { useStore } from '@hooks/useStore';
import { sanitizeHTML } from '@utils/sanitize';
import { formatRelativeTime } from '@utils/dateFormat';
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
  const { article, feed } = useLoaderData() as ArticleDetailLoaderData;
  const navigate = useNavigate();
  const { toggleArticleFavorite } = useStore();

  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [translations, setTranslations] = useState<Record<number, string>>({});
  const [translatingIndex, setTranslatingIndex] = useState<number>(-1);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    storage.get('settings', 'default').then((s) => {
      if (s) setSettings(s);
    });
  }, []);

  const handleFavoriteToggle = useCallback(async () => {
    await toggleArticleFavorite(article.id);
  }, [toggleArticleFavorite, article.id]);

  const sanitizedContent = article.content
    ? sanitizeHTML(article.content)
    : article.summary || '';

  const segments = useMemo(() => parseContentSegments(sanitizedContent), [sanitizedContent]);

  const plainText = useMemo(
    () => segments.map((s) => s.text).filter(Boolean).join('\n\n'),
    [segments],
  );

  const handleTranslate = useCallback(async () => {
    if (!settings?.aiApiKey) {
      setError('请先在设置中配置 AI API Key');
      return;
    }
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
        const translated = await translateText(text, settings);
        setTranslations((prev) => ({ ...prev, [i]: translated }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '翻译失败');
    } finally {
      setIsTranslating(false);
      setTranslatingIndex(-1);
    }
  }, [settings, isTranslating, translations, segments]);

  const handleSummarize = useCallback(async () => {
    if (!settings?.aiApiKey) {
      setError('请先在设置中配置 AI API Key');
      return;
    }
    if (isSummarizing) return;

    // If already summarized, toggle off
    if (summary) {
      setSummary(null);
      return;
    }

    setIsSummarizing(true);
    setError(null);

    try {
      const result = await summarizeText(plainText, settings);
      setSummary(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI 总结失败');
    } finally {
      setIsSummarizing(false);
    }
  }, [settings, isSummarizing, summary, plainText]);

  const proseClasses = `prose prose-neutral max-w-none dark:prose-invert
    prose-headings:text-foreground prose-headings:font-semibold
    prose-p:text-foreground prose-p:leading-relaxed
    prose-a:text-primary prose-a:no-underline hover:prose-a:underline
    prose-img:rounded-lg prose-img:my-4
    prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground
    prose-code:text-foreground prose-code:bg-secondary prose-code:rounded prose-code:px-1
    prose-pre:bg-secondary prose-pre:text-foreground`;

  return (
    <div className="mx-auto max-w-3xl pb-16">
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

      {/* Article Content with inline translations */}
      <div className={proseClasses}>
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

      {/* Fixed Bottom Action Bar */}
      <ArticleActionBar
        isFavorite={article.isFavorite}
        isTranslating={isTranslating}
        isSummarizing={isSummarizing}
        onToggleFavorite={handleFavoriteToggle}
        onTranslate={handleTranslate}
        onSummarize={handleSummarize}
      />
    </div>
  );
}
