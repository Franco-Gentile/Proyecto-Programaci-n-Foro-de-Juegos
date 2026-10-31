import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MediaGrid from './MediaGrid';
import FormattedContent from './FormattedContent';
import { useAuth } from '../context/AuthContext';
import { togglePostLike, toggleCommentLike, toggleCommentPin } from '../services/forumService';

function getRoleBadge(role) {
  if (role === 'ADMIN') {
    return (
      <span
        className="badge"
        style={{
          backgroundColor: '#fef08a',
          color: '#854d0e',
          border: '1.5px solid var(--border-dark)',
          fontSize: '9px',
          fontFamily: 'var(--font-pixel)',
        }}
      >
        👑 ADMIN
      </span>
    );
  }
  if (role === 'MODERATOR') {
    return (
      <span
        className="badge"
        style={{
          backgroundColor: '#e9d5ff',
          color: '#6b21a8',
          border: '1.5px solid var(--border-dark)',
          fontSize: '9px',
          fontFamily: 'var(--font-pixel)',
        }}
      >
        🛡️ MOD
      </span>
    );
  }
  return null;
}

function sortCommentsList(list) {
  return [...list].sort((a, b) => {
    if (Boolean(b.is_pinned) !== Boolean(a.is_pinned)) {
      return b.is_pinned ? 1 : -1;
    }
    const likesDiff = (b.likes_count || 0) - (a.likes_count || 0);
    if (likesDiff !== 0) return likesDiff;
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });
}

