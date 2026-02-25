import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { useRouteTitle } from '@/hooks/useRouteTitle';
import { ToastNotification } from '@components/ui/toast-notification';

export function AppLayout() {
  useRouteTitle();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
      <ToastNotification />
    </div>
  );
}
