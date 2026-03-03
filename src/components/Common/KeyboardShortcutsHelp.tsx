/**
 * Keyboard Shortcuts Help Modal
 * Displays a table of available keyboard shortcuts.
 */

import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ShortcutRow {
  key: string;
  description: string;
}

const SHORTCUTS: ShortcutRow[] = [
  { key: 'j', description: 'Next article' },
  { key: 'k', description: 'Previous article' },
  { key: 'o / Enter', description: 'Open selected article' },
  { key: 'f', description: 'Toggle favorite' },
  { key: 'r', description: 'Toggle read/unread' },
  { key: 'Escape', description: 'Go back / Close' },
  { key: '?', description: 'Show this help' },
];

interface KeyboardShortcutsHelpProps {
  onClose: () => void;
}

export function KeyboardShortcutsHelp({ onClose }: KeyboardShortcutsHelpProps) {
  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-lg border border-border bg-card shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-sm font-semibold text-card-foreground">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <table className="w-full p-4">
          <tbody>
            {SHORTCUTS.map(({ key, description }) => (
              <tr key={key} className="border-b border-border last:border-0">
                <td className="px-4 py-2">
                  <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 text-xs font-mono text-secondary-foreground">
                    {key}
                  </kbd>
                </td>
                <td className="px-4 py-2 text-sm text-card-foreground">{description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
