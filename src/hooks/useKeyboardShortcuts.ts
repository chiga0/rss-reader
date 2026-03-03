/**
 * Keyboard Shortcuts Hook
 * Registers global keydown listeners, ignoring events from input elements.
 */

import { useEffect, useRef } from 'react';

/** Tags where keyboard shortcuts should not fire */
const IGNORED_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

/**
 * Register global keyboard shortcuts.
 * @param shortcuts - Map of key to handler function
 */
export function useKeyboardShortcuts(shortcuts: Record<string, () => void>): void {
  // Store latest shortcuts in a ref to avoid re-registering the listener on every render
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement;

      // Ignore events in form elements or contenteditable
      if (
        IGNORED_TAGS.has(target.tagName) ||
        target.isContentEditable
      ) {
        return;
      }

      const handler = shortcutsRef.current[event.key];
      if (handler) {
        event.preventDefault();
        handler();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
