/**
 * ToastNotification Component
 * Renders global toast messages in a fixed container
 */

import { useToast } from '@hooks/useToast';

export function ToastNotification() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-16 right-4 z-[100] flex flex-col gap-2 pointer-events-none sm:bottom-4">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`flex items-center justify-between gap-3 rounded-lg px-4 py-3 text-sm font-medium shadow-lg pointer-events-auto transition-all
            ${toast.type === 'success' ? 'bg-green-600 text-white' : ''}
            ${toast.type === 'error' ? 'bg-red-600 text-white' : ''}
            ${toast.type === 'info' ? 'bg-gray-800 text-white dark:bg-gray-700' : ''}
          `}
          role="alert"
        >
          <span>
            {toast.type === 'success' && '✓ '}
            {toast.type === 'error' && '✕ '}
            {toast.message}
          </span>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-2 opacity-80 hover:opacity-100 text-white text-base leading-none"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
