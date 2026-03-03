/**
 * Route configuration for React Router v6
 * Feature: Replace global components with Shadcn UI
 * Created: 2026-02-05
 */

import type { ReactElement } from 'react';
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
import { AnnotationsPage } from '@/pages/AnnotationsPage';
import { loadFeedsData, loadFeedDetail, loadArticleDetail } from './loaders';
import { ErrorBoundary } from '@/components/Common/ErrorBoundary';

function wrap(element: ReactElement): ReactElement {
  return <ErrorBoundary>{element}</ErrorBoundary>;
}

/**
 * Route configuration array
 * Used by React Router's createBrowserRouter
 * Note: Titles are now translated in the components that use them
 */
export const routes: Route[] = [
  {
    path: '/feeds',
    element: wrap(<FeedsPage />),
    loader: loadFeedsData,
    handle: {
      title: 'Feeds',
      icon: 'rss',
    },
  },
  {
    path: '/feeds/:feedId',
    element: wrap(<FeedDetailPage />),
    loader: loadFeedDetail,
    handle: {
      title: 'Feed Detail',
      icon: 'newspaper',
    },
  },
  {
    path: '/articles/:articleId',
    element: wrap(<ArticleDetailPage />),
    loader: loadArticleDetail,
    handle: {
      title: 'Article',
      icon: 'file-text',
    },
  },
  {
    path: '/favorites',
    element: wrap(<FavoritesPage />),
    handle: {
      title: 'Favorites',
      icon: 'star',
    },
  },
  {
    path: '/history',
    element: wrap(<HistoryPage />),
    handle: {
      title: 'History',
      icon: 'clock',
    },
  },
  {
    path: '/feed-management',
    element: wrap(<FeedManagementPage />),
    handle: {
      title: 'Manage Subscriptions',
      icon: 'list',
    },
  },
  {
    path: '/search',
    element: wrap(<SearchPage />),
    handle: {
      title: 'Search',
      icon: 'search',
    },
  },
  {
    path: '/settings',
    element: wrap(<Settings />),
    handle: {
      title: 'Settings',
      icon: 'settings',
    },
  },
  {
    path: '/annotations',
    element: wrap(<AnnotationsPage />),
    handle: {
      title: 'Annotations',
      icon: 'highlighter',
    },
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];