import { useEffect, useState } from 'react';

function MediaLightbox({ images = [], initialIndex = 0, isOpen, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, images.length, onClose]);

  if (!isOpen || images.length === 0) return null;

  const currentImg = images[currentIndex];
  const currentSrc = typeof currentImg === 'string' ? currentImg : currentImg?.url || currentImg?.file;

  return (
    <div
      className="media-lightbox-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="media-lightbox-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="media-lightbox-close"
          onClick={onClose}
          aria-label="Cerrar visor"
        >
          ✕
        </button>

        {images.length > 1 && (
          <div className="media-lightbox-counter">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        <img
          src={currentSrc}
          alt={`Imagen ${currentIndex + 1}`}
          className="media-lightbox-img"
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              className="media-lightbox-nav prev"
              onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
              aria-label="Imagen anterior"
            >
              ❮
            </button>
            <button
              type="button"
              className="media-lightbox-nav next"
              onClick={() => setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
              aria-label="Siguiente imagen"
            >
              ❯
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default MediaLightbox;
