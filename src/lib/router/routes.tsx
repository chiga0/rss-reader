/**
 * React Router configuration
 * Feature: Replace global components with Shadcn UI
 * Created: 2026-02-05
 */

import { AppLayout } from '@/components/layout/AppLayout';
import { createHashRouter, Navigate } from 'react-router-dom';
import { routes } from './routeConfig.tsx';

/**
 * Browser router instance
 * Uses React Router v6 data router API
 */
export const router = createHashRouter([
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
