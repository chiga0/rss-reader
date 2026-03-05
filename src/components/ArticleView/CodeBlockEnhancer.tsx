/**
 * CodeBlockEnhancer Component
 * Adds copy-to-clipboard button to all <pre> code blocks within a container.
 * Uses useEffect to scan the container DOM after article content renders.
 */

import { useEffect, useRef, useCallback } from 'react';

interface CodeBlockEnhancerProps {
  /** Ref to the article content container */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** Dependencies that trigger re-scanning (e.g., sanitized content) */
  deps?: unknown[];
}

export function CodeBlockEnhancer({ containerRef, deps = [] }: CodeBlockEnhancerProps) {
  const buttonsRef = useRef<HTMLButtonElement[]>([]);

  const copyToClipboard = useCallback(async (text: string, button: HTMLButtonElement) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }

    // Show "Copied!" feedback
    const originalText = button.textContent;
    button.textContent = 'Copied!';
    button.classList.add('text-green-500');
    setTimeout(() => {
      button.textContent = originalText;
      button.classList.remove('text-green-500');
    }, 2000);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clean up previous buttons
    buttonsRef.current.forEach((btn) => btn.remove());
    buttonsRef.current = [];

    // Find all <pre> elements
    const preElements = container.querySelectorAll('pre');
    preElements.forEach((pre) => {
      // Skip if already enhanced
      if (pre.querySelector('.code-copy-btn')) return;

      // Ensure pre has position relative for absolute button positioning
      pre.style.position = 'relative';

      const button = document.createElement('button');
      button.className =
        'code-copy-btn absolute top-2 right-2 rounded-md bg-background/80 px-2 py-1 text-xs font-medium text-muted-foreground opacity-0 transition-opacity hover:text-foreground hover:bg-background group-hover:opacity-100';
      button.textContent = 'Copy';
      button.type = 'button';
      button.setAttribute('aria-label', 'Copy code to clipboard');

      // Make pre a group for hover visibility
      pre.classList.add('group');

      // Show button on hover
      pre.addEventListener('mouseenter', () => {
        button.style.opacity = '1';
      });
      pre.addEventListener('mouseleave', () => {
        if (button.textContent !== 'Copied!') {
          button.style.opacity = '0';
        }
      });

      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const code = pre.querySelector('code');
        const text = code?.textContent || pre.textContent || '';
        copyToClipboard(text, button);
      });

      pre.appendChild(button);
      buttonsRef.current.push(button);
    });

    return () => {
      buttonsRef.current.forEach((btn) => btn.remove());
      buttonsRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, copyToClipboard, ...deps]);

  return null;
}
