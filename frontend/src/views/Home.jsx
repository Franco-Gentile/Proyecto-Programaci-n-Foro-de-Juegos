import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth, API_URL } from '../services/authService';

function getTimeAgo(dateString) {
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
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetchWithAuth(`${API_URL}/posts/`);

        if (response.status === 401) {
          setError('Tu sesión expiró. Volvé a iniciar sesión.');
          // fetchWithAuth ya borró el local storage, solo debemos notificar
          navigate('/login');
          return;
        }

        if (!response.ok) {
          throw new Error('Error al cargar las publicaciones');
        }

        const data = await response.json();
        const postsData = Array.isArray(data) ? data : (data.results || []);
        
        const mappedPosts = postsData.map(post => ({
          id: post.id,
          username: post.user || 'Usuario anónimo',
          avatar: '🎮', 
          timeAgo: getTimeAgo(post.created_at),
          content: post.content || post.title, 
          tag: post.category || 'General',
          imageUrl: null 
        }));

        setPosts(mappedPosts);
      } catch (err) {
        setError('Ocurrió un error al cargar el feed.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [navigate]);

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />

      <main className="flex-grow-1 forum-main-layout">
        <div className="container-fluid px-3 px-md-5">
          <div className="row justify-content-center g-4">
            {/* Columna Izquierda: Sidebar Mis juegos */}
            <div className="col-12 col-md-5 col-lg-3 col-xl-3">
              <Sidebar />
            </div>

            {/* Columna Central: Muro del Foro */}
            <div className="col-12 col-md-7 col-lg-7 col-xl-6">
              <div className="forum-feed-wrapper">
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}
                
                {!error && user && (
                  <div className="alert alert-info mb-4" role="alert">
                    ¡Hola, <strong>{user.username}</strong>! Bienvenido al foro.
                  </div>
                )}

                {loading && !error && (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                  </div>
                )}

                {!loading && !error && posts.length === 0 && (
                  <div className="text-center py-4 text-muted">
                    No hay publicaciones todavía. ¡Sé el primero en compartir algo!
                  </div>
                )}

                {!loading && posts.map((post) => (
                  <PostCard
                    key={post.id}
                    username={post.username}
                    avatar={post.avatar}
                    timeAgo={post.timeAgo}
                    content={post.content}
                    tag={post.tag}
                    imageUrl={post.imageUrl}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Home;
