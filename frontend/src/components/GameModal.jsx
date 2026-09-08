import { useState, useEffect } from 'react';
import { createCategory, updateCategory } from '../services/forumService';

function GameModal({ isOpen, onClose, onSaved, game = null }) {
  const isEditing = Boolean(game && game.id);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imgLoadError, setImgLoadError] = useState(false);

  useEffect(() => {
    if (game) {
      setName(game.name || '');
      setDescription(game.description || '');
      setImageUrl(game.image_url || '');
    } else {
      setName('');
      setDescription('');
      setImageUrl('');
    }
    setError('');
    setImgLoadError(false);
  }, [game, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre del juego es obligatorio.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      let saved;
      if (isEditing) {
        saved = await updateCategory(game.id, {
          name: name.trim(),
          description: description.trim(),
          image_url: imageUrl.trim(),
          is_genre: false,
        });
      } else {
        saved = await createCategory({
          name: name.trim(),
          description: description.trim(),
          image_url: imageUrl.trim(),
          is_genre: false,
        });
      }

      if (onSaved) {
        onSaved(saved, isEditing);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Error al guardar el juego.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(3px)',
        zIndex: 1060,
      }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div
          className="modal-content"
          style={{
            border: '3px solid var(--border-dark)',
            borderRadius: '20px',
            boxShadow: '6px 6px 0px var(--border-dark)',
            backgroundColor: '#ffffff',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            className="modal-header px-4 py-3"
            style={{
              backgroundColor: isEditing ? '#fef3c7' : '#dbeafe',
              borderBottom: '2.5px solid var(--border-dark)',
            }}
          >
            <h5
              className="modal-title d-flex align-items-center gap-2 mb-0"
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '15px',
                color: isEditing ? '#92400e' : '#1e40af',
              }}
            >
              <span>{isEditing ? '✏️' : '🎮'}</span>
              <span>{isEditing ? `Editar Juego: ${game.name}` : 'Agregar Nuevo Juego al Catálogo'}</span>
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Cerrar"
            ></button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit}>
            <div className="modal-body px-4 py-3">
              {error && (
                <div
                  className="alert alert-danger py-2 small mb-3"
                  role="alert"
                  style={{
                    border: '2px solid var(--border-dark)',
                    boxShadow: '2px 2px 0px var(--border-dark)',
                  }}
                >
                  {error}
                </div>
              )}

              <div className="row g-3">
                <div className="col-12 col-md-7">
                  {/* Nombre */}
                  <div className="mb-3">
                    <label className="form-label fw-bold small">
                      Nombre del Juego <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ej: Dark Souls III, Cyberpunk 2077..."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      style={{
                        border: '2px solid var(--border-dark)',
                        borderRadius: '10px',
                        boxShadow: '1.5px 1.5px 0px var(--border-dark)',
                      }}
                    />
                  </div>

                  {/* Descripción */}
                  <div className="mb-3">
                    <label className="form-label fw-bold small">Descripción / Resumen:</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Breve reseña del juego o temática de la comunidad..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      style={{
                        border: '2px solid var(--border-dark)',
                        borderRadius: '10px',
                        boxShadow: '1.5px 1.5px 0px var(--border-dark)',
                      }}
                    ></textarea>
                  </div>

                  {/* URL Imagen */}
                  <div className="mb-2">
                    <label className="form-label fw-bold small">URL de la Portada:</label>
                    <input
                      type="url"
                      className="form-control"
                      placeholder="https://ejemplo.com/portada.jpg"
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        setImgLoadError(false);
                      }}
                      style={{
                        border: '2px solid var(--border-dark)',
                        borderRadius: '10px',
                        boxShadow: '1.5px 1.5px 0px var(--border-dark)',
                      }}
                    />
                  </div>

                  <div
                    className="p-2 mt-2"
                    style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      border: '1.5px dashed #94a3b8',
                      fontSize: '11px',
                      color: '#475569',
                    }}
                  >
                    💡 <strong>Ajuste simétrico automático:</strong> No importa si la foto es gigante o de alta resolución; el sistema la recortará con proporción 16:9 para mantener todos los cuadros del catálogo perfectamente alineados.
                  </div>
                </div>

                {/* Vista Previa en Vivo (Columna Derecha) */}
                <div className="col-12 col-md-5 d-flex flex-column align-items-center justify-content-center">
                  <label className="form-label fw-bold small w-100 mb-1">
                    Vista previa de la tarjeta:
                  </label>

                  <div
                    style={{
                      width: '100%',
                      maxWidth: '280px',
                      border: '2.5px solid var(--border-dark)',
                      borderRadius: '14px',
                      overflow: 'hidden',
                      boxShadow: '3px 3px 0px var(--border-dark)',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        aspectRatio: '16 / 9',
                        backgroundColor: '#1e293b',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                      }}
                    >
                      {imageUrl && !imgLoadError ? (
                        <img
                          src={imageUrl}
                          alt="Previsualización"
                          onError={() => setImgLoadError(true)}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: 'center',
                          }}
                        />
                      ) : (
                        <div className="text-center p-3 text-white">
                          <div style={{ fontSize: '28px' }}>🎮</div>
                          <span
                            style={{
                              fontFamily: 'var(--font-pixel)',
                              fontSize: '10px',
                              opacity: 0.8,
                            }}
                          >
                            {imgLoadError ? 'Imagen no disponible' : 'Sin imagen'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-2 text-center bg-white border-top" style={{ borderColor: 'var(--border-dark)' }}>
                      <div
                        className="text-truncate fw-bold"
                        style={{
                          fontFamily: 'var(--font-pixel)',
                          fontSize: '12px',
                          color: 'var(--text-dark)',
                        }}
                      >
                        {name.trim() || 'Nombre del juego'}
                      </div>
                      <div className="small text-muted" style={{ fontSize: '10px' }}>
                        16:9 Portada Simétrica
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              className="modal-footer px-4 py-3"
              style={{
                backgroundColor: '#f8fafc',
                borderTop: '2px solid var(--border-dark)',
              }}
            >
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onClose}
                disabled={loading}
                style={{
                  borderRadius: '10px',
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '12px',
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary d-flex align-items-center gap-2"
                disabled={loading}
                style={{
                  border: '2.5px solid var(--border-dark)',
                  borderRadius: '10px',
                  boxShadow: '2.5px 2.5px 0px var(--border-dark)',
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '12px',
                  backgroundColor: '#22c55e',
                  borderColor: '#15803d',
                  color: '#ffffff',
                }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <span>💾</span>
                    <span>{isEditing ? 'Guardar Cambios' : 'Crear Juego'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default GameModal;
