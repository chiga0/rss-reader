import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { navigationItems } from '@/lib/router/navigationItems';
import { cn } from '@/lib/utils';

export function MobileNav() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { t } = useTranslation('common');

  const isActivePath = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const handleClose = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open navigation"
          aria-expanded={open}
          aria-controls="mobile-nav-drawer"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full max-w-xs p-0" id="mobile-nav-drawer">
        <SheetHeader className="px-4 py-3 border-b">
          <SheetTitle className="text-left text-base">Navigation</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col divide-y">
          {navigationItems.map((item) => {
            const isActive = isActivePath(item.path);
            const Icon = item.icon;
            return (
              <SheetClose asChild key={item.id}>
                <Link
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors',
                    isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={handleClose}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  <span>{t(`nav.${item.id}`)}</span>
                </Link>
              </SheetClose>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
