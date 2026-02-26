import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DesktopNav } from './DesktopNav';
import { MobileNav } from './MobileNav';
import { syncService } from '@services/syncService';
import { useStore } from '@hooks/useStore';

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
        <div className="md:hidden">
          <MobileNav />
        </div>
        <div className="hidden md:block">
          <DesktopNav />
        </div>
        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon" asChild aria-label="Search">
            <Link to="/search">
              <Search className="h-5 w-5" />
            </Link>
          </Button>
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
