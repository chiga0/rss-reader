/**
 * ReadingProgressBar Component
 * Fixed thin progress bar at the top of the viewport showing scroll progress.
 * Hidden when the article fits entirely within the viewport.
 */

import { useReadingProgress } from '@hooks/useReadingProgress';

export function ReadingProgressBar() {
  const { progress, isFullyVisible } = useReadingProgress();

  if (isFullyVisible) return null;

  return (
    <div
      className="fixed left-0 right-0 top-0 z-50 h-[3px] bg-muted"
      role="progressbar"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    >
      <div
        className="h-full bg-primary transition-transform duration-150 ease-out"
        style={{
          transformOrigin: 'left',
          transform: `scaleX(${progress})`,
        }}
      />
    </div>
  );
}
