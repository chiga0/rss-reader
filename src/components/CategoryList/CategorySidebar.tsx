/**
 * CategorySidebar Component
 * Sidebar showing categories with feed counts
 */

import { useTranslation } from 'react-i18next';
import { useStore } from '@hooks/useStore';

interface CategorySidebarProps {
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  onCreateCategory: () => void;
}

export function CategorySidebar({ selectedCategory, onSelectCategory, onCreateCategory }: CategorySidebarProps) {
  const { t } = useTranslation('category');
  const { t: tFeed } = useTranslation('feed');
  const { categories, feeds } = useStore();

  const getCategoryFeedCount = (categoryId: string) => {
    return feeds.filter(f => f.categoryId === categoryId && !f.deletedAt).length;
  };

  return (
    <aside className="w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto hidden lg:block">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('title')}</h2>
          <button onClick={onCreateCategory} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        <nav className="space-y-1">
          <button
            onClick={() => onSelectCategory(null)}
            className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg ${
              selectedCategory === null ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <span>{tFeed('allFeeds')}</span>
            <span className="text-xs">{feeds.filter(f => !f.deletedAt).length}</span>
          </button>

          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg truncate ${
                selectedCategory === category.id ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span className="truncate">{category.name}</span>
              <span className="text-xs shrink-0 ml-2">{getCategoryFeedCount(category.id)}</span>
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}