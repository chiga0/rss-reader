/**
 * Integration test: Image Lightbox Workflow
 * Tests the complete image lightbox experience:
 * hook state management → component rendering → user interactions
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { useImageLightbox } from '@hooks/useImageLightbox';
import { ImageLightbox } from '@components/ArticleView/ImageLightbox';

// Integration component wiring hook + lightbox
function LightboxIntegration({ images }: { images: string[] }) {
  const lightbox = useImageLightbox();

  return (
    <div>
      {/* Simulated article images */}
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={`Article image ${i + 1}`}
          onClick={() => lightbox.open(images, i)}
          data-testid={`article-img-${i}`}
        />
      ))}

      {/* Lightbox overlay */}
      <ImageLightbox
        isOpen={lightbox.isOpen}
        images={lightbox.images}
        currentIndex={lightbox.currentIndex}
        onClose={lightbox.close}
        onNext={lightbox.next}
        onPrevious={lightbox.previous}
      />
    </div>
  );
}

describe('Image Lightbox Workflow Integration', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.style.overflow = '';
  });

  it('complete workflow: click image → lightbox opens → navigate → close', () => {
    const images = ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'];
    render(<LightboxIntegration images={images} />);

    // Initially, no lightbox
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Click second image
    fireEvent.click(screen.getByTestId('article-img-1'));

    // Lightbox opens showing second image
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByAltText('Image 2 of 3')).toBeInTheDocument();
    expect(screen.getByText('2 / 3')).toBeInTheDocument();

    // Navigate to next image
    fireEvent.click(screen.getByLabelText('Next image'));
    expect(screen.getByAltText('Image 3 of 3')).toBeInTheDocument();
    expect(screen.getByText('3 / 3')).toBeInTheDocument();

    // Navigate back
    fireEvent.click(screen.getByLabelText('Previous image'));
    expect(screen.getByAltText('Image 2 of 3')).toBeInTheDocument();

    // Close via button
    fireEvent.click(screen.getByLabelText('Close lightbox'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('keyboard navigation: arrows + escape', () => {
    const images = ['a.jpg', 'b.jpg', 'c.jpg'];
    render(<LightboxIntegration images={images} />);

    // Open first image
    fireEvent.click(screen.getByTestId('article-img-0'));
    expect(screen.getByAltText('Image 1 of 3')).toBeInTheDocument();

    // Arrow right → next image
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(screen.getByAltText('Image 2 of 3')).toBeInTheDocument();

    // Arrow right again
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(screen.getByAltText('Image 3 of 3')).toBeInTheDocument();

    // Arrow right wraps to first
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(screen.getByAltText('Image 1 of 3')).toBeInTheDocument();

    // Arrow left wraps to last
    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    expect(screen.getByAltText('Image 3 of 3')).toBeInTheDocument();

    // Escape closes
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('body scroll is locked while lightbox is open', () => {
    const images = ['img.jpg'];
    render(<LightboxIntegration images={images} />);

    expect(document.body.style.overflow).toBe('');

    // Open lightbox
    fireEvent.click(screen.getByTestId('article-img-0'));
    expect(document.body.style.overflow).toBe('hidden');

    // Close lightbox
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(document.body.style.overflow).toBe('');
  });

  it('single image: no navigation arrows, no counter', () => {
    render(<LightboxIntegration images={['single.jpg']} />);

    fireEvent.click(screen.getByTestId('article-img-0'));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.queryByLabelText('Previous image')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Next image')).not.toBeInTheDocument();
    expect(screen.queryByText(/\d+ \/ \d+/)).not.toBeInTheDocument();
  });

  it('opening different images shows correct starting position', () => {
    const images = ['first.jpg', 'second.jpg', 'third.jpg'];
    render(<LightboxIntegration images={images} />);

    // Open third image
    fireEvent.click(screen.getByTestId('article-img-2'));
    expect(screen.getByText('3 / 3')).toBeInTheDocument();
    expect(screen.getByAltText('Image 3 of 3')).toHaveAttribute('src', 'third.jpg');

    // Close and reopen first
    fireEvent.keyDown(document, { key: 'Escape' });
    fireEvent.click(screen.getByTestId('article-img-0'));
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
    expect(screen.getByAltText('Image 1 of 3')).toHaveAttribute('src', 'first.jpg');
  });

  it('backdrop click closes lightbox', () => {
    render(<LightboxIntegration images={['img.jpg']} />);

    fireEvent.click(screen.getByTestId('article-img-0'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Click backdrop (the dialog container)
    fireEvent.click(screen.getByRole('dialog'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('hook state transitions are consistent', () => {
    const { result } = renderHook(() => useImageLightbox());

    // Initial state
    expect(result.current.isOpen).toBe(false);
    expect(result.current.images).toEqual([]);
    expect(result.current.currentIndex).toBe(0);

    // Open with images
    act(() => {
      result.current.open(['a.jpg', 'b.jpg'], 1);
    });
    expect(result.current.isOpen).toBe(true);
    expect(result.current.images).toEqual(['a.jpg', 'b.jpg']);
    expect(result.current.currentIndex).toBe(1);

    // Navigate
    act(() => {
      result.current.next();
    });
    expect(result.current.currentIndex).toBe(0); // wraps

    // Close
    act(() => {
      result.current.close();
    });
    expect(result.current.isOpen).toBe(false);
  });
});