function PostCard({
  id,
  title,
  content,
  username = 'Usuario anónimo',
  userId = null,
  userRole = 'USER',
  avatar = '🎮',
  timeAgo = 'Hace un momento',
  tag = '',
  game = null,
  category = null,
  imageUrl,
  mediaItems = [],
  commentCount = 0,
  likesCount = 0,
  isLiked = false,
  topComments = [],
  isGame = false,
  onReport,
  onDelete,
  canDelete = false,
}) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [postLikesCount, setPostLikesCount] = useState(likesCount || 0);
  const [postIsLiked, setPostIsLiked] = useState(Boolean(isLiked));
  const [likingPost, setLikingPost] = useState(false);
  const [previewComments, setPreviewComments] = useState(() => sortCommentsList(topComments || []));

  useEffect(() => {
    setPostLikesCount(likesCount || 0);
    setPostIsLiked(Boolean(isLiked));
  }, [likesCount, isLiked]);

  useEffect(() => {
    setPreviewComments(sortCommentsList(topComments || []));
  }, [topComments]);

  const gameName = game ? (typeof game === 'string' ? game : game.name) : (isGame && tag ? tag : null);
  const categoryName = category ? (typeof category === 'string' ? category : category.name) : (!isGame && tag ? tag : null);
  const hasTags = Boolean(gameName || categoryName);

  const isPostCreator = Boolean(
    user &&
      ((userId && Number(user.id) === Number(userId)) ||
        (username && user.username === username) ||
        user.role === 'ADMIN' ||
        user.role === 'MODERATOR')
  );

  const handleTogglePostLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!id || likingPost) return;

    const prevLiked = postIsLiked;
    const prevCount = postLikesCount;
    setPostIsLiked(!prevLiked);
    setPostLikesCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1);
    setLikingPost(true);

    try {
      const res = await togglePostLike(id);
      setPostIsLiked(Boolean(res.is_liked));
      setPostLikesCount(res.likes_count ?? 0);
    } catch (err) {
      setPostIsLiked(prevLiked);
      setPostLikesCount(prevCount);
    } finally {
      setLikingPost(false);
    }
  };

  const handleToggleCommentLike = async (commentId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const res = await toggleCommentLike(commentId);
      setPreviewComments((prev) =>
        sortCommentsList(
          prev.map((c) =>
            c.id === commentId
              ? { ...c, is_liked: Boolean(res.is_liked), likes_count: res.likes_count ?? 0 }
              : c
          )
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleCommentPin = async (commentId) => {
    if (!user) return;
    try {
      const res = await toggleCommentPin(commentId);
      setPreviewComments((prev) =>
        sortCommentsList(
          prev.map((c) => (c.id === commentId ? { ...c, is_pinned: Boolean(res.is_pinned) } : c))
        )
      );
    } catch (err) {
      alert(err.message || 'No se pudo fijar el comentario');
    }
  };

  const totalDiscussions = commentCount !== null && commentCount !== undefined ? commentCount : previewComments.length;
  const displayedComments = previewComments.slice(0, 2);

  return (
    <article className="post-card-item">
      {/* Cabecera del post: Autor + Avatar + Rol + Fecha */}
      <div className="post-header-row">
        <div className="post-author-group">
          <span className="post-username-badge">{username}</span>
          {getRoleBadge(userRole)}
          <span className="post-avatar-circle" role="img" aria-label="Avatar">
            {avatar}
          </span>
        </div>
        <div className="d-flex align-items-center gap-3">
          <span className="post-timestamp">{timeAgo}</span>
          {canDelete && onDelete && (
            <button
              type="button"
              className="btn btn-sm btn-outline-danger p-0 px-2"
              title="Eliminar publicación"
              onClick={() => onDelete(id)}
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-pixel)',
                border: '1.5px solid #ef4444',
              }}
            >
              🗑️
            </button>
          )}
          {onReport && (
            <button
              type="button"
              className="btn btn-sm btn-link text-muted p-0"
              title="Reportar publicación"
              onClick={() => onReport(id, title || content)}
              style={{ fontSize: '13px', textDecoration: 'none' }}
            >
              🚨
            </button>
          )}
        </div>
      </div>

      {/* Título */}
      {title && (
        <div className="mb-2">
          {id ? (
            <Link
              to={`/posts/${id}`}
              className="text-decoration-none"
              style={{ color: 'inherit' }}
            >
              <h3 className="post-content-title mb-0">{title}</h3>
            </Link>
          ) : (
            <h3 className="post-content-title mb-0">{title}</h3>
          )}
        </div>
      )}

      {/* Contenido con menciones activas */}
      <div className="mb-3">
        <FormattedContent content={content} />
      </div>

      {/* Cuadrícula Multimedia (1-4 fotos o video / YouTube) */}
      <MediaGrid mediaItems={mediaItems} imageUrl={imageUrl} />

      {/* Tag de Categoría / Juego + Acciones (Likes y Ver discusiones con contador) */}
      <div className="d-flex align-items-center justify-content-between mb-2 flex-wrap gap-2 pt-2 border-top">
        <div className="d-flex flex-wrap gap-2 align-items-center">
          {hasTags && gameName && (
            <div
              className="post-tag-badge mb-0"
              style={{
                backgroundColor: '#fef3c7',
                borderColor: '#d97706',
                color: '#92400e',
              }}
            >
              🎮 Juego: <span className="fw-bold">{gameName}</span>
            </div>
          )}
          {hasTags && categoryName && (
            <div
              className="post-tag-badge mb-0"
              style={{
                backgroundColor: '#ede9fe',
                borderColor: '#7c3aed',
                color: '#5b21b6',
              }}
            >
              🏷️ Género: <span className="fw-bold">{categoryName}</span>
            </div>
          )}
        </div>

        {id && (
          <div className="d-flex align-items-center gap-3 ms-auto">
            <button
              type="button"
              onClick={handleTogglePostLike}
              disabled={likingPost}
              aria-pressed={postIsLiked}
              title={postIsLiked ? 'Quitar Me gusta' : 'Dar Me gusta'}
              className="btn btn-sm d-inline-flex align-items-center gap-1"
              style={{
                backgroundColor: postIsLiked ? '#fee2e2' : '#f8fafc',
                color: postIsLiked ? '#dc2626' : '#334155',
                border: `1.5px solid ${postIsLiked ? '#ef4444' : 'var(--border-dark)'}`,
                borderRadius: '20px',
                padding: '3px 10px',
                fontFamily: 'var(--font-pixel)',
                fontSize: '10px',
                boxShadow: '1.5px 1.5px 0px var(--border-dark)',
              }}
            >
              <span>{postIsLiked ? '❤️' : '🤍'}</span>
              <span>{postLikesCount}</span>
            </button>

            <Link
              to={`/posts/${id}`}
              className="text-decoration-none fw-bold d-inline-flex align-items-center gap-1"
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '11px',
                color: '#2b3a42',
              }}
            >
              💬 Ver discusiones ({totalDiscussions}) →
            </Link>
          </div>
        )}
      </div>

      {/* Vista previa de hasta 2 comentarios (fijados por el creador o con más likes) */}
      {displayedComments.length > 0 && (
        <div
          className="mt-3 pt-2 border-top"
          style={{
            backgroundColor: '#f8fafc',
            borderRadius: '10px',
            padding: '10px 12px',
            border: '1.5px solid #cbd5e1',
          }}
        >
          <div
            className="d-flex align-items-center justify-content-between mb-2"
            style={{ fontSize: '10px', fontFamily: 'var(--font-pixel)', color: '#475569' }}
          >
            <span>💬 Comentarios destacados</span>
            {totalDiscussions > 2 && id && (
              <Link to={`/posts/${id}`} className="text-decoration-none" style={{ color: '#4f46e5' }}>
                Ver los {totalDiscussions} comentarios →
              </Link>
            )}
          </div>

          <div className="d-flex flex-column gap-2">
            {displayedComments.map((comment) => {
              const cAuthor =
                typeof comment.user === 'string'
                  ? comment.user
                  : comment.user?.username || 'Usuario';
              const cRole = comment.user?.role || 'USER';

              return (
                <div
                  key={comment.id}
                  className="p-2"
                  style={{
                    backgroundColor: comment.is_pinned ? '#fffbeb' : '#ffffff',
                    border: comment.is_pinned ? '1.5px solid #f59e0b' : '1.5px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '13px',
                  }}
                >
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-1 mb-1">
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <span
                        className="badge"
                        style={{
                          backgroundColor: '#e2e8f0',
                          color: '#0f172a',
                          fontFamily: 'var(--font-pixel)',
                          fontSize: '9px',
                        }}
                      >
                        @{cAuthor}
                      </span>
                      {getRoleBadge(cRole)}
                      {comment.is_pinned && (
                        <span
                          className="badge"
                          style={{
                            backgroundColor: '#fef3c7',
                            color: '#b45309',
                            border: '1px solid #f59e0b',
                            fontFamily: 'var(--font-pixel)',
                            fontSize: '9px',
                          }}
                        >
                          📌 Fijado por el creador
                        </span>
                      )}
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      {isPostCreator && (
                        <button
                          type="button"
                          onClick={() => handleToggleCommentPin(comment.id)}
                          title={comment.is_pinned ? 'Desfijar comentario' : 'Fijar comentario'}
                          className="btn btn-sm p-0 px-2"
                          style={{
                            backgroundColor: comment.is_pinned ? '#fef3c7' : '#f1f5f9',
                            color: comment.is_pinned ? '#b45309' : '#64748b',
                            border: '1px solid #cbd5e1',
                            borderRadius: '12px',
                            fontSize: '10px',
                          }}
                        >
                          📌 {comment.is_pinned ? 'Fijado' : 'Fijar'}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleToggleCommentLike(comment.id)}
                        aria-pressed={Boolean(comment.is_liked)}
                        title={comment.is_liked ? 'Quitar Me gusta' : 'Dar Me gusta al comentario'}
                        className="btn btn-sm p-0 px-2 d-inline-flex align-items-center gap-1"
                        style={{
                          backgroundColor: comment.is_liked ? '#fee2e2' : '#f1f5f9',
                          color: comment.is_liked ? '#dc2626' : '#475569',
                          border: `1px solid ${comment.is_liked ? '#fca5a5' : '#cbd5e1'}`,
                          borderRadius: '12px',
                          fontSize: '10px',
                          fontFamily: 'var(--font-pixel)',
                        }}
                      >
                        <span>{comment.is_liked ? '❤️' : '🤍'}</span>
                        <span>{comment.likes_count || 0}</span>
                      </button>
                    </div>
                  </div>

                  <div className="small text-dark">
                    <FormattedContent content={comment.content} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </article>
  );
}

export default PostCard;
