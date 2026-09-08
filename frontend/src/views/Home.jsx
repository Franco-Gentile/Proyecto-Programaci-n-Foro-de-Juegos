import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import PostCard from '../components/PostCard';
import ReportModal from '../components/ReportModal';
import { useAuth } from '../context/AuthContext';
import { getPosts, deletePost } from '../services/forumService';

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

function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [reportModalState, setReportModalState] = useState({ isOpen: false, postId: null, title: '' });
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  const { user } = useAuth();

  const fetchPostList = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getPosts({
        category: selectedCategory,
        search: searchQuery,
      });

      setPosts(data.results);
    } catch (err) {
      setError(err.message || 'Ocurrió un error al cargar el feed.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    fetchPostList();
  }, [fetchPostList]);

  const handleOpenReport = (postId, postTitle) => {
    setReportModalState({
      isOpen: true,
      postId,
      title: postTitle,
    });
  };

  const handleCloseReport = () => {
    setReportModalState({ isOpen: false, postId: null, title: '' });
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('¿Estás seguro de que deseás eliminar esta publicación?')) {
      return;
    }

    try {
      await deletePost(postId);
      setFeedbackMsg('Publicación eliminada correctamente.');
      setTimeout(() => setFeedbackMsg(''), 3000);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      alert(err.message || 'No se pudo eliminar la publicación.');
    }
  };

  const handleSelectCategory = (catId) => {
    setSelectedCategory(catId);
    if (searchQuery) {
      searchParams.delete('search');
      setSearchParams(searchParams);
    }
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    if (searchQuery) {
      searchParams.delete('search');
      setSearchParams(searchParams);
    }
  };

  const isUserOwnerOrAdmin = (post) => {
    if (!user) return false;
    if (user.role === 'ADMIN' || user.role === 'MODERATOR') return true;
    if (post.user_id && post.user_id === user.id) return true;
    if (post.user === user.username) return true;
    return false;
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />

      <main className="flex-grow-1 forum-main-layout">
        <div className="container-fluid px-3 px-md-5">
          <div className="row justify-content-center g-4">
            {/* Columna Izquierda: Sidebar Comunidades / Juegos con scroll independiente */}
            <div className="col-12 col-md-5 col-lg-4 col-xl-3">
              <Sidebar
                selectedCategory={selectedCategory}
                onSelectCategory={handleSelectCategory}
              />
            </div>

            {/* Columna Central: Muro del Foro */}
            <div className="col-12 col-md-7 col-lg-8 col-xl-7">
              {feedbackMsg && (
                <div
                  className="alert alert-success alert-dismissible fade show"
                  role="alert"
                  style={{
                    border: '2px solid var(--border-dark)',
                    boxShadow: '3px 3px 0px var(--border-dark)',
                  }}
                >
                  {feedbackMsg}
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setFeedbackMsg('')}
                  ></button>
                </div>
              )}

              {/* Banner / Header del Feed */}
              <div
                className="d-flex align-items-center justify-content-between p-3 mb-3"
                style={{
                  backgroundColor: '#ffffff',
                  border: '3px solid var(--border-dark)',
                  borderRadius: '14px',
                  boxShadow: '3px 3px 0px var(--border-dark)',
                }}
              >
                <div>
                  <h1
                    className="mb-0"
                    style={{
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '15px',
                      color: 'var(--text-dark)',
                    }}
                  >
                    {searchQuery
                      ? `🔍 Búsqueda: "${searchQuery}"`
                      : selectedCategory
                      ? '🎮 Feed Filtrado por Comunidad'
                      : '🔥 Todas las Publicaciones'}
                  </h1>
                  {(selectedCategory || searchQuery) && (
                    <button
                      type="button"
                      className="btn btn-link text-danger p-0 small fw-bold"
                      onClick={clearFilters}
                      style={{ fontSize: '12px' }}
                    >
                      ✕ Quitar filtros
                    </button>
                  )}
                </div>

                {user && (
                  <Link
                    to="/create-post"
                    className="btn-retro-auth text-decoration-none"
                    style={{
                      backgroundColor: '#6366f1',
                      borderColor: '#4338ca',
                      color: '#ffffff',
                      fontSize: '11px',
                    }}
                  >
                    + Nuevo Post
                  </Link>
                )}
              </div>

              {/* Mensaje de bienvenida para usuario logueado */}
              {user && !error && !selectedCategory && !searchQuery && (
                <div
                  className="alert mb-3"
                  style={{
                    backgroundColor: '#e0e7ff',
                    border: '2px solid var(--border-dark)',
                    boxShadow: '2px 2px 0px var(--border-dark)',
                    color: '#312e81',
                  }}
                >
                  ¡Hola, <strong>{user.username}</strong>! Participá en los debates o creá tu propio hilo.
                </div>
              )}

              {/* Error */}
              {error && (
                <div
                  className="alert alert-danger"
                  role="alert"
                  style={{
                    border: '2px solid var(--border-dark)',
                    boxShadow: '3px 3px 0px var(--border-dark)',
                  }}
                >
                  {error}
                </div>
              )}

              {/* Muro / Feed */}
              <div className="forum-feed-wrapper">
                {loading && (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Cargando publicaciones...</span>
                    </div>
                    <p
                      className="mt-3 text-muted"
                      style={{ fontFamily: 'var(--font-pixel)', fontSize: '13px' }}
                    >
                      Cargando hilos de la comunidad...
                    </p>
                  </div>
                )}

                {!loading && !error && posts.length === 0 && (
                  <div className="text-center py-5 px-3">
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>🕹️</div>
                    <h4
                      style={{
                        fontFamily: 'var(--font-pixel)',
                        fontSize: '16px',
                        color: 'var(--text-dark)',
                      }}
                    >
                      No se encontraron publicaciones
                    </h4>
                    <p className="text-muted small mb-3">
                      {searchQuery || selectedCategory
                        ? 'No hay posts que coincidan con los filtros seleccionados.'
                        : 'El foro todavía no tiene publicaciones. ¡Sé el primero en crear una!'}
                    </p>
                    {user ? (
                      <Link
                        to="/create-post"
                        className="btn btn-primary"
                        style={{
                          border: '2px solid var(--border-dark)',
                          boxShadow: '2px 2px 0px var(--border-dark)',
                          fontFamily: 'var(--font-pixel)',
                          fontSize: '12px',
                        }}
                      >
                        Crear la primera publicación
                      </Link>
                    ) : (
                      <Link to="/login" className="btn btn-outline-dark">
                        Iniciar sesión para postear
                      </Link>
                    )}
                  </div>
                )}

                {!loading &&
                  posts.map((post) => (
                    <PostCard
                      key={post.id}
                      id={post.id}
                      title={post.title}
                      content={post.content}
                      username={typeof post.user === 'string' ? post.user : (post.user?.username || 'Anónimo')}
                      userRole={post.user_role || (typeof post.user === 'object' ? post.user.role : 'USER')}
                      avatar="🎮"
                      timeAgo={getTimeAgo(post.created_at)}
                      tag={typeof post.category === 'string' ? post.category : (post.category?.name || 'General')}
                      imageUrl={post.images && post.images.length > 0 ? post.images[0].image_url : null}
                      onReport={handleOpenReport}
                      onDelete={handleDeletePost}
                      canDelete={isUserOwnerOrAdmin(post)}
                    />
                  ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <ReportModal
        isOpen={reportModalState.isOpen}
        onClose={handleCloseReport}
        postId={reportModalState.postId}
        title={reportModalState.title}
      />

      <Footer />
    </div>
  );
}

export default Home;
