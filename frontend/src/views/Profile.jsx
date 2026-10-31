import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PostCard from '../components/PostCard';
import ProfileEditModal from '../components/ProfileEditModal';
import ReportModal from '../components/ReportModal';
import { useAuth } from '../context/AuthContext';
import { getPosts, deletePost, getMyProfile } from '../services/forumService';

function formatDate(dateStr) {
  if (!dateStr) return 'Reciente';
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function Profile() {
  const { user, updateUser } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'mentions'
  const [myPosts, setMyPosts] = useState([]);
  const [mentionedPosts, setMentionedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [reportModalState, setReportModalState] = useState({
    isOpen: false,
    postId: null,
    commentId: null,
    title: '',
  });

  const handleOpenReport = (postId, title, commentId = null) => {
    setReportModalState({
      isOpen: true,
      postId: postId || null,
      commentId: commentId || null,
      title,
    });
  };

  // Cargar datos completos del perfil del usuario
  const fetchProfileDetails = useCallback(async () => {
    try {
      const data = await getMyProfile();
      setUserProfile(data);
      if (updateUser) {
        updateUser(data);
      }
    } catch (err) {
      console.error('Error cargando detalles del perfil:', err);
    }
  }, [updateUser]);

  useEffect(() => {
    fetchProfileDetails();
  }, [fetchProfileDetails]);

  // Cargar publicaciones y menciones
  const fetchUserPosts = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError('');
      if (activeTab === 'posts') {
        const data = await getPosts({ user: user.id });
        setMyPosts(data.results || []);
      } else {
        const data = await getPosts({ mentioned: user.username });
        setMentionedPosts(data.results || []);
      }
    } catch (err) {
      setError('No se pudieron cargar las publicaciones.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user, activeTab]);

  useEffect(() => {
    fetchUserPosts();
  }, [fetchUserPosts]);

  const handleDeletePost = async (postId) => {
    if (!window.confirm('¿Seguro que querés eliminar esta publicación?')) return;
    try {
      await deletePost(postId);
      setFeedback('Publicación eliminada correctamente.');
      setTimeout(() => setFeedback(''), 3000);
      setMyPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      alert(err.message || 'Error al eliminar la publicación.');
    }
  };

  const handleProfileUpdated = (updatedData) => {
    setUserProfile(updatedData);
    if (updateUser) {
      updateUser(updatedData);
    }
    setFeedback('¡Perfil actualizado con éxito!');
    setTimeout(() => setFeedback(''), 3500);
  };

  const currentRole = userProfile?.role || user?.role;
  const getRoleDisplay = () => {
    if (currentRole === 'ADMIN') {
      return (
        <span
          className="badge p-2 px-3"
          style={{
            backgroundColor: '#fef08a',
            color: '#854d0e',
            border: '2px solid var(--border-dark)',
            fontFamily: 'var(--font-pixel)',
            fontSize: '11px',
          }}
        >
          👑 Administrador Supremo
        </span>
      );
    }
    if (currentRole === 'MODERATOR') {
      return (
        <span
          className="badge p-2 px-3"
          style={{
            backgroundColor: '#e9d5ff',
            color: '#6b21a8',
            border: '2px solid var(--border-dark)',
            fontFamily: 'var(--font-pixel)',
            fontSize: '11px',
          }}
        >
          🛡️ Moderador de la Comunidad
        </span>
      );
    }
    return (
      <span
        className="badge p-2 px-3"
        style={{
          backgroundColor: '#bbf7d0',
          color: '#166534',
          border: '2px solid var(--border-dark)',
          fontFamily: 'var(--font-pixel)',
          fontSize: '11px',
        }}
      >
        🎮 Gamer Miembro
      </span>
    );
  };

  // Cálculo de insignias básicas
  const hasFirstPost = myPosts.length >= 1;
  const isDebater = myPosts.length >= 3;
  const hasMedia = myPosts.some((p) => p.media_items && p.media_items.length > 0);
  const isStaff = currentRole === 'ADMIN' || currentRole === 'MODERATOR';

  const badges = [
    {
      id: 'pioneer',
      name: 'Pionero del Foro',
      icon: '🌟',
      desc: 'Miembro de la comunidad gamer',
      unlocked: true,
      color: '#fef3c7',
      border: '#d97706',
    },
    {
      id: 'first-post',
      name: 'Primer Hilo',
      icon: '✍️',
      desc: 'Creó su primera publicación',
      unlocked: hasFirstPost,
      color: '#dbeafe',
      border: '#2563eb',
    },
    {
      id: 'debater',
      name: 'Debatidor Activo',
      icon: '💬',
      desc: 'Publicó 3 o más discusiones',
      unlocked: isDebater,
      color: '#e0e7ff',
      border: '#4f46e5',
    },
    {
      id: 'media-creator',
      name: 'Creador Multimedia',
      icon: '📸',
      desc: 'Compartió fotos o clips de juegos',
      unlocked: hasMedia,
      color: '#fce7f3',
      border: '#db2777',
    },
    {
      id: 'staff',
      name: 'Guardián del Foro',
      icon: '🛡️',
      desc: 'Rol de moderación o administración',
      unlocked: isStaff,
      color: '#fef9c3',
      border: '#ca8a04',
    },
  ];

  const favoriteGames = userProfile?.favorite_games_details || [];
  const platforms = userProfile?.platforms || [];

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />

      <main className="flex-grow-1 forum-main-layout">
        <div className="container py-4" style={{ maxWidth: '860px' }}>
          {/* Feedback */}
          {feedback && (
            <div
              className="alert alert-success d-flex align-items-center justify-content-between mb-4"
              style={{
                border: '2px solid var(--border-dark)',
                boxShadow: '3px 3px 0px var(--border-dark)',
              }}
            >
              <span>{feedback}</span>
              <button
                type="button"
                className="btn-close"
                onClick={() => setFeedback('')}
                aria-label="Cerrar"
              ></button>
            </div>
          )}

          {/* TARJETA DE PERFIL GAMER CON BANNER RETRO */}
          <div
            className="mb-4"
            style={{
              backgroundColor: '#ffffff',
              border: '3px solid var(--border-dark)',
              borderRadius: '20px',
              boxShadow: '6px 6px 0px var(--border-dark)',
              overflow: 'hidden',
            }}
          >
            {/* Banner Header Personalizable */}
            <div
              style={{
                height: '140px',
                backgroundColor: userProfile?.banner_color || '#1e1b4b',
                backgroundImage: userProfile?.banner_url ? `url(${userProfile.banner_url})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderBottom: '3px solid var(--border-dark)',
                position: 'relative',
              }}
            >
              <div
                className="position-absolute end-0 top-0 m-3"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontFamily: 'var(--font-pixel)',
                  backdropFilter: 'blur(2px)',
                }}
              >
                🎮 PERFIL GAMER
              </div>
            </div>

            {/* Contenido del Perfil */}
            <div className="p-4 p-md-5 pt-0">
              <div className="row align-items-end g-3" style={{ marginTop: '-50px' }}>
                {/* Avatar */}
                <div className="col-auto">
                  <div
                    style={{
                      width: '95px',
                      height: '95px',
                      borderRadius: '50%',
                      backgroundColor: '#fed7aa',
                      border: '3.5px solid var(--border-dark)',
                      boxShadow: '3px 3px 0px var(--border-dark)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '44px',
                      overflow: 'hidden',
                    }}
                  >
                    {userProfile?.avatar_url && userProfile.avatar_url.startsWith('http') ? (
                      <img
                        src={userProfile.avatar_url}
                        alt="Avatar"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <span>{userProfile?.avatar || user?.avatar || '👾'}</span>
                    )}
                  </div>
                </div>

                {/* Nombre y Acciones */}
                <div className="col">
                  <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                    <h1
                      className="mb-0"
                      style={{
                        fontFamily: 'var(--font-pixel)',
                        fontSize: '24px',
                        color: 'var(--text-dark)',
                      }}
                    >
                      {userProfile?.username || user?.username}
                    </h1>
                    {getRoleDisplay()}
                  </div>

                  <div className="d-flex align-items-center gap-3 flex-wrap small text-secondary">
                    <span>📧 {userProfile?.email || user?.email}</span>
                    <span>
                      📅 Miembro desde:{' '}
                      <strong>{formatDate(userProfile?.date_joined || user?.date_joined)}</strong>
                    </span>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="col-12 col-md-auto d-flex gap-2 justify-content-md-end mt-3 mt-md-0">
                  <button
                    type="button"
                    className="btn btn-outline-dark d-inline-flex align-items-center gap-2"
                    onClick={() => setIsEditModalOpen(true)}
                    style={{
                      border: '2px solid var(--border-dark)',
                      boxShadow: '2px 2px 0px var(--border-dark)',
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '11px',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    ⚙️ Editar Perfil
                  </button>
                  <Link
                    to="/create-post"
                    className="btn btn-primary d-inline-flex align-items-center gap-2"
                    style={{
                      border: '2px solid var(--border-dark)',
                      boxShadow: '2px 2px 0px var(--border-dark)',
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '11px',
                      backgroundColor: '#6366f1',
                    }}
                  >
                    + Publicar Algo
                  </Link>
                </div>
              </div>

              {/* BIO / ACERCA DE MÍ */}
              {userProfile?.bio ? (
                <div
                  className="mt-4 p-3"
                  style={{
                    backgroundColor: '#f9fafb',
                    border: '2px solid var(--border-dark)',
                    borderRadius: '12px',
                    boxShadow: '2px 2px 0px var(--border-dark)',
                  }}
                >
                  <div className="fw-bold small text-muted text-uppercase mb-1" style={{ fontSize: '11px' }}>
                    💬 Acerca de mí
                  </div>
                  <p className="mb-0 text-dark" style={{ fontSize: '14px', lineHeight: 1.5 }}>
                    {userProfile.bio}
                  </p>
                </div>
              ) : null}

              {/* PLATAFORMAS & REDES GAMER */}
              <div className="mt-3 d-flex flex-wrap gap-2 align-items-center">
                {platforms.map((plat) => (
                  <span
                    key={plat}
                    className="badge p-1 px-3"
                    style={{
                      backgroundColor: '#f3f4f6',
                      color: '#1f2937',
                      border: '1.5px solid var(--border-dark)',
                      fontSize: '11px',
                    }}
                  >
                    🎮 {plat}
                  </span>
                ))}

                {userProfile?.steam_id && (
                  <span
                    className="badge p-1 px-3"
                    style={{
                      backgroundColor: '#1b2838',
                      color: '#ffffff',
                      border: '1.5px solid var(--border-dark)',
                      fontSize: '11px',
                    }}
                  >
                    💻 Steam: {userProfile.steam_id}
                  </span>
                )}

                {userProfile?.discord_tag && (
                  <span
                    className="badge p-1 px-3"
                    style={{
                      backgroundColor: '#5865f2',
                      color: '#ffffff',
                      border: '1.5px solid var(--border-dark)',
                      fontSize: '11px',
                    }}
                  >
                    💬 Discord: {userProfile.discord_tag}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* SECCIÓN 1: TOP 3 JUEGOS FAVORITOS */}
          <div
            className="p-4 mb-4"
            style={{
              backgroundColor: '#ffffff',
              border: '3px solid var(--border-dark)',
              borderRadius: '16px',
              boxShadow: '5px 5px 0px var(--border-dark)',
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
              <h2
                className="mb-0"
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '14px',
                  color: 'var(--text-dark)',
                }}
              >
                🏆 Top 3 Juegos Favoritos
              </h2>
              <button
                type="button"
                className="btn btn-sm btn-link text-decoration-none text-muted p-0"
                onClick={() => setIsEditModalOpen(true)}
                style={{ fontSize: '11px' }}
              >
                ✏️ Cambiar
              </button>
            </div>

            {favoriteGames.length > 0 ? (
              <div className="row g-3">
                {favoriteGames.map((game, index) => (
                  <div key={game.id} className="col-12 col-md-4">
                    <div
                      className="p-2 h-100 d-flex flex-column justify-content-between"
                      style={{
                        backgroundColor: '#fffbeb',
                        border: '2px solid #d97706',
                        borderRadius: '12px',
                        boxShadow: '3px 3px 0px #d97706',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        className="badge position-absolute top-0 end-0 m-2"
                        style={{
                          backgroundColor: '#d97706',
                          color: '#ffffff',
                          fontFamily: 'var(--font-pixel)',
                          fontSize: '10px',
                        }}
                      >
                        #{index + 1}
                      </div>

                      <div className="d-flex align-items-center gap-3 mb-2">
                        {game.image_url ? (
                          <img
                            src={game.image_url}
                            alt={game.name}
                            style={{
                              width: '54px',
                              height: '54px',
                              borderRadius: '8px',
                              objectFit: 'cover',
                              border: '1.5px solid var(--border-dark)',
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '54px',
                              height: '54px',
                              borderRadius: '8px',
                              backgroundColor: '#fef3c7',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '26px',
                              border: '1.5px solid var(--border-dark)',
                            }}
                          >
                            🎮
                          </div>
                        )}
                        <div className="text-truncate">
                          <h6 className="fw-bold mb-0 text-truncate text-dark">{game.name}</h6>
                          <span className="small text-muted" style={{ fontSize: '11px' }}>
                            Juego Destacado
                          </span>
                        </div>
                      </div>

                      <Link
                        to={`/?game=${game.id}`}
                        className="btn btn-sm btn-outline-dark w-100 mt-2 text-decoration-none"
                        style={{
                          fontSize: '11px',
                          fontFamily: 'var(--font-pixel)',
                          border: '1.5px solid var(--border-dark)',
                        }}
                      >
                        Ver debates →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-3 text-muted">
                <p className="mb-2">Todavía no elegiste tus 3 juegos favoritos.</p>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-dark"
                  onClick={() => setIsEditModalOpen(true)}
                  style={{
                    border: '2px solid var(--border-dark)',
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '11px',
                  }}
                >
                  + Elegir juegos favoritos
                </button>
              </div>
            )}
          </div>

          {/* SECCIÓN 2: INSIGNIAS DE LA COMUNIDAD */}
          <div
            className="p-4 mb-4"
            style={{
              backgroundColor: '#ffffff',
              border: '3px solid var(--border-dark)',
              borderRadius: '16px',
              boxShadow: '5px 5px 0px var(--border-dark)',
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
              <h2
                className="mb-0"
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '14px',
                  color: 'var(--text-dark)',
                }}
              >
                🏅 Insignias de la Comunidad
              </h2>
              <span className="small text-muted">
                {badges.filter((b) => b.unlocked).length} de {badges.length} desbloqueadas
              </span>
            </div>

            <div className="row g-3">
              {badges.map((badge) => (
                <div key={badge.id} className="col-12 col-sm-6 col-md-4">
                  <div
                    className="p-3 h-100 d-flex align-items-center gap-3"
                    style={{
                      backgroundColor: badge.unlocked ? badge.color : '#f3f4f6',
                      border: badge.unlocked ? `2px solid ${badge.border}` : '2px dashed #9ca3af',
                      borderRadius: '12px',
                      boxShadow: badge.unlocked ? `2px 2px 0px ${badge.border}` : 'none',
                      opacity: badge.unlocked ? 1 : 0.55,
                    }}
                  >
                    <div style={{ fontSize: '28px', filter: badge.unlocked ? 'none' : 'grayscale(100%)' }}>
                      {badge.icon}
                    </div>
                    <div>
                      <div className="fw-bold small text-dark mb-0 d-flex align-items-center gap-1">
                        {badge.name}
                        {badge.unlocked && <span style={{ color: '#16a34a', fontSize: '11px' }}>✓</span>}
                      </div>
                      <div className="text-muted" style={{ fontSize: '11px' }}>
                        {badge.desc}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECCIÓN 3: HISTORIAL DE PUBLICACIONES / MENCIONES */}
          <div
            className="p-4 mb-4"
            style={{
              backgroundColor: '#ffffff',
              border: '3px solid var(--border-dark)',
              borderRadius: '16px',
              boxShadow: '5px 5px 0px var(--border-dark)',
            }}
          >
            <div className="d-flex align-items-center gap-2 mb-4 border-bottom pb-2">
              <button
                type="button"
                className={`btn btn-sm ${activeTab === 'posts' ? 'btn-dark' : 'btn-outline-dark'}`}
                onClick={() => setActiveTab('posts')}
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '11px',
                  borderRadius: '10px',
                  border: '2px solid var(--border-dark)',
                  boxShadow: activeTab === 'posts' ? '2px 2px 0px var(--border-dark)' : 'none',
                }}
              >
                📜 Mis Hilos ({myPosts.length})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activeTab === 'mentions' ? 'btn-dark' : 'btn-outline-dark'}`}
                onClick={() => setActiveTab('mentions')}
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '11px',
                  borderRadius: '10px',
                  border: '2px solid var(--border-dark)',
                  boxShadow: activeTab === 'mentions' ? '2px 2px 0px var(--border-dark)' : 'none',
                }}
              >
                👥 Menciones Recibidas ({mentionedPosts.length})
              </button>
            </div>

            {loading && (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="small text-muted mt-2">Cargando publicaciones...</p>
              </div>
            )}

            {error && !loading && <div className="alert alert-warning small">{error}</div>}

            {!loading && !error && (
              <>
                {activeTab === 'posts' && myPosts.length === 0 && (
                  <div className="text-center py-4 text-muted">
                    <p style={{ fontSize: '32px' }}>📭</p>
                    <p className="mb-2">Todavía no creaste ninguna publicación en el foro.</p>
                    <Link
                      to="/create-post"
                      className="btn btn-sm btn-outline-dark"
                      style={{
                        border: '2px solid var(--border-dark)',
                        fontFamily: 'var(--font-pixel)',
                        fontSize: '11px',
                      }}
                    >
                      Crear mi primer post
                    </Link>
                  </div>
                )}

                {activeTab === 'mentions' && mentionedPosts.length === 0 && (
                  <div className="text-center py-4 text-muted">
                    <p style={{ fontSize: '32px' }}>🔔</p>
                    <p className="mb-0">Todavía nadie te ha mencionado en ninguna publicación.</p>
                  </div>
                )}

                {activeTab === 'posts' && myPosts.length > 0 && (
                  <div className="forum-feed-wrapper mt-3">
                    {myPosts.map((post) => (
                      <PostCard
                        key={post.id}
                        id={post.id}
                        title={post.title}
                        content={post.content}
                        username={user.username}
                        userId={user.id}
                        userRole={user.role}
                        avatar={userProfile?.avatar || '👾'}
                        game={post.game}
                        category={post.category}
                        mediaItems={post.media_items || []}
                        commentCount={post.comment_count ?? 0}
                        likesCount={post.likes_count ?? 0}
                        isLiked={Boolean(post.is_liked)}
                        topComments={post.top_comments || []}
                        canDelete={true}
                        onDelete={handleDeletePost}
                        onReport={handleOpenReport}
                      />
                    ))}
                  </div>
                )}

                {activeTab === 'mentions' && mentionedPosts.length > 0 && (
                  <div className="forum-feed-wrapper mt-3">
                    {mentionedPosts.map((post) => (
                      <PostCard
                        key={post.id}
                        id={post.id}
                        title={post.title}
                        content={post.content}
                        username={
                          typeof post.user === 'string'
                            ? post.user
                            : post.user?.username || 'Usuario'
                        }
                        userId={post.user_id || (typeof post.user === 'object' ? post.user?.id : null)}
                        userRole={
                          post.user_role || (typeof post.user === 'object' ? post.user.role : 'USER')
                        }
                        avatar="🎮"
                        game={post.game}
                        category={post.category}
                        mediaItems={post.media_items || []}
                        commentCount={post.comment_count ?? 0}
                        likesCount={post.likes_count ?? 0}
                        isLiked={Boolean(post.is_liked)}
                        topComments={post.top_comments || []}
                        canDelete={false}
                        onReport={handleOpenReport}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />

      <ReportModal
        isOpen={reportModalState.isOpen}
        onClose={() => setReportModalState({ isOpen: false, postId: null, commentId: null, title: '' })}
        postId={reportModalState.postId}
        commentId={reportModalState.commentId}
        title={reportModalState.title}
      />

      {/* Modal de Edición de Perfil */}
      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        userProfile={userProfile || user}
        onProfileUpdated={handleProfileUpdated}
      />
    </div>
  );
}

export default Profile;
