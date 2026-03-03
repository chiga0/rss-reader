/**
 * Annotations Page - Lists all saved highlights and annotations grouped by article
 */

import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Highlighter, Trash2 } from 'lucide-react';
import { storage } from '@lib/storage';
import type { Annotation } from '@/models';

const COLOR_CLASS: Record<Annotation['color'], string> = {
  yellow: 'bg-yellow-100 border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-700',
  green: 'bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-700',
  blue: 'bg-blue-100 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700',
  pink: 'bg-pink-100 border-pink-300 dark:bg-pink-900/30 dark:border-pink-700',
};

export function AnnotationsPage() {
  const navigate = useNavigate();
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [articleTitles, setArticleTitles] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const all = await storage.getAll('annotations');
      // Sort newest first
      all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setAnnotations(all);

      // Load article titles for grouping display
      const uniqueArticleIds = [...new Set(all.map((a) => a.articleId))];
      const titles: Record<string, string> = {};
      await Promise.all(
        uniqueArticleIds.map(async (id) => {
          const article = await storage.get('articles', id);
          titles[id] = article?.title ?? id;
        }),
      );
      setArticleTitles(titles);
      setIsLoading(false);
    }
    load().catch(() => setIsLoading(false));
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    await storage.delete('annotations', id);
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
  }, []);

  // Group by articleId
  const grouped = annotations.reduce<Record<string, Annotation[]>>((acc, ann) => {
    (acc[ann.articleId] ??= []).push(ann);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center gap-3">
        <Highlighter className="h-6 w-6 text-amber-500" />
        <h1 className="text-2xl font-bold text-foreground">Annotations</h1>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-16 text-center">
          <Highlighter className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-lg font-semibold text-foreground">No annotations yet</h2>
          <p className="text-sm text-muted-foreground">
            Open an article and use the Annotate button to highlight text.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([articleId, anns]) => (
            <div key={articleId} className="rounded-lg border border-border bg-card">
              <button
                className="w-full px-4 py-3 text-left text-sm font-semibold text-foreground hover:bg-accent transition-colors rounded-t-lg"
                onClick={() => navigate(`/articles/${articleId}`)}
              >
                {articleTitles[articleId] ?? articleId}
              </button>
              <ul className="divide-y divide-border">
                {anns.map((ann) => (
                  <li key={ann.id} className="flex items-start gap-3 px-4 py-3">
                    <div className={`mt-1 h-3 w-3 shrink-0 rounded-full border ${COLOR_CLASS[ann.color]}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground">&ldquo;{ann.selectedText}&rdquo;</p>
                      {ann.note && (
                        <p className="mt-0.5 text-xs text-muted-foreground">{ann.note}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(ann.id)}
                      className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:text-destructive"
                      title="Delete annotation"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
