import { DesktopNav } from './DesktopNav';
import { MobileNav } from './MobileNav';
import { ThemeToggle } from './ThemeToggle';
import { Rss } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Navbar() {
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
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
