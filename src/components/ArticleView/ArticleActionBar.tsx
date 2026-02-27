/**
 * ArticleActionBar - Fixed bottom banner with Favorite, Translate, and AI Summary buttons.
 */

import { Heart, Languages, Sparkles, Loader2 } from 'lucide-react';

interface ArticleActionBarProps {
  isFavorite: boolean;
  isTranslating: boolean;
  isSummarizing: boolean;
  onToggleFavorite: () => void;
  onTranslate: () => void;
  onSummarize: () => void;
}

export function ArticleActionBar({
  isFavorite,
  isTranslating,
  isSummarizing,
  onToggleFavorite,
  onTranslate,
  onSummarize,
}: ArticleActionBarProps) {
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
          <span>{isFavorite ? '已收藏' : '收藏'}</span>
        </button>

        {/* Translate */}
        <button
          onClick={onTranslate}
          disabled={isTranslating}
          className="inline-flex flex-col items-center gap-0.5 rounded-md px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
        >
          {isTranslating ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Languages className="h-5 w-5" />
          )}
          <span>{isTranslating ? '翻译中...' : '翻译'}</span>
        </button>

        {/* AI Summary */}
        <button
          onClick={onSummarize}
          disabled={isSummarizing}
          className="inline-flex flex-col items-center gap-0.5 rounded-md px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
        >
          {isSummarizing ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Sparkles className="h-5 w-5" />
          )}
          <span>{isSummarizing ? '总结中...' : 'AI 总结'}</span>
        </button>
      </div>
    </div>
  );
}
