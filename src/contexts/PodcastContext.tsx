import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

interface PodcastInfo {
  url: string;
  title: string;
}

interface PodcastContextValue {
  currentPodcast: PodcastInfo | null;
  playPodcast: (url: string, title: string) => void;
  stopPodcast: () => void;
}

const PodcastContext = createContext<PodcastContextValue>({
  currentPodcast: null,
  playPodcast: () => {},
  stopPodcast: () => {},
});

export function PodcastProvider({ children }: { children: ReactNode }) {
  const [currentPodcast, setCurrentPodcast] = useState<PodcastInfo | null>(null);

  const playPodcast = useCallback((url: string, title: string) => {
    setCurrentPodcast({ url, title });
  }, []);

  const stopPodcast = useCallback(() => {
    setCurrentPodcast(null);
  }, []);

  return (
    <PodcastContext.Provider value={{ currentPodcast, playPodcast, stopPodcast }}>
      {children}
    </PodcastContext.Provider>
  );
}

export function usePodcast() {
  return useContext(PodcastContext);
}
