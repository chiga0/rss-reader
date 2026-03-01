/**
 * OfflineIndicator Component
 * Displays a banner when the app is offline
 */

import { useOfflineDetection } from '@hooks/useOfflineDetection';

export function OfflineIndicator() {
  const { isOnline } = useOfflineDetection();

  if (isOnline) {
    return null; // Don't show anything when online
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 dark:bg-yellow-600 text-gray-900 dark:text-white px-4 py-2 text-center shadow-md"
    >
      <div className="flex items-center justify-center gap-2">
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
          />
        </svg>
        <span className="font-medium text-sm">
          You&apos;re offline - Showing cached content
        </span>
      </div>
    </div>
  );
}
