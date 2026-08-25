function PostCard({
  username = 'Charanguito_21',
  avatar = '🐐',
  timeAgo = 'Hace 2 hs',
  content = 'Por fin sale el GTA VI 😭',
  tag = 'GTA VI',
  imageUrl,
}) {
  return (
    <article className="post-card-item">
      {/* Cabecera del post: Autor + Avatar + Fecha */}
      <div className="post-header-row">
        <div className="post-author-group">
          <span className="post-username-badge">{username}</span>
          <span className="post-avatar-circle" role="img" aria-label="Avatar">
            {avatar}
          </span>
        </div>
        <span className="post-timestamp">{timeAgo}</span>
      </div>

      {/* Cuerpo del post */}
      <h3 className="post-content-title">{content}</h3>

      {tag && <div className="post-tag-badge">{tag}</div>}

      {/* Contenedor de medios lavanda */}
      {imageUrl && (
        <div className="post-media-container">
          <img
            src={imageUrl}
            alt={content}
            className="post-media-image"
            loading="lazy"
          />
        </div>
      )}
    </article>
  );
}

export default PostCard;
