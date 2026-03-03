/**
 * ArticleActionBar - Fixed bottom banner with Favorite, Translate, AI Summary, Annotate, and Share buttons.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Languages, Sparkles, Loader2, Highlighter, Share2 } from 'lucide-react';

interface ArticleActionBarProps {
  isFavorite: boolean;
  isTranslating: boolean;
  isSummarizing: boolean;
  isAnnotating: boolean;
  articleLink?: string;
  articleTitle?: string;
  onToggleFavorite: () => void;
  onTranslate: () => void;
  onSummarize: () => void;
  onToggleAnnotate: () => void;
}

export function ArticleActionBar({
  isFavorite,
  isTranslating,
  isSummarizing,
  isAnnotating,
  articleLink,
  articleTitle,
  onToggleFavorite,
  onTranslate,
  onSummarize,
  onToggleAnnotate,
}: ArticleActionBarProps) {
  const { t } = useTranslation('article');
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState(false);

  const handleShare = async () => {
    const url = articleLink || window.location.href;
    const title = articleTitle || document.title;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch (err) {
        // Only show error for non-cancellation failures
        if ((err as Error)?.name !== 'AbortError') {
          setShareError(true);
          setTimeout(() => setShareError(false), 1500);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch {
        setShareError(true);
        setTimeout(() => setShareError(false), 1500);
      }
    }
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-sm"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="mx-auto flex max-w-3xl items-center justify-around px-4 py-2">
        {/* Favorite */}
        <button
          onClick={onToggleFavorite}
          className={`inline-flex flex-col items-center gap-0.5 rounded-md px-3 py-1.5 text-xs transition-colors ${
            isFavorite
              ? 'text-red-600 dark:text-red-400'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Heart className="h-5 w-5" fill={isFavorite ? 'currentColor' : 'none'} />
          <span>{isFavorite ? t('favorited') : t('favorite')}</span>
        </button>

        {/* Translate */}
        <button
          onClick={onTranslate}
          className="inline-flex flex-col items-center gap-0.5 rounded-md px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          {isTranslating ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Languages className="h-5 w-5" />
          )}
          <span>{isTranslating ? '停止翻译' : '翻译'}</span>
        </button>

        {/* AI Summary */}
        <button
          onClick={onSummarize}
          className="inline-flex flex-col items-center gap-0.5 rounded-md px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          {isSummarizing ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Sparkles className="h-5 w-5" />
          )}
          <span>{isSummarizing ? '停止总结' : 'AI 总结'}</span>
        </button>

        {/* Annotate */}
        <button
          onClick={onToggleAnnotate}
          className={`inline-flex flex-col items-center gap-0.5 rounded-md px-3 py-1.5 text-xs transition-colors ${
            isAnnotating
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          title="Highlight / Annotate"
        >
          <Highlighter className="h-5 w-5" />
          <span>{isAnnotating ? 'Done' : 'Annotate'}</span>
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          className="inline-flex flex-col items-center gap-0.5 rounded-md px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          title="Share article"
        >
          <Share2 className="h-5 w-5" />
          <span>{copied ? 'Copied!' : shareError ? 'Failed' : 'Share'}</span>
        </button>
      </div>
    </div>
  );
}
