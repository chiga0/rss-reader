/**
 * FeedList Page
 * Main page displaying all RSS feeds
 */

import { useEffect } from 'react';
import { useStore } from '../hooks/useStore';
import { FeedList as FeedListComponent } from '../components/FeedList/FeedList';

export default function FeedList() {
  const { loadFeeds } = useStore();

  // Load feeds on mount
  useEffect(() => {
    loadFeeds();
  }, [loadFeeds]);

  return <FeedListComponent />;
}
