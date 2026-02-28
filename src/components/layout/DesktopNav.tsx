import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import { navigationItems } from '@/lib/router/navigationItems';
import { cn } from '@/lib/utils';

export function DesktopNav() {
  const location = useLocation();
  const { t } = useTranslation('common');

  const isActivePath = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <NavigationMenu className="hidden md:flex" aria-label="Primary navigation">
      <NavigationMenuList>
        {navigationItems.map((item) => {
          const isActive = isActivePath(item.path);
          const Icon = item.icon;
          return (
            <NavigationMenuItem key={item.id}>
              <Link
                to={item.path}
                className={cn(
                  "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                  isActive ? 'bg-accent/50' : undefined
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="h-4 w-4 mr-2" aria-hidden />
                <span>{t(`nav.${item.id}`)}</span>
              </Link>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
