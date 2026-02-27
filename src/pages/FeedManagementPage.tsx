/**
 * Feed Management Page
 * Allows editing and deleting subscription sources
 */

import { useEffect, useState, useCallback } from 'react';
import { Pencil, Trash2, Rss, Check, X, Plus } from 'lucide-react';
import { useStore } from '@hooks/useStore';
import { storage } from '@lib/storage';
import { AddFeedDialog } from '@components/AddFeedDialog/AddFeedDialog';
import type { Feed } from '@models/Feed';

export function FeedManagementPage() {
  const { feeds, loadFeeds, unsubscribeFeed, updateFeed, isAddFeedDialogOpen, openAddFeedDialog, closeAddFeedDialog } = useStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');

  useEffect(() => {
    const init = async () => {
      await storage.init().catch(() => {});
      await loadFeeds();
    };
    init();
  }, [loadFeeds]);

  const handleEdit = useCallback((feed: Feed) => {
    setEditingId(feed.id);
    setEditTitle(feed.title);
    setEditUrl(feed.url);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditTitle('');
    setEditUrl('');
  }, []);

  const handleSaveEdit = useCallback(async (feedId: string) => {
    if (!editTitle.trim()) return;
    try {
      await updateFeed(feedId, { title: editTitle.trim(), url: editUrl.trim() });
      setEditingId(null);
      setEditTitle('');
      setEditUrl('');
    } catch {
      // error handled by store
    }
  }, [editTitle, editUrl, updateFeed]);

  const handleDelete = useCallback(async (feedId: string) => {
    if (window.confirm('Are you sure you want to unsubscribe from this feed?')) {
      await unsubscribeFeed(feedId);
    }
  }, [unsubscribeFeed]);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Manage Subscriptions</h1>
        <button
          onClick={openAddFeedDialog}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Feed</span>
        </button>
      </div>

      {feeds.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-16 text-center">
          <Rss className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-lg font-semibold text-foreground">No subscriptions</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Add feeds from the Feeds page to manage them here
          </p>
          <button
            onClick={openAddFeedDialog}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Your First Feed
          </button>
        </div>
      )}

      {feeds.length > 0 && (
        <div className="space-y-3">
          {feeds.map((feed) => (
            <div
              key={feed.id}
              className="rounded-lg border border-border bg-card p-4"
            >
              {editingId === feed.id ? (
                /* Edit Mode */
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      Title
                    </label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Feed title"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      URL
                    </label>
                    <input
                      type="url"
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Feed URL"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSaveEdit(feed.id)}
                      className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                      <Check className="h-4 w-4" />
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-card-foreground hover:bg-accent"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* Display Mode */
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                    {feed.iconUrl ? (
                      <img src={feed.iconUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />
                    ) : (
                      <Rss className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-card-foreground">
                      {feed.title}
                    </h3>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {feed.url}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => handleEdit(feed)}
                      className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(feed.id)}
                      className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {/* Add Feed Dialog */}
      <AddFeedDialog isOpen={isAddFeedDialogOpen} onClose={closeAddFeedDialog} />
    </div>
  );
}
