import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { useRouteTitle } from '@/hooks/useRouteTitle';
import { ToastNotification } from '@components/ui/toast-notification';
import { PodcastProvider } from '@/contexts/PodcastContext';
import { PodcastMiniPlayer } from './PodcastMiniPlayer';

export function AppLayout() {
  useRouteTitle();

  return (
    <PodcastProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="container mx-auto px-4 py-6">
          <Outlet />
        </main>
        <PodcastMiniPlayer />
        <ToastNotification />
      </div>
    </PodcastProvider>
  );
}
