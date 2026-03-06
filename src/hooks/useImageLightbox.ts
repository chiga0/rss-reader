/**
 * useImageLightbox Hook
 * Manages lightbox state for viewing article images in full-screen overlay.
 */

import { useState, useCallback } from 'react';

export interface ImageLightboxState {
  isOpen: boolean;
  currentIndex: number;
  images: string[];
  open: (images: string[], index: number) => void;
  close: () => void;
  next: () => void;
  previous: () => void;
}

export function useImageLightbox(): ImageLightboxState {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [images, setImages] = useState<string[]>([]);

  const open = useCallback((imgs: string[], index: number) => {
    setImages(imgs);
    setCurrentIndex(index);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const next = useCallback(() => {
    if (images.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const previous = useCallback(() => {
    if (images.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  return { isOpen, currentIndex, images, open, close, next, previous };
}
