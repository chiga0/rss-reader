import { useRef, useEffect, useState, useCallback } from 'react';
import { usePodcast } from '@/contexts/PodcastContext';

interface PodcastPlayerProps {
  url: string;
  title: string;
  duration?: number;
}

const SPEEDS = [1, 1.5, 2] as const;

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function PodcastPlayer({ url, title }: PodcastPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { playPodcast } = usePodcast();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [speed, setSpeed] = useState<1 | 1.5 | 2>(1);

  // Restore saved position on mount
  useEffect(() => {
    const saved = localStorage.getItem(`podcast-pos:${url}`);
    if (saved && audioRef.current) {
      const t = parseFloat(saved);
      if (isFinite(t) && t > 0) {
        audioRef.current.currentTime = t;
        setCurrentTime(t);
      }
    }
  }, [url]);

  // Save position periodically while playing
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      localStorage.setItem(`podcast-pos:${url}`, String(audio.currentTime));
    };
    const onDurationChange = () => setTotalDuration(audio.duration || 0);
    const onPlay = () => {
      setIsPlaying(true);
      playPodcast(url, title);
    };
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      localStorage.removeItem(`podcast-pos:${url}`);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
    };
  }, [url, title, playPodcast]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, []);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const t = parseFloat(e.target.value);
    audio.currentTime = t;
    setCurrentTime(t);
  }, []);

  const skip = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(audio.currentTime + seconds, audio.duration || 0));
  }, []);

  const cycleSpeed = useCallback(() => {
    setSpeed((prev) => {
      const idx = SPEEDS.indexOf(prev);
      const next = SPEEDS[(idx + 1) % SPEEDS.length];
      if (audioRef.current) audioRef.current.playbackRate = next;
      return next;
    });
  }, []);

  return (
    <div className="mb-6 rounded-lg border border-border bg-card p-4">
      <audio ref={audioRef} src={url} preload="metadata" />
      <p className="mb-3 truncate text-sm font-medium text-card-foreground">{title}</p>
      <div className="flex items-center gap-2">
        {/* Skip back */}
        <button
          onClick={() => skip(-30)}
          className="rounded-md p-1.5 text-xs text-muted-foreground hover:text-foreground"
          title="-30s"
        >
          -30s
        </button>

        {/* Play/Pause */}
        <button
          onClick={togglePlay}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <rect x="5" y="4" width="3" height="12" rx="1" />
              <rect x="12" y="4" width="3" height="12" rx="1" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.84A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.27l9.34-5.89a1.5 1.5 0 000-2.54L6.3 2.84z" />
            </svg>
          )}
        </button>

        {/* Skip forward */}
        <button
          onClick={() => skip(30)}
          className="rounded-md p-1.5 text-xs text-muted-foreground hover:text-foreground"
          title="+30s"
        >
          +30s
        </button>

        {/* Seek */}
        <input
          type="range"
          min={0}
          max={totalDuration || 0}
          step={1}
          value={currentTime}
          onChange={handleSeek}
          className="h-1.5 flex-1 cursor-pointer accent-primary"
          aria-label="Seek"
        />

        {/* Time */}
        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
          {formatTime(currentTime)} / {formatTime(totalDuration)}
        </span>

        {/* Speed */}
        <button
          onClick={cycleSpeed}
          className="shrink-0 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
          title="Playback speed"
        >
          {speed}×
        </button>
      </div>
    </div>
  );
}
