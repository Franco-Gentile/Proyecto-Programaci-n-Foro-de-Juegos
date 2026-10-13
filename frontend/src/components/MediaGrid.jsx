import { useState } from 'react';
import MediaLightbox from './MediaLightbox';

export function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11
    ? `https://www.youtube-nocookie.com/embed/${match[2]}`
    : null;
}

function MediaGrid({ mediaItems = [], imageUrl = null }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Normalizar ítems si solo viene imageUrl clásica
  let items = Array.isArray(mediaItems) && mediaItems.length > 0 ? mediaItems : [];
  if (items.length === 0 && imageUrl) {
    items = [{ id: 'legacy-img', media_type: 'IMAGE', url: imageUrl }];
  }

  if (items.length === 0) return null;

  // Separar videos y YouTube de imágenes
  const videoItem = items.find((m) => m.media_type === 'VIDEO');
  const youtubeItem = items.find((m) => m.media_type === 'YOUTUBE');
  const images = items.filter((m) => m.media_type === 'IMAGE' || (!m.media_type && m.url));

  // Si hay YouTube
  if (youtubeItem) {
    const embedUrl = getYouTubeEmbedUrl(youtubeItem.url || youtubeItem.media_url);
    if (embedUrl) {
      return (
        <div className="media-container media-youtube-wrapper my-3">
          <iframe
            src={embedUrl}
            title="Video de YouTube"
            className="media-youtube-iframe"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      );
    }
  }

  // Si hay video HTML5
  if (videoItem) {
    const src = videoItem.url || videoItem.file || videoItem.media_url;
    return (
      <div className="media-container media-video-wrapper my-3">
        <video
          src={src}
          controls
          preload="metadata"
          className="media-video-player"
        >
          Tu navegador no soporta la reproducción de video.
        </video>
      </div>
    );
  }

  // Cuadrícula de fotos estilo X (1 a 4 imágenes)
  const displayImages = images.slice(0, 4);
  const count = displayImages.length;
  if (count === 0) return null;

  const handleOpenImage = (idx) => {
    setLightboxIndex(idx);
    setLightboxOpen(true);
  };

  return (
    <>
      <div className={`media-x-grid media-x-grid-${count} my-3`}>
        {displayImages.map((img, idx) => {
          const src = img.url || img.file || img.media_url;
          return (
            <div
              key={img.id || idx}
              className={`media-x-cell cell-${idx}`}
              onClick={() => handleOpenImage(idx)}
            >
              <img
                src={src}
                alt={`Adjunto ${idx + 1}`}
                className="media-x-img"
                loading="lazy"
              />
            </div>
          );
        })}
      </div>

      <MediaLightbox
        images={displayImages}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}

export default MediaGrid;
