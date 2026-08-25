function PostCard({ username, timeAgo, content, tag, imageUrl }) {
  return (
    <div className="post-card mb-3">
      <div className="post-card-header">
        <span className="post-username">{username}</span>
        <span className="post-avatar">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H4s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/>
          </svg>
        </span>
        <span className="post-time">{timeAgo}</span>
      </div>
      <div className="post-card-body">
        <p className="post-content">{content}</p>
        {tag && <span className="post-tag">{tag}</span>}
        {imageUrl && (
          <div className="post-image-container">
            <img src={imageUrl} alt="Post content" className="post-image" />
          </div>
        )}
      </div>
    </div>
  )
}

export default PostCard
