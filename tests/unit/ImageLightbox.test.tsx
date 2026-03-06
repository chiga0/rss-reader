/**
 * Unit tests for ImageLightbox component
 * Tests rendering, keyboard navigation, backdrop click, body scroll lock,
 * navigation buttons visibility, and image counter
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ImageLightbox } from '@components/ArticleView/ImageLightbox';

describe('ImageLightbox', () => {
  const defaultProps = {
    isOpen: true,
    images: ['img1.jpg', 'img2.jpg', 'img3.jpg'],
    currentIndex: 0,
    onClose: vi.fn(),
    onNext: vi.fn(),
    onPrevious: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.style.overflow = '';
  });

  // --- Rendering ---

  it('renders nothing when isOpen is false', () => {
    const { container } = render(<ImageLightbox {...defaultProps} isOpen={false} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders nothing when images array is empty', () => {
    const { container } = render(<ImageLightbox {...defaultProps} images={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders dialog when open with images', () => {
    render(<ImageLightbox {...defaultProps} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-label', 'Image lightbox');
  });

  it('renders current image with correct alt text', () => {
    render(<ImageLightbox {...defaultProps} currentIndex={1} />);
    const img = screen.getByAltText('Image 2 of 3');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'img2.jpg');
  });

  // --- Close button ---

  it('renders close button with aria-label', () => {
    render(<ImageLightbox {...defaultProps} />);
    const closeBtn = screen.getByLabelText('Close lightbox');
    expect(closeBtn).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<ImageLightbox {...defaultProps} />);
    const closeBtn = screen.getByLabelText('Close lightbox');
    fireEvent.click(closeBtn);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  // --- Backdrop click ---

  it('calls onClose when backdrop is clicked', () => {
    render(<ImageLightbox {...defaultProps} />);
    const dialog = screen.getByRole('dialog');
    fireEvent.click(dialog);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('does NOT call onClose when image is clicked (stopPropagation)', () => {
    render(<ImageLightbox {...defaultProps} />);
    const img = screen.getByAltText('Image 1 of 3');
    fireEvent.click(img);
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  // --- Navigation buttons with multiple images ---

  it('renders navigation arrows when multiple images', () => {
    render(<ImageLightbox {...defaultProps} />);
    expect(screen.getByLabelText('Previous image')).toBeInTheDocument();
    expect(screen.getByLabelText('Next image')).toBeInTheDocument();
  });

  it('calls onPrevious when previous arrow is clicked', () => {
    render(<ImageLightbox {...defaultProps} />);
    const prevBtn = screen.getByLabelText('Previous image');
    fireEvent.click(prevBtn);
    expect(defaultProps.onPrevious).toHaveBeenCalledTimes(1);
  });

  it('calls onNext when next arrow is clicked', () => {
    render(<ImageLightbox {...defaultProps} />);
    const nextBtn = screen.getByLabelText('Next image');
    fireEvent.click(nextBtn);
    expect(defaultProps.onNext).toHaveBeenCalledTimes(1);
  });

  it('does NOT close when navigation arrows are clicked', () => {
    render(<ImageLightbox {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Previous image'));
    fireEvent.click(screen.getByLabelText('Next image'));
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  // --- Single image ---

  it('hides navigation arrows when single image', () => {
    render(<ImageLightbox {...defaultProps} images={['single.jpg']} />);
    expect(screen.queryByLabelText('Previous image')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Next image')).not.toBeInTheDocument();
  });

  it('hides counter when single image', () => {
    render(<ImageLightbox {...defaultProps} images={['single.jpg']} />);
    expect(screen.queryByText(/\d+ \/ \d+/)).not.toBeInTheDocument();
  });

  // --- Counter ---

  it('shows image counter with correct position', () => {
    render(<ImageLightbox {...defaultProps} currentIndex={1} />);
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  it('shows correct counter for first image', () => {
    render(<ImageLightbox {...defaultProps} currentIndex={0} />);
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('shows correct counter for last image', () => {
    render(<ImageLightbox {...defaultProps} currentIndex={2} />);
    expect(screen.getByText('3 / 3')).toBeInTheDocument();
  });

  // --- Keyboard navigation ---

  it('calls onClose on Escape key', () => {
    render(<ImageLightbox {...defaultProps} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onNext on ArrowRight key', () => {
    render(<ImageLightbox {...defaultProps} />);
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(defaultProps.onNext).toHaveBeenCalledTimes(1);
  });

  it('calls onPrevious on ArrowLeft key', () => {
    render(<ImageLightbox {...defaultProps} />);
    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    expect(defaultProps.onPrevious).toHaveBeenCalledTimes(1);
  });

  it('ignores keyboard events when closed', () => {
    render(<ImageLightbox {...defaultProps} isOpen={false} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  // --- Body scroll lock ---

  it('sets body overflow to hidden when opened', () => {
    render(<ImageLightbox {...defaultProps} />);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body overflow when unmounted', () => {
    const { unmount } = render(<ImageLightbox {...defaultProps} />);
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('');
  });

  // --- Cleanup ---

  it('removes keydown listener on unmount', () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener');
    const { unmount } = render(<ImageLightbox {...defaultProps} />);
    unmount();
    const keydownRemoval = removeSpy.mock.calls.find((call) => call[0] === 'keydown');
    expect(keydownRemoval).toBeDefined();
  });
});
