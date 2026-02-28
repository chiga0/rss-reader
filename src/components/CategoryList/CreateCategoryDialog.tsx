/**
 * CreateCategoryDialog Component
 * Modal for creating new categories
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '@hooks/useStore';

interface CreateCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateCategoryDialog({ isOpen, onClose }: CreateCategoryDialogProps) {
  const { t } = useTranslation('category');
  const { t: tCommon } = useTranslation('common');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const { createCategory } = useStore();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError(t('enterCategoryName'));
      return;
    }

    try {
      await createCategory(name.trim());
      setName('');
      onClose();
    } catch (err) {
      setError('创建失败，请重试');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-800 p-6 shadow-xl">
          <h2 className="mb-4 text-xl font-semibold">{t('createCategoryTitle')}</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="category-name" className="sr-only">{t('categoryName')}</label>
              <input
                id="category-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('categoryNamePlaceholder')}
                className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
                autoFocus
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-200">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border px-4 py-2 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                {tCommon('cancel')}
              </button>
              <button
                type="submit"
                className="flex-1 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
              >
                {t('createCategory')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}