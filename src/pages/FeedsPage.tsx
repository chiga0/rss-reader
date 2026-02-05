/**
 * Feeds Page - Main landing page
 * Feature: Replace global components with Shadcn UI
 * Created: 2026-02-05
 */

import { useLoaderData } from 'react-router-dom';
import type { Feed } from '@/models';

interface FeedsLoaderData {
  feeds: Feed[];
  isOffline: boolean;
  error?: Error;
}

export function FeedsPage() {
  const { feeds, isOffline } = useLoaderData() as FeedsLoaderData;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Feeds</h1>
      {isOffline && (
        <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded mb-4 text-sm">
          Offline Mode - Showing cached feeds
        </div>
      )}
      <div className="space-y-2">
        {feeds.length === 0 ? (
          <p className="text-muted-foreground">No feeds yet. Add your first feed to get started!</p>
        ) : (
          feeds.map(feed => (
            <div key={feed.id} className="p-4 border rounded hover:bg-accent">
              <h3 className="font-semibold">{feed.title}</h3>
              <p className="text-sm text-muted-foreground">{feed.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
