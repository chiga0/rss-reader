/**
 * useRouteTitle hook - Updates document.title from route metadata
 * Feature: Replace global components with Shadcn UI
 * Created: 2026-02-05
 */

import { useEffect } from 'react';
import { useMatches } from 'react-router-dom';
import type { RouteHandle } from '@/types/navigation';

interface RouteMatch {
  id: string;
  pathname: string;
  params: Record<string, string | undefined>;
  data: unknown;
  handle: RouteHandle;
}

/**
 * Hook to update document.title based on route handle metadata
 * Extracts title from route handle and updates document.title
 */
export function useRouteTitle() {
  const matches = useMatches() as RouteMatch[];

  useEffect(() => {
    // Find the last match with a title
    const match = [...matches].reverse().find(m => m.handle?.title);
    
    if (match?.handle?.title) {
      document.title = `${match.handle.title} | RSS Reader`;
    } else {
      document.title = 'RSS Reader - Feed Your Knowledge';
    }
  }, [matches]);
}
