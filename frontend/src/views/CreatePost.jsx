import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MentionTextarea from '../components/MentionTextarea';
import GameCategoryPicker from '../components/GameCategoryPicker';
import { getYouTubeEmbedUrl } from '../components/MediaGrid';
import { getGames, getCategories, createPost } from '../services/forumService';

const MAX_IMAGES = 4;
const MAX_VIDEO_SIZE_MB = 50;

function CreatePost() {
  const [searchParams] = useSearchParams();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Estados multimedia (estilo X)
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [showYoutubeInput, setShowYoutubeInput] = useState(false);

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const initialGameId = searchParams.get('game');
    const initialCategoryId = searchParams.get('category');

    async function preselectParams() {
      try {
        if (initialGameId) {
          const gamesList = await getGames();
          if (isMounted) {
            const found = gamesList.find((g) => String(g.id) === String(initialGameId));
            if (found) setSelectedGame(found);
          }
        }
        if (initialCategoryId) {
          const catsList = await getCategories();
          if (isMounted) {
            const found = catsList.find((c) => String(c.id) === String(initialCategoryId));
            if (found) setSelectedCategory(found);
          }
        }
      } catch (err) {
        console.error('Error al preseleccionar desde URL:', err);
      }
    }

    if (initialGameId || initialCategoryId) {
      preselectParams();
    }

    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  // Limpieza de URLs creadas con URL.createObjectURL
  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
      if (videoPreview) URL.revokeObjectURL(videoPreview);
    };
  }, [imagePreviews, videoPreview]);

  // Manejar selección de imágenes
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (videoFile || youtubeUrl) {
      setError('Al igual que en X, no podés mezclar video con imágenes en el mismo post.');
      return;
    }

    const remainingSlots = MAX_IMAGES - imageFiles.length;
    if (remainingSlots <= 0) {
      setError(`Solo podés adjuntar un máximo de ${MAX_IMAGES} fotos.`);
      return;
    }

    const allowedFiles = files.slice(0, remainingSlots);
    const newPreviews = allowedFiles.map((file) => URL.createObjectURL(file));

    setImageFiles((prev) => [...prev, ...allowedFiles]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    setError('');

    // Resetear input para permitir volver a seleccionar si se desea
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleRemoveImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Manejar selección de video
  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (imageFiles.length > 0 || youtubeUrl) {
      setError('No podés mezclar imágenes o YouTube con un archivo de video.');
      return;
    }

    // Validar tamaño máx
    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > MAX_VIDEO_SIZE_MB) {
      setError(`El video excede el límite permitido de ${MAX_VIDEO_SIZE_MB} MB (pesa ${sizeInMB.toFixed(1)} MB).`);
      return;
    }

    if (videoPreview) URL.revokeObjectURL(videoPreview);

    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    setError('');

    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handleRemoveVideo = () => {
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoFile(null);
    setVideoPreview(null);
  };

  const handleRemoveYoutube = () => {
    setYoutubeUrl('');
    setShowYoutubeInput(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Por favor completá el título y el contenido.');
      return;
    }
    if (!selectedGame && !selectedCategory) {
      setError('Por favor seleccioná al menos un juego o un género para clasificar tu post.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      let newPost;

      // Si hay archivos subidos, enviar multipart/form-data
      if (imageFiles.length > 0 || videoFile) {
        const formData = new FormData();
        formData.append('title', title.trim());
        formData.append('content', content.trim());
        if (selectedGame) {
          formData.append('game_id', parseInt(selectedGame.id, 10));
        }
        if (selectedCategory) {
          formData.append('category_id', parseInt(selectedCategory.id, 10));
        }

        if (imageFiles.length > 0) {
          imageFiles.forEach((file) => {
            formData.append('media_files', file);
          });
        }

        if (videoFile) {
          formData.append('media_files', videoFile);
        }

        if (youtubeUrl.trim()) {
          formData.append('youtube_url', youtubeUrl.trim());
        }

        newPost = await createPost(formData);
      } else {
        // Enviar JSON convencional
        const payload = {
          title: title.trim(),
          content: content.trim(),
        };
        if (selectedGame) {
          payload.game_id = parseInt(selectedGame.id, 10);
        }
        if (selectedCategory) {
          payload.category_id = parseInt(selectedCategory.id, 10);
        }

        if (youtubeUrl.trim()) {
          payload.youtube_url = youtubeUrl.trim();
        }

        newPost = await createPost(payload);
      }

      // Redirige al nuevo post creado
      navigate(`/posts/${newPost.id}`);
    } catch (err) {
      setError(err.message || 'Ocurrió un error al crear la publicación.');
    } finally {
      setSubmitting(false);
    }
  };

  const ytEmbedPreview = youtubeUrl ? getYouTubeEmbedUrl(youtubeUrl) : null;

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />

      <main className="flex-grow-1 forum-main-layout">
        <div className="container py-4" style={{ maxWidth: '760px' }}>
          <Link
            to="/"
            className="btn btn-outline-dark mb-4 d-inline-flex align-items-center gap-2"
            style={{
              border: '2px solid var(--border-dark)',
              boxShadow: '2px 2px 0px var(--border-dark)',
              fontFamily: 'var(--font-pixel)',
              fontSize: '12px',
              backgroundColor: '#ffffff',
            }}
          >
            ← Volver al Foro
          </Link>

          <div
            className="p-4 p-md-5"
            style={{
              backgroundColor: '#ffffff',
              border: '3px solid var(--border-dark)',
              borderRadius: '20px',
              boxShadow: '6px 6px 0px var(--border-dark)',
            }}
          >
            <div className="text-center mb-4">
              <div
                className="d-inline-block p-2 px-3 mb-2"
                style={{
                  backgroundColor: '#fee2e2',
                  border: '2px solid var(--border-dark)',
                  borderRadius: '10px',
                  boxShadow: '2px 2px 0px var(--border-dark)',
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '13px',
                }}
              >
                🎮 NUEVA PUBLICACIÓN
              </div>
              <h1
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '22px',
                  color: 'var(--text-dark)',
                }}
              >
                Crear Hilo de Debate
              </h1>
              <p className="text-muted small">
                Compartí noticias, dudas, clips, memes o guías con la comunidad gamer.
              </p>
            </div>

            {error && (
              <div
                className="alert alert-danger"
                role="alert"
                style={{
                  border: '2px solid var(--border-dark)',
                  boxShadow: '2px 2px 0px var(--border-dark)',
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Selector interactivo de Juego y/o Género con RAWG */}
              <div className="mb-4">
                <label className="form-label fw-bold small">
                  Juego y / o Género de la publicación <span className="text-danger">*</span>
                </label>
                <GameCategoryPicker
                  selectedGame={selectedGame}
                  selectedCategory={selectedCategory}
                  onSelectGame={setSelectedGame}
                  onSelectCategory={setSelectedCategory}
                />
              </div>

              {/* Título */}
              <div className="mb-3">
                <label className="form-label fw-bold small">
                  Título del post <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej: ¿Qué opinan del nuevo DLC de Elden Ring?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={200}
                  required
                  style={{
                    border: '2px solid var(--border-dark)',
                    borderRadius: '8px',
                    padding: '10px',
                  }}
                />
                <div className="d-flex justify-content-end text-muted small mt-1">
                  {title.length}/200 caracteres
                </div>
              </div>

              {/* Contenido con Menciones Autocomplete */}
              <div className="mb-3">
                <label className="form-label fw-bold small">
                  Contenido de la publicación <span className="text-danger">*</span>
                  <span className="text-muted fw-normal ms-2 small">
                    (Tip: escribí <span className="badge bg-light text-dark border">@</span> para mencionar amigos)
                  </span>
                </label>
                <MentionTextarea
                  rows={5}
                  placeholder="Escribí acá tu reseña, consulta, teoría o mención a otros jugadores..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  style={{
                    border: '2px solid var(--border-dark)',
                    borderRadius: '8px',
                    padding: '12px',
                  }}
                />
              </div>

              {/* Barra de herramientas multimedia (estilo X) */}
              <div
                className="p-3 mb-3"
                style={{
                  backgroundColor: '#f8fafc',
                  border: '2px solid var(--border-dark)',
                  borderRadius: '12px',
                  boxShadow: '2px 2px 0px var(--border-dark)',
                }}
              >
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
                  <span
                    style={{
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '11px',
                      color: 'var(--text-dark)',
                    }}
                  >
                    📎 ADJUNTAR MULTIMEDIA
                  </span>
                  <span className="text-muted small">
                    {imageFiles.length > 0
                      ? `${imageFiles.length}/${MAX_IMAGES} fotos`
                      : videoFile
                      ? '1 video adjunto'
                      : youtubeUrl
                      ? '1 video de YouTube'
                      : 'Hasta 4 fotos o 1 video'}
                  </span>
                </div>

                <div className="d-flex align-items-center gap-2 flex-wrap">
                  {/* Botón Fotos */}
                  <input
                    type="file"
                    ref={imageInputRef}
                    accept="image/*"
                    multiple
                    className="d-none"
                    onChange={handleImageSelect}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-dark d-flex align-items-center gap-1"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={videoFile !== null || !!youtubeUrl || imageFiles.length >= MAX_IMAGES}
                    style={{
                      border: '1.5px solid var(--border-dark)',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '12px',
                    }}
                  >
                    🖼️ Fotos {imageFiles.length > 0 && `(${imageFiles.length}/${MAX_IMAGES})`}
                  </button>

                  {/* Botón Video */}
                  <input
                    type="file"
                    ref={videoInputRef}
                    accept="video/mp4,video/webm"
                    className="d-none"
                    onChange={handleVideoSelect}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-dark d-flex align-items-center gap-1"
                    onClick={() => videoInputRef.current?.click()}
                    disabled={imageFiles.length > 0 || videoFile !== null || !!youtubeUrl}
                    style={{
                      border: '1.5px solid var(--border-dark)',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '12px',
                    }}
                  >
                    🎬 Video MP4
                  </button>

                  {/* Botón YouTube */}
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                    onClick={() => setShowYoutubeInput((prev) => !prev)}
                    disabled={imageFiles.length > 0 || videoFile !== null}
                    style={{
                      border: '1.5px solid var(--border-dark)',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '12px',
                    }}
                  >
                    🔴 YouTube
                  </button>

                  {/* Atajo rápido para arrobar */}
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                    onClick={() => setContent((prev) => `${prev}@`)}
                    style={{
                      border: '1.5px solid var(--border-dark)',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '12px',
                    }}
                  >
                    👥 @Mencionar
                  </button>
                </div>

                {/* Input desplegable para URL de YouTube */}
                {showYoutubeInput && !videoFile && imageFiles.length === 0 && (
                  <div className="mt-3">
                    <label className="form-label small fw-bold">Enlace del video de YouTube:</label>
                    <div className="input-group">
                      <input
                        type="url"
                        className="form-control form-control-sm"
                        placeholder="Ej: https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        style={{ border: '2px solid var(--border-dark)' }}
                      />
                      {youtubeUrl && (
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                          onClick={handleRemoveYoutube}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Previews de imágenes */}
                {imagePreviews.length > 0 && (
                  <div className="media-previews-container">
                    {imagePreviews.map((url, idx) => (
                      <div key={idx} className="media-preview-item">
                        <img src={url} alt={`Previsualización ${idx + 1}`} />
                        <button
                          type="button"
                          className="btn-remove-preview"
                          onClick={() => handleRemoveImage(idx)}
                          title="Quitar foto"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Preview de video subido */}
                {videoPreview && (
                  <div className="position-relative mt-3" style={{ maxWidth: '360px' }}>
                    <video
                      src={videoPreview}
                      controls
                      className="rounded border border-dark w-100"
                      style={{ maxHeight: '200px', backgroundColor: '#000000' }}
                    />
                    <button
                      type="button"
                      className="btn-remove-preview"
                      onClick={handleRemoveVideo}
                      title="Quitar video"
                      style={{ top: '8px', right: '8px' }}
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Preview de video YouTube */}
                {ytEmbedPreview && (
                  <div className="position-relative mt-3" style={{ maxWidth: '420px' }}>
                    <div className="ratio ratio-16x9 rounded overflow-hidden border border-dark">
                      <iframe src={ytEmbedPreview} title="YouTube preview" allowFullScreen></iframe>
                    </div>
                    <button
                      type="button"
                      className="btn-remove-preview"
                      onClick={handleRemoveYoutube}
                      title="Quitar enlace de YouTube"
                      style={{ top: '8px', right: '8px' }}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* Botón Submit */}
              <div className="d-flex justify-content-end gap-2 mt-4">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => navigate('/')}
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-success d-flex align-items-center gap-2 px-4"
                  disabled={submitting}
                  style={{
                    border: '2.5px solid var(--border-dark)',
                    boxShadow: '3px 3px 0px var(--border-dark)',
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '13px',
                    backgroundColor: '#10b981',
                  }}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                      Publicando...
                    </>
                  ) : (
                    'Lanzar Post 🚀'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default CreatePost;
