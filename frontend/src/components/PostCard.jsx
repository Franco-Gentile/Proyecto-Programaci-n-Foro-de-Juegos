import { Link } from 'react-router-dom';

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

function PostCard({
  id,
  title,
  content,
  username = 'Usuario anónimo',
  userRole = 'USER',
  avatar = '🎮',
  timeAgo = 'Hace un momento',
  tag = 'General',
  imageUrl,
  commentCount = null,
  isGame = false,
  onReport,
  onDelete,
  canDelete = false,
}) {
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

      {/* Título y Contenido */}
      {id ? (
        <Link
          to={`/posts/${id}`}
          className="text-decoration-none"
          style={{ color: 'inherit' }}
        >
          {title && <h3 className="post-content-title mb-2">{title}</h3>}
          <p
            className="text-dark mb-3"
            style={{
              fontSize: '15px',
              lineHeight: '1.5',
              whiteSpace: 'pre-line',
              wordBreak: 'break-word',
            }}
          >
            {content}
          </p>
        </Link>
      ) : (
        <>
          {title && <h3 className="post-content-title mb-2">{title}</h3>}
          <p
            className="text-dark mb-3"
            style={{
              fontSize: '15px',
              lineHeight: '1.5',
              whiteSpace: 'pre-line',
              wordBreak: 'break-word',
            }}
          >
            {content}
          </p>
        </>
      )}

      {/* Tag de Categoría / Juego */}
      {tag && (
        <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
          <div
            className="post-tag-badge mb-0"
            style={{
              backgroundColor: isGame ? '#fef3c7' : '#ede9fe',
              borderColor: isGame ? '#d97706' : '#7c3aed',
              color: isGame ? '#92400e' : '#5b21b6',
            }}
          >
            {isGame ? '🎮 Juego: ' : '🏷️ Género: '}
            <span className="fw-bold">{tag}</span>
          </div>
          {id && (
            <Link
              to={`/posts/${id}`}
              className="text-decoration-none fw-bold"
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '11px',
                color: '#2b3a42',
              }}
            >
              💬 {commentCount !== null ? `${commentCount} Comentarios` : 'Ver discusión →'}
            </Link>
          )}
        </div>
      )}

      {/* Contenedor de medios si tiene imagen */}
      {imageUrl && (
        <div className="post-media-container">
          <img
            src={imageUrl}
            alt={title || content}
            className="post-media-image"
            loading="lazy"
          />
        </div>
      )}
    </article>
  );
}

export default PostCard;
