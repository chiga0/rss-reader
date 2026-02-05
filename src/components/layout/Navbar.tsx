import { DesktopNav } from './DesktopNav';
import { MobileNav } from './MobileNav';
import { ThemeToggle } from './ThemeToggle';

export function Navbar() {
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
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
