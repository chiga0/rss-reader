import { useRef, useEffect, useState, useCallback } from 'react';
import { usePodcast } from '@/contexts/PodcastContext';

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function PodcastMiniPlayer() {
  const { currentPodcast, stopPodcast } = usePodcast();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);

  // Sync audio src when currentPodcast changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentPodcast) return;
    if (audio.src !== currentPodcast.url) {
      audio.src = currentPodcast.url;
      const saved = localStorage.getItem(`podcast-pos:${currentPodcast.url}`);
      if (saved) {
        const t = parseFloat(saved);
        if (isFinite(t) && t > 0) audio.currentTime = t;
      }
    }
  }, [currentPodcast]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (currentPodcast) {
        localStorage.setItem(`podcast-pos:${currentPodcast.url}`, String(audio.currentTime));
      }
    };
    const onDurationChange = () => setTotalDuration(audio.duration || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, [currentPodcast]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  }, []);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = parseFloat(e.target.value);
  }, []);

  if (!currentPodcast) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 px-4 py-2 backdrop-blur-sm">
      <audio ref={audioRef} />
      <div className="mx-auto flex max-w-4xl items-center gap-3">
        {/* Play/Pause */}
        <button
          onClick={togglePlay}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
              <rect x="5" y="4" width="3" height="12" rx="1" />
              <rect x="12" y="4" width="3" height="12" rx="1" />
            </svg>
          ) : (
            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.84A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.27l9.34-5.89a1.5 1.5 0 000-2.54L6.3 2.84z" />
            </svg>
          )}
        </button>

        {/* Title */}
        <p className="min-w-0 flex-1 truncate text-xs font-medium text-card-foreground">
          {currentPodcast.title}
        </p>

        {/* Progress */}
        <input
          type="range"
          min={0}
          max={totalDuration || 0}
          step={1}
          value={currentTime}
          onChange={handleSeek}
          className="w-24 cursor-pointer accent-primary sm:w-40"
          aria-label="Seek"
        />
        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
          {formatTime(currentTime)}
        </span>

        {/* Close */}
        <button
          onClick={() => {
            audioRef.current?.pause();
            stopPodcast();
          }}
          className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground"
          aria-label="Close player"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
