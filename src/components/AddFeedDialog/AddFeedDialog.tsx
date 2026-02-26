/**
 * AddFeedDialog Component
 * Modal dialog for adding new RSS feed subscriptions
 */

import { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { useOfflineDetection } from '../../hooks/useOfflineDetection';
import { useToast } from '../../hooks/useToast';

interface AddFeedDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddFeedDialog({ isOpen, onClose }: AddFeedDialogProps) {
  const [url, setUrl] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { subscribeFeed, categories, loadCategories } = useStore();
  const { isOnline } = useOfflineDetection();
  const { addToast } = useToast();

  // Load categories on mount
  useState(() => {
    loadCategories();
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check if online
    if (!isOnline) {
      setError('Cannot add feeds while offline. Please check your connection.');
      return;
    }

    // Validate URL
    if (!url.trim()) {
      setError('Please enter a feed URL');
      return;
    }

    try {
      new URL(url);
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await subscribeFeed(url.trim(), categoryId || undefined);
      if (!result.success) {
        setError(result.error || 'Failed to add feed');
        return;
      }
      // Success - close dialog, reset form, and notify user
      setUrl('');
      setCategoryId('');
      setError('');
      addToast('Feed added successfully!', 'success');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add feed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setUrl('');
    setCategoryId('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={handleCancel}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-md rounded-xl bg-card p-6 shadow-xl border border-border"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dialog-title"
        >
          <h2 id="dialog-title" className="mb-4 text-xl font-semibold text-card-foreground">
            Add RSS Feed
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* URL Input */}
            <div>
              <label htmlFor="feed-url" className="mb-1 block text-sm font-medium text-card-foreground">
                Feed URL
              </label>
              <input
                id="feed-url"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/feed.xml"
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                disabled={isSubmitting}
                autoFocus
              />
            </div>

            {/* Category Dropdown */}
            <div>
              <label htmlFor="category" className="mb-1 block text-sm font-medium text-card-foreground">
                Category (Optional)
              </label>
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                disabled={isSubmitting}
              >
                <option value="">No category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Offline Warning */}
            {!isOnline && (
              <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-3 text-sm text-yellow-700 dark:text-yellow-300">
                ⚠️ You're currently offline. Connect to the internet to add new feeds.
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="flex-1 rounded-lg border border-border bg-secondary px-4 py-2 font-medium text-secondary-foreground hover:bg-accent disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !isOnline}
                className="flex-1 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                title={!isOnline ? 'Cannot add feeds while offline' : ''}
              >
                {isSubmitting ? 'Adding...' : 'Add Feed'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
