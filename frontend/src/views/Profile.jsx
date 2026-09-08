import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';
import { getPosts, deletePost } from '../services/forumService';

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
  const { user } = useAuth();
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  const fetchUserPosts = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError('');
      // Filtra por usuario (ID o username)
      const data = await getPosts({ user: user.id });
      setMyPosts(data.results);
    } catch (err) {
      setError('No se pudieron cargar tus publicaciones.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

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

  const getRoleDisplay = () => {
    if (!user) return null;
    if (user.role === 'ADMIN') {
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
    if (user.role === 'MODERATOR') {
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

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />

      <main className="flex-grow-1 forum-main-layout">
        <div className="container py-4" style={{ maxWidth: '820px' }}>
          {/* Tarjeta de Perfil Gamer */}
          <div
            className="p-4 p-md-5 mb-4"
            style={{
              backgroundColor: '#ffffff',
              border: '3px solid var(--border-dark)',
              borderRadius: '20px',
              boxShadow: '6px 6px 0px var(--border-dark)',
            }}
          >
            <div className="row align-items-center g-4">
              <div className="col-auto text-center">
                <div
                  style={{
                    width: '90px',
                    height: '90px',
                    borderRadius: '50%',
                    backgroundColor: '#fed7aa',
                    border: '3px solid var(--border-dark)',
                    boxShadow: '3px 3px 0px var(--border-dark)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '44px',
                  }}
                >
                  👾
                </div>
              </div>

              <div className="col">
                <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
                  <h1
                    className="mb-0"
                    style={{
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '24px',
                      color: 'var(--text-dark)',
                    }}
                  >
                    {user?.username}
                  </h1>
                  {getRoleDisplay()}
                </div>

                <p className="text-muted mb-2">
                  📧 Email: <strong>{user?.email}</strong>
                </p>

                <div className="d-flex align-items-center gap-3 flex-wrap small text-secondary">
                  <span>📅 Miembro desde: <strong>{formatDate(user?.date_joined || user?.dateJoined)}</strong></span>
                  <span>🏆 Publicaciones creadas: <strong>{myPosts.length}</strong></span>
                </div>
              </div>

              <div className="col-12 col-md-auto text-md-end">
                <Link
                  to="/create-post"
                  className="btn btn-primary d-inline-flex align-items-center gap-2"
                  style={{
                    border: '2px solid var(--border-dark)',
                    boxShadow: '2px 2px 0px var(--border-dark)',
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '12px',
                    backgroundColor: '#6366f1',
                  }}
                >
                  + Publicar Algo
                </Link>
              </div>
            </div>
          </div>

          {/* Feedback */}
          {feedback && (
            <div
              className="alert alert-success"
              style={{
                border: '2px solid var(--border-dark)',
                boxShadow: '3px 3px 0px var(--border-dark)',
              }}
            >
              {feedback}
            </div>
          )}

          {/* Historial de Publicaciones del Usuario */}
          <div
            className="p-4 mb-4"
            style={{
              backgroundColor: '#ffffff',
              border: '3px solid var(--border-dark)',
              borderRadius: '16px',
              boxShadow: '5px 5px 0px var(--border-dark)',
            }}
          >
            <h2
              className="mb-3"
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '18px',
                color: 'var(--text-dark)',
              }}
            >
              📜 Mis Hilos y Publicaciones ({myPosts.length})
            </h2>

            {loading && (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="small text-muted mt-2">Cargando tu historial...</p>
              </div>
            )}

            {error && !loading && (
              <div className="alert alert-warning small">{error}</div>
            )}

            {!loading && !error && myPosts.length === 0 && (
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

            {!loading && myPosts.length > 0 && (
              <div className="forum-feed-wrapper mt-3">
                {myPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    id={post.id}
                    title={post.title}
                    content={post.content}
                    username={user.username}
                    userRole={user.role}
                    avatar="👾"
                    tag={typeof post.category === 'string' ? post.category : post.category?.name}
                    canDelete={true}
                    onDelete={handleDeletePost}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Profile;
