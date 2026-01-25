/**
 * AddFeedDialog Component
 * Modal dialog for adding new RSS feed subscriptions
 */

import { useState } from 'react';
import { useStore } from '../../hooks/useStore';

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

  // Load categories on mount
  useState(() => {
    loadCategories();
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

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
      await subscribeFeed(url.trim(), categoryId || undefined);
      // Success - close dialog and reset form
      setUrl('');
      setCategoryId('');
      setError('');
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
          className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dialog-title"
        >
          <h2 id="dialog-title" className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
            Add RSS Feed
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* URL Input */}
            <div>
              <label htmlFor="feed-url" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Feed URL
              </label>
              <input
                id="feed-url"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/feed.xml"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:border-primary"
                disabled={isSubmitting}
                autoFocus
              />
            </div>

            {/* Category Dropdown */}
            <div>
              <label htmlFor="category" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Category (Optional)
              </label>
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:border-primary"
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
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 rounded-lg bg-primary px-4 py-2 font-medium text-white hover:bg-primary/90 disabled:opacity-50"
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
