import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ReportModal from '../components/ReportModal';
import { useAuth } from '../context/AuthContext';
import {
  getPostById,
  getComments,
  createComment,
  deleteComment,
  deletePost,
} from '../services/forumService';

function getTimeAgo(dateString) {
  if (!dateString) return 'Hace un momento';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return `Hace un momento`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} hs`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `Hace ${days} d`;
  const months = Math.floor(days / 30);
  if (months < 12) return `Hace ${months} meses`;
  const years = Math.floor(days / 365);
  return `Hace ${years} años`;
}

function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Formulario nuevo comentario
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState('');

  // Report modal
  const [reportModalState, setReportModalState] = useState({
    isOpen: false,
    postId: null,
    commentId: null,
    title: '',
  });

  const loadPostAndComments = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [postData, commentsData] = await Promise.all([
        getPostById(id),
        getComments(id),
      ]);
      setPost(postData);
      setComments(commentsData);
    } catch (err) {
      setError(err.message || 'No se pudo cargar la publicación.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPostAndComments();
  }, [loadPostAndComments]);

  const handleCreateComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmittingComment(true);
      setCommentError('');
      const created = await createComment({
        post_id: id,
        content: newComment.trim(),
      });
      setComments((prev) => [created, ...prev]);
      setNewComment('');
    } catch (err) {
      setCommentError(err.message || 'No se pudo enviar el comentario');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('¿Deseás eliminar este comentario?')) return;
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      alert(err.message || 'Error al eliminar el comentario');
    }
  };

  const handleDeleteCurrentPost = async () => {
    if (!window.confirm('¿Estás seguro de eliminar esta publicación completa?')) return;
    try {
      await deletePost(id);
      navigate('/');
    } catch (err) {
      alert(err.message || 'Error al eliminar la publicación');
    }
  };

  const isOwnerOrAdmin = (authorId, authorUsername) => {
    if (!user) return false;
    if (user.role === 'ADMIN' || user.role === 'MODERATOR') return true;
    if (authorId && authorId === user.id) return true;
    if (authorUsername && authorUsername === user.username) return true;
    return false;
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />

      <main className="flex-grow-1 forum-main-layout">
        <div className="container py-4" style={{ maxWidth: '820px' }}>
          {/* Botón Volver */}
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

          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando publicación...</span>
              </div>
              <p className="mt-3 text-muted" style={{ fontFamily: 'var(--font-pixel)' }}>
                Cargando hilo de conversación...
              </p>
            </div>
          )}

          {error && !loading && (
            <div
              className="alert alert-danger text-center py-4"
              style={{
                border: '3px solid var(--border-dark)',
                borderRadius: '16px',
                boxShadow: '4px 4px 0px var(--border-dark)',
              }}
            >
              <h4>Error al cargar el hilo</h4>
              <p className="mb-0">{error}</p>
            </div>
          )}

          {!loading && post && (
            <>
              {/* Tarjeta Principal del Post */}
              <article
                className="p-4 mb-4"
                style={{
                  backgroundColor: '#ffffff',
                  border: '3px solid var(--border-dark)',
                  borderRadius: '16px',
                  boxShadow: '5px 5px 0px var(--border-dark)',
                }}
              >
                {/* Cabecera del post */}
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <span className="post-username-badge">
                      {typeof post.user === 'string'
                        ? post.user
                        : post.user?.username || 'Usuario'}
                    </span>
                    {post.user?.role && post.user.role !== 'USER' && (
                      <span
                        className="badge"
                        style={{
                          backgroundColor:
                            post.user.role === 'ADMIN' ? '#fef08a' : '#e9d5ff',
                          color:
                            post.user.role === 'ADMIN' ? '#854d0e' : '#6b21a8',
                          border: '1.5px solid var(--border-dark)',
                          fontFamily: 'var(--font-pixel)',
                          fontSize: '10px',
                        }}
                      >
                        {post.user.role === 'ADMIN' ? '👑 ADMIN' : '🛡️ MOD'}
                      </span>
                    )}
                    <span className="post-avatar-circle" role="img" aria-label="Avatar">
                      🎮
                    </span>
                  </div>

                  <div className="d-flex align-items-center gap-3">
                    <span className="post-timestamp">{getTimeAgo(post.created_at)}</span>
                    {isOwnerOrAdmin(post.user?.id, post.user?.username || post.user) && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={handleDeleteCurrentPost}
                        title="Eliminar publicación"
                        style={{
                          border: '1.5px solid #ef4444',
                          fontFamily: 'var(--font-pixel)',
                          fontSize: '11px',
                        }}
                      >
                        🗑️ Eliminar
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-sm btn-link text-muted p-0"
                      title="Reportar esta publicación"
                      onClick={() =>
                        setReportModalState({
                          isOpen: true,
                          postId: post.id,
                          commentId: null,
                          title: post.title,
                        })
                      }
                      style={{ fontSize: '14px', textDecoration: 'none' }}
                    >
                      🚨 Denunciar
                    </button>
                  </div>
                </div>

                {/* Título y Categoría */}
                <h1
                  className="mb-3"
                  style={{
                    fontSize: '26px',
                    fontWeight: 800,
                    color: 'var(--text-dark)',
                  }}
                >
                  {post.title}
                </h1>

                {post.category && (
                  <div className="mb-3">
                    <span className="post-tag-badge">
                      🏷️ {typeof post.category === 'string' ? post.category : post.category?.name}
                    </span>
                  </div>
                )}

                {/* Contenido del post */}
                <div
                  className="post-detail-content mb-4"
                  style={{
                    fontSize: '16px',
                    lineHeight: '1.7',
                    color: '#1f2937',
                    whiteSpace: 'pre-line',
                    wordBreak: 'break-word',
                  }}
                >
                  {post.content}
                </div>

                {/* Imagen del post si existe */}
                {post.images && post.images.length > 0 && (
                  <div className="post-media-container mb-3">
                    <img
                      src={post.images[0].image_url}
                      alt={post.title}
                      className="post-media-image"
                      loading="lazy"
                    />
                  </div>
                )}
              </article>

              {/* Sección de Comentarios */}
              <section
                className="p-4"
                style={{
                  backgroundColor: '#ffffff',
                  border: '3px solid var(--border-dark)',
                  borderRadius: '16px',
                  boxShadow: '5px 5px 0px var(--border-dark)',
                }}
              >
                <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-2">
                  <h3
                    className="mb-0"
                    style={{
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '18px',
                      color: 'var(--text-dark)',
                    }}
                  >
                    💬 Respuestas y Discusión ({comments.length})
                  </h3>
                </div>

                {/* Formulario de nuevo comentario */}
                {user ? (
                  <form onSubmit={handleCreateComment} className="mb-4">
                    {commentError && (
                      <div className="alert alert-danger py-2 small mb-2">{commentError}</div>
                    )}
                    <div className="mb-2">
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder={`Escribí una respuesta como @${user.username}...`}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        required
                        style={{
                          border: '2px solid var(--border-dark)',
                          borderRadius: '10px',
                          boxShadow: '2px 2px 0px var(--border-dark)',
                        }}
                      ></textarea>
                    </div>
                    <div className="d-flex justify-content-end">
                      <button
                        type="submit"
                        className="btn btn-primary d-flex align-items-center gap-2"
                        disabled={submittingComment || !newComment.trim()}
                        style={{
                          border: '2px solid var(--border-dark)',
                          boxShadow: '2px 2px 0px var(--border-dark)',
                          fontFamily: 'var(--font-pixel)',
                          fontSize: '12px',
                          backgroundColor: '#6366f1',
                        }}
                      >
                        {submittingComment ? (
                          <>
                            <span className="spinner-border spinner-border-sm" role="status"></span>
                            Publicando...
                          </>
                        ) : (
                          'Responder 🚀'
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div
                    className="alert text-center py-3 mb-4"
                    style={{
                      backgroundColor: '#f1f5f9',
                      border: '2px dashed var(--border-dark)',
                      borderRadius: '10px',
                    }}
                  >
                    <span>🎮 Para unirte a la discusión tenés que estar registrado. </span>
                    <Link to="/login" className="fw-bold text-decoration-underline ms-1">
                      Iniciar Sesión
                    </Link>
                  </div>
                )}

                {/* Lista de comentarios */}
                {comments.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    <p className="mb-1" style={{ fontSize: '28px' }}>💭</p>
                    <p className="mb-0 small">Aún no hay respuestas en este hilo. ¡Sé el primero en comentar!</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {comments.map((comment) => {
                      const commentAuthor =
                        typeof comment.user === 'string'
                          ? comment.user
                          : comment.user?.username || 'Usuario';
                      const commentAuthorId = comment.user?.id;
                      const commentAuthorRole = comment.user?.role || 'USER';

                      return (
                        <div
                          key={comment.id}
                          className="p-3"
                          style={{
                            backgroundColor: '#f8fafc',
                            border: '2px solid var(--border-dark)',
                            borderRadius: '12px',
                            boxShadow: '2px 2px 0px var(--border-dark)',
                          }}
                        >
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <div className="d-flex align-items-center gap-2">
                              <span
                                className="badge"
                                style={{
                                  backgroundColor: '#cbd5e1',
                                  color: '#0f172a',
                                  border: '1px solid var(--border-dark)',
                                  fontFamily: 'var(--font-pixel)',
                                  fontSize: '10px',
                                }}
                              >
                                {commentAuthor}
                              </span>
                              {commentAuthorRole === 'ADMIN' && (
                                <span className="badge bg-warning text-dark px-1" style={{ fontSize: '9px' }}>
                                  👑 ADMIN
                                </span>
                              )}
                              {commentAuthorRole === 'MODERATOR' && (
                                <span
                                  className="badge text-white px-1"
                                  style={{ backgroundColor: '#8b5cf6', fontSize: '9px' }}
                                >
                                  🛡️ MOD
                                </span>
                              )}
                              <span className="text-muted small" style={{ fontSize: '11px' }}>
                                {getTimeAgo(comment.created_at)}
                              </span>
                            </div>

                            <div className="d-flex align-items-center gap-2">
                              {isOwnerOrAdmin(commentAuthorId, commentAuthor) && (
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger p-0 px-1"
                                  title="Eliminar comentario"
                                  onClick={() => handleDeleteComment(comment.id)}
                                  style={{ fontSize: '10px', border: '1px solid #ef4444' }}
                                >
                                  🗑️
                                </button>
                              )}
                              <button
                                type="button"
                                className="btn btn-sm btn-link text-muted p-0"
                                title="Reportar comentario"
                                onClick={() =>
                                  setReportModalState({
                                    isOpen: true,
                                    postId: null,
                                    commentId: comment.id,
                                    title: `Comentario de @${commentAuthor}`,
                                  })
                                }
                                style={{ fontSize: '12px', textDecoration: 'none' }}
                              >
                                🚨
                              </button>
                            </div>
                          </div>

                          <p
                            className="mb-0"
                            style={{
                              fontSize: '14px',
                              lineHeight: '1.5',
                              color: '#334155',
                              whiteSpace: 'pre-line',
                              wordBreak: 'break-word',
                            }}
                          >
                            {comment.content}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>

      <ReportModal
        isOpen={reportModalState.isOpen}
        onClose={() => setReportModalState({ isOpen: false, postId: null, commentId: null, title: '' })}
        postId={reportModalState.postId}
        commentId={reportModalState.commentId}
        title={reportModalState.title}
      />

      <Footer />
    </div>
  );
}

export default PostDetail;
