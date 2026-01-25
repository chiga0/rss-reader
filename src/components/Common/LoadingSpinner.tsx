/**
 * LoadingSpinner Component
 * Displays a loading spinner with optional message
 */

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ message, size = 'md' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-8">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-primary border-t-transparent`}
        role="status"
        aria-label="Loading"
      />
      {message && <p className="text-sm text-secondary">{message}</p>}
    </div>
  );
}
