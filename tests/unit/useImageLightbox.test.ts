/**
 * Unit tests for useImageLightbox hook
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useImageLightbox } from '@hooks/useImageLightbox';

describe('useImageLightbox', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with closed state', () => {
    const { result } = renderHook(() => useImageLightbox());
    expect(result.current.isOpen).toBe(false);
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.images).toEqual([]);
  });

  it('opens lightbox with correct index', () => {
    const images = ['img1.jpg', 'img2.jpg', 'img3.jpg'];
    const { result } = renderHook(() => useImageLightbox());

    act(() => {
      result.current.open(images, 1);
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.currentIndex).toBe(1);
    expect(result.current.images).toEqual(images);
  });

  it('closes lightbox', () => {
    const { result } = renderHook(() => useImageLightbox());

    act(() => {
      result.current.open(['img1.jpg'], 0);
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.close();
    });
    expect(result.current.isOpen).toBe(false);
  });

  it('navigates to next image', () => {
    const { result } = renderHook(() => useImageLightbox());

    act(() => {
      result.current.open(['img1.jpg', 'img2.jpg', 'img3.jpg'], 0);
    });

    act(() => {
      result.current.next();
    });
    expect(result.current.currentIndex).toBe(1);
  });

  it('wraps around to first image when next at end', () => {
    const { result } = renderHook(() => useImageLightbox());

    act(() => {
      result.current.open(['img1.jpg', 'img2.jpg'], 1);
    });

    act(() => {
      result.current.next();
    });
    expect(result.current.currentIndex).toBe(0);
  });

  it('navigates to previous image', () => {
    const { result } = renderHook(() => useImageLightbox());

    act(() => {
      result.current.open(['img1.jpg', 'img2.jpg', 'img3.jpg'], 2);
    });

    act(() => {
      result.current.previous();
    });
    expect(result.current.currentIndex).toBe(1);
  });

  it('wraps around to last image when previous at start', () => {
    const { result } = renderHook(() => useImageLightbox());

    act(() => {
      result.current.open(['img1.jpg', 'img2.jpg'], 0);
    });

    act(() => {
      result.current.previous();
    });
    expect(result.current.currentIndex).toBe(1);
  });

  it('does not navigate when only one image', () => {
    const { result } = renderHook(() => useImageLightbox());

    act(() => {
      result.current.open(['img1.jpg'], 0);
    });

    act(() => {
      result.current.next();
    });
    expect(result.current.currentIndex).toBe(0);

    act(() => {
      result.current.previous();
    });
    expect(result.current.currentIndex).toBe(0);
  });
});
