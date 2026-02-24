/**
 * React Router configuration
 * Feature: Replace global components with Shadcn UI
 * Created: 2026-02-05
 */

import { createBrowserRouter, Navigate } from 'react-router-dom';
import { routes } from './routeConfig.tsx';
import { AppLayout } from '@/components/layout/AppLayout';

/**
 * Browser router instance
 * Uses React Router v6 data router API
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/feeds" replace />,
      },
      ...routes,
    ],
  },
]);
