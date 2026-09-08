import { useState } from 'react';
import { createReport } from '../services/forumService';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function ReportModal({ isOpen, onClose, postId = null, commentId = null, title = '' }) {
  const { user } = useAuth();
  const [reason, setReason] = useState('');
  const [presetReason, setPresetReason] = useState('Spam o publicidad');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    const finalReason = reason.trim() ? `${presetReason}: ${reason.trim()}` : presetReason;

    try {
      setLoading(true);
      setError('');
      await createReport({
        post_id: postId,
        comment_id: commentId,
        reason: finalReason,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setReason('');
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Error al enviar la denuncia');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(3px)', zIndex: 1060 }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div
          className="modal-content"
          style={{
            border: '3px solid var(--border-dark)',
            borderRadius: '16px',
            boxShadow: '6px 6px 0px var(--border-dark)',
            backgroundColor: '#ffffff',
          }}
        >
          <div
            className="modal-header"
            style={{
              backgroundColor: '#fee2e2',
              borderBottom: '2.5px solid var(--border-dark)',
              borderTopLeftRadius: '13px',
              borderTopRightRadius: '13px',
            }}
          >
            <h5
              className="modal-title d-flex align-items-center gap-2"
              style={{ fontFamily: 'var(--font-pixel)', fontSize: '15px', color: '#991b1b' }}
            >
              <span>🚨</span> Denunciar Contenido
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Cerrar"
            ></button>
          </div>

          <div className="modal-body p-4">
            {!user ? (
              <div className="text-center py-3">
                <p className="mb-3">Tenés que iniciar sesión para reportar una publicación o comentario.</p>
                <Link to="/login" className="btn btn-primary" onClick={onClose}>
                  Iniciar Sesión
                </Link>
              </div>
            ) : success ? (
              <div className="alert alert-success text-center py-3 mb-0" role="alert">
                <div style={{ fontSize: '32px' }}>✅</div>
                <strong>¡Reporte enviado!</strong>
                <p className="mb-0 small text-muted">El equipo de moderación revisará este caso a la brevedad.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {title && (
                  <p className="small text-muted mb-3">
                    Estás reportando: <strong>{title}</strong>
                  </p>
                )}

                {error && (
                  <div className="alert alert-danger py-2 small mb-3" role="alert">
                    {error}
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label fw-bold small">Motivo principal:</label>
                  <select
                    className="form-select"
                    value={presetReason}
                    onChange={(e) => setPresetReason(e.target.value)}
                    style={{ border: '2px solid var(--border-dark)', borderRadius: '8px' }}
                  >
                    <option value="Spam o publicidad">Spam o publicidad engañosa</option>
                    <option value="Lenguaje ofensivo o de odio">Lenguaje ofensivo, agresivo o de odio</option>
                    <option value="Contenido inapropiado / NSFW">Contenido inapropiado o explícito</option>
                    <option value="Acoso o intimidación">Acoso o intimidación</option>
                    <option value="Información engañosa o falsa">Información falsa o desinformación</option>
                    <option value="Otro motivo">Otro motivo</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold small">Detalles adicionales (opcional):</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Contanos un poco más para que el moderador lo entienda..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    style={{ border: '2px solid var(--border-dark)', borderRadius: '8px' }}
                  ></textarea>
                </div>

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-danger d-flex align-items-center gap-2"
                    disabled={loading}
                    style={{
                      border: '2px solid var(--border-dark)',
                      boxShadow: '2px 2px 0px var(--border-dark)',
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '12px',
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                        Enviando...
                      </>
                    ) : (
                      'Enviar Reporte'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportModal;
