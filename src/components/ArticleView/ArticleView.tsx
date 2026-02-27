/**
 * ArticleView Component
 * Full article reader with sanitized HTML content
 */

import { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { LoadingSpinner } from '../Common/LoadingSpinner';
import { ErrorMessage } from '../Common/ErrorMessage';
import { translateText, summarizeText } from '@services/aiService';

export function ArticleView() {
  const { articles, selectedArticleId, isLoading, error, setError, toggleArticleFavorite, selectArticle } = useStore();

  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState<'summary' | 'translate' | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Get selected article
  const article = articles.find((a) => a.id === selectedArticleId);

  // Handle back to article list
  const handleBack = () => {
    selectArticle(null);
  };

  const getPlainText = (html: string) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  const handleSummarize = async () => {
    if (!article) return;
    setAiError(null);
    setAiLoading('summary');
    setAiSummary('');
    try {
      const text = getPlainText(article.content || article.summary || article.title);
      // Stream summary tokens for real-time display
      await summarizeText(text, (chunk) => {
        setAiSummary((prev) => (prev || '') + chunk);
      });
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Failed to summarize');
    } finally {
      setAiLoading(null);
    }
  };

  const handleTranslate = async () => {
    if (!article) return;
    setAiError(null);
    setAiLoading('translate');
    setTranslatedContent('');
    try {
      const text = getPlainText(article.content || article.summary || article.title);
      // Stream translation tokens for real-time display
      await translateText(text, '中文', (chunk) => {
        setTranslatedContent((prev) => (prev || '') + chunk);
      });
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Failed to translate');
    } finally {
      setAiLoading(null);
    }
  };

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

      {/* Back Button for Mobile */}
      <button
        onClick={handleBack}
        className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 tablet:hidden"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span>返回文章列表</span>
      </button>

      {/* Article Header */}
      <header className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-3xl font-bold leading-tight text-gray-900 dark:text-gray-100 sm:text-4xl flex-1">
            {article.title}
          </h1>
          <button
            onClick={() => toggleArticleFavorite(article.id)}
            className="shrink-0 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={article.isFavorite ? '取消收藏' : '收藏文章'}
          >
            <svg 
              className={`h-6 w-6 ${article.isFavorite ? 'text-yellow-500' : 'text-gray-400'}`}
              fill={article.isFavorite ? 'currentColor' : 'none'}
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

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

      {/* AI Actions */}
      <div className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
        <div className="flex flex-wrap gap-3 mb-4">
          <button
            onClick={handleSummarize}
            disabled={aiLoading !== null}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-card-foreground shadow-sm hover:bg-muted disabled:opacity-50 transition-colors"
          >
            {aiLoading === 'summary' ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Summarizing...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                AI Summary
              </>
            )}
          </button>

          <button
            onClick={handleTranslate}
            disabled={aiLoading !== null}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-card-foreground shadow-sm hover:bg-muted disabled:opacity-50 transition-colors"
          >
            {aiLoading === 'translate' ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Translating...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                Translate to Chinese
              </>
            )}
          </button>
        </div>

        {/* AI Error */}
        {aiError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
            <div className="flex items-start gap-2">
              <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{aiError}</span>
            </div>
          </div>
        )}

        {/* AI Summary Result */}
        {aiSummary && (
          <div className="mb-4 rounded-lg border border-border bg-muted/50 p-4">
            <h3 className="mb-2 text-sm font-semibold text-foreground flex items-center gap-2">
              <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI Summary
            </h3>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{aiSummary}</p>
          </div>
        )}

        {/* AI Translation Result */}
        {translatedContent && (
          <div className="mb-4 rounded-lg border border-border bg-muted/50 p-4">
            <h3 className="mb-2 text-sm font-semibold text-foreground flex items-center gap-2">
              <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              Translation (中文)
            </h3>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{translatedContent}</p>
          </div>
        )}
      </div>

      {/* Article Link */}
      {article.link && (
        <footer className="border-t border-gray-200 pt-6 dark:border-gray-700">
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
