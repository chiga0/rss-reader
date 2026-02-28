/**
 * Route configuration for React Router v6
 * Feature: Replace global components with Shadcn UI
 * Created: 2026-02-05
 */

import type { Route } from '@/types/navigation';
import { FeedsPage } from '@/pages/FeedsPage';
import { FeedDetailPage } from '@/pages/FeedDetailPage';
import { ArticleDetailPage } from '@/pages/ArticleDetailPage';
import { FavoritesPage } from '@/pages/Favorites';
import { HistoryPage } from '@/pages/History';
import Settings from '@/pages/Settings';
import { FeedManagementPage } from '@/pages/FeedManagementPage';
import { SearchPage } from '@/pages/SearchPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { loadFeedsData, loadFeedDetail, loadArticleDetail } from './loaders';

/**
 * Route configuration array
 * Used by React Router's createBrowserRouter
 * Note: Titles are now translated in the components that use them
 */
export const routes: Route[] = [
  {
    path: '/feeds',
    element: <FeedsPage />,
    loader: loadFeedsData,
    handle: {
      title: 'Feeds',
      icon: 'rss',
    },
  },
  {
    path: '/feeds/:feedId',
    element: <FeedDetailPage />,
    loader: loadFeedDetail,
    handle: {
      title: 'Feed Detail',
      icon: 'newspaper',
    },
  },
  {
    path: '/articles/:articleId',
    element: <ArticleDetailPage />,
    loader: loadArticleDetail,
    handle: {
      title: 'Article',
      icon: 'file-text',
    },
  },
  {
    path: '/favorites',
    element: <FavoritesPage />,
    handle: {
      title: 'Favorites',
      icon: 'star',
    },
  },
  {
    path: '/history',
    element: <HistoryPage />,
    handle: {
      title: 'History',
      icon: 'clock',
    },
  },
  {
    path: '/feed-management',
    element: <FeedManagementPage />,
    handle: {
      title: 'Manage Subscriptions',
      icon: 'list',
    },
  },
  {
    path: '/search',
    element: <SearchPage />,
    handle: {
      title: 'Search',
      icon: 'search',
    },
  },
  {
    path: '/settings',
    element: <Settings />,
    handle: {
      title: 'Settings',
      icon: 'settings',
    },
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];