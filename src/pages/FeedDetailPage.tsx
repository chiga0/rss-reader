/**
 * Feed Detail Page - Articles from a specific feed
 * Feature: Replace global components with Shadcn UI
 * Created: 2026-02-05
 */

import { useLoaderData } from 'react-router-dom';
import type { Feed, Article } from '@/models';

interface FeedDetailLoaderData {
  feed: Feed;
  articles: Article[];
  isOffline: boolean;
}

export function FeedDetailPage() {
  const { feed, articles, isOffline } = useLoaderData() as FeedDetailLoaderData;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">{feed.title}</h1>
      <p className="text-muted-foreground mb-4">{feed.description}</p>
      
      {isOffline && (
        <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded mb-4 text-sm">
          Offline Mode - Showing cached articles
        </div>
      )}
      
      <div className="space-y-4">
        {articles.length === 0 ? (
          <p className="text-muted-foreground">No articles in this feed yet.</p>
        ) : (
          articles.map(article => (
            <div key={article.id} className="p-4 border rounded hover:bg-accent">
              <h3 className="font-semibold mb-1">{article.title}</h3>
              <p className="text-sm text-muted-foreground mb-2">{article.summary}</p>
              <span className="text-xs text-muted-foreground">
                {new Date(article.publishedAt).toLocaleDateString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
