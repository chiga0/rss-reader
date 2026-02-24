/**
 * Route configuration for React Router v6
 * Feature: Replace global components with Shadcn UI
 * Created: 2026-02-05
 */

import type { Route } from '@/types/navigation';
import { FeedsPage } from '@/pages/FeedsPage';
import { FeedDetailPage } from '@/pages/FeedDetailPage';
import { ArticleDetailPage } from '@/pages/ArticleDetailPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { loadFeedsData, loadFeedDetail, loadArticleDetail } from './loaders';

/**
 * Route configuration array
 * Used by React Router's createBrowserRouter
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
    element: <div>Favorites (Coming soon)</div>,
    handle: {
      title: 'Favorites',
      icon: 'star',
    },
  },
  {
    path: '/history',
    element: <div>History (Coming soon)</div>,
    handle: {
      title: 'History',
      icon: 'clock',
    },
  },
  {
    path: '/settings',
    element: <div>Settings (Coming soon)</div>,
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
