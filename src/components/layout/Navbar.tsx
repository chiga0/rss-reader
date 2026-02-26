import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DesktopNav } from './DesktopNav';
import { MobileNav } from './MobileNav';
import { syncService } from '@services/syncService';
import { useStore } from '@hooks/useStore';
import { ThemeToggle } from './ThemeToggle';
import { Rss } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Navbar() {
  const { loadFeeds } = useStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await syncService.refreshAllFeeds();
      await loadFeeds();
    } catch {
      // silent fail
    } finally {
      setIsRefreshing(false);
    }
  }, [loadFeeds]);

  return (
    <header
      className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      role="banner"
      aria-label="Application navigation"
    >
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2 md:hidden">
          <MobileNav />
          <Link to="/feeds" className="flex items-center gap-1.5 text-sm font-semibold text-foreground" aria-label="RSS Reader Home">
            <Rss className="h-4 w-4 text-primary" />
            <span>RSS Reader</span>
          </Link>
        </div>
        <div className="hidden md:block">
          <DesktopNav />
        </div>
        <div className="ml-auto flex items-center gap-1">
          <Link
            to="/search"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </Link>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Refresh feeds"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
    </header>
  );
}
