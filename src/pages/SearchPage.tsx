/**
 * Search Page
 * Secondary page with back button, search input, and results
 * Searches across feed titles and article titles/summaries
 */

import { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search as SearchIcon, Rss, FileText } from 'lucide-react';
import { storage } from '@lib/storage';
import type { Feed, Article } from '@models/Feed';

interface SearchResults {
  feeds: Feed[];
  articles: (Article & { feedTitle?: string })[];
}

export function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>({ feeds: [], articles: [] });
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults({ feeds: [], articles: [] });
      setHasSearched(false);
      return;
    }

    const q = searchQuery.toLowerCase().trim();
    setHasSearched(true);

    try {
      await storage.init().catch(() => {});

      // Search feeds
      const allFeeds = (await storage.getAll('feeds')).filter(f => !f.deletedAt);
      const matchedFeeds = allFeeds.filter(
        (f) =>
          f.title.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q) ||
          f.url.toLowerCase().includes(q)
      );

      // Search articles
      const allArticles = (await storage.getAll('articles')).filter(a => !a.deletedAt);
      const matchedArticles = allArticles
        .filter(
          (a) =>
            a.title.toLowerCase().includes(q) ||
            a.summary.toLowerCase().includes(q)
        )
        .slice(0, 50); // Limit results

      // Attach feed titles to articles
      const feedMap = new Map(allFeeds.map(f => [f.id, f.title]));
      const articlesWithFeedTitle = matchedArticles.map(a => ({
        ...a,
        feedTitle: feedMap.get(a.feedId),
      }));

      setResults({ feeds: matchedFeeds, articles: articlesWithFeedTitle });
    } catch {
      setResults({ feeds: [], articles: [] });
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, performSearch]);

  return (
    <div className="mx-auto max-w-3xl">
      {/* Search Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="shrink-0 rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search feeds and articles..."
            className="w-full rounded-md border border-border bg-background py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            autoFocus
          />
        </div>
      </div>

      {/* Results */}
      {hasSearched && results.feeds.length === 0 && results.articles.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <SearchIcon className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No results found for &quot;{query}&quot;</p>
        </div>
      )}

      {/* Feed Results */}
      {results.feeds.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Feeds ({results.feeds.length})
          </h2>
          <div className="space-y-2">
            {results.feeds.map((feed) => (
              <Link
                key={feed.id}
                to={`/feeds/${feed.id}`}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                  {feed.iconUrl ? (
                    <img src={feed.iconUrl} alt="" className="h-8 w-8 rounded-lg object-cover" />
                  ) : (
                    <Rss className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-medium text-card-foreground">{feed.title}</h3>
                  {feed.description && (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{feed.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Article Results */}
      {results.articles.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Articles ({results.articles.length})
          </h2>
          <div className="space-y-2">
            {results.articles.map((article) => (
              <Link
                key={article.id}
                to={`/articles/${article.id}`}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-medium text-card-foreground">{article.title}</h3>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    {article.feedTitle && <span>{article.feedTitle}</span>}
                    {article.publishedAt && (
                      <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
