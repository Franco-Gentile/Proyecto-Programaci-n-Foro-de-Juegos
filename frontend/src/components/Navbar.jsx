import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCategories, getPosts } from '../services/forumService';

function SearchWithAutocomplete({ onNavigate }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('search') || '');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState({ games: [], genres: [], posts: [] });
  const containerRef = useRef(null);

  useEffect(() => {
    setQuery(searchParams.get('search') || '');
  }, [searchParams]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions({ games: [], genres: [], posts: [] });
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const [cats, postsData] = await Promise.all([
          getCategories({ search: trimmed }),
          getPosts({ search: trimmed }),
        ]);

        const games = (cats || []).filter((c) => !c.is_genre).slice(0, 5);
        const genres = (cats || []).filter((c) => c.is_genre).slice(0, 4);
        const posts = (postsData?.results || []).slice(0, 4);

        setSuggestions({ games, genres, posts });
        setIsOpen(true);
      } catch (err) {
        console.error('Error al obtener sugerencias de búsqueda:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setIsOpen(false);
    if (query.trim()) {
      navigate(`/?search=${encodeURIComponent(query.trim())}`);
    } else {
      navigate('/');
    }
    if (onNavigate) onNavigate();
  };

  const handleSelectGame = (game) => {
    setIsOpen(false);
    navigate(`/?category=${game.id}`);
    if (onNavigate) onNavigate();
  };

  const handleSelectGenre = (genre) => {
    setIsOpen(false);
    navigate(`/?category=${genre.id}`);
    if (onNavigate) onNavigate();
  };

  const handleSelectPost = (post) => {
    setIsOpen(false);
    navigate(`/posts/${post.id}`);
    if (onNavigate) onNavigate();
  };

  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
    navigate('/');
    if (onNavigate) onNavigate();
  };

  const hasResults =
    suggestions.games.length > 0 ||
    suggestions.genres.length > 0 ||
    suggestions.posts.length > 0;

  return (
    <div ref={containerRef} className="position-relative w-100">
      <form onSubmit={handleSubmit} className="search-capsule-container position-relative">
        <input
          className="search-capsule-input"
          type="search"
          placeholder="Buscar juegos, géneros (ej: RPG), publicaciones..."
          aria-label="Buscar"
          value={query}
          onFocus={() => {
            if (query.trim().length >= 2) setIsOpen(true);
          }}
          onChange={(e) => setQuery(e.target.value)}
        />

        {query && (
          <button
            type="button"
            className="btn btn-sm btn-link text-muted p-0 me-1"
            onClick={handleClear}
            style={{ textDecoration: 'none', fontSize: '14px' }}
            title="Limpiar búsqueda"
          >
            ✕
          </button>
        )}

        <button className="search-circle-btn" type="submit" aria-label="Buscar">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </form>

      {/* Menú Flotante de Sugerencias en Vivo (YouTube Style) */}
      {isOpen && query.trim().length >= 2 && (
        <div className="search-suggestions-dropdown" role="listbox">
          {loading && (
            <div className="p-3 text-center text-muted small">
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Buscando coincidencias...
            </div>
          )}

          {!loading && !hasResults && (
            <div className="p-3 text-center text-muted small">
              No se encontraron sugerencias directas para "{query}"
            </div>
          )}

          {/* Sugerencias de Juegos */}
          {!loading && suggestions.games.length > 0 && (
            <div className="suggestion-section">
              <div className="suggestion-section-title">
                <span>🎮 Juegos sugeridos</span>
              </div>
              {suggestions.games.map((game) => (
                <button
                  key={`game-${game.id}`}
                  type="button"
                  className="suggestion-item"
                  onClick={() => handleSelectGame(game)}
                >
                  <div className="d-flex align-items-center gap-2 text-truncate">
                    {game.image_url ? (
                      <img
                        src={game.image_url}
                        alt={game.name}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '6px',
                          objectFit: 'cover',
                          border: '1.5px solid var(--border-dark)',
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: '16px' }}>🕹️</span>
                    )}
                    <span className="fw-bold text-dark text-truncate">{game.name}</span>
                  </div>
                  <span
                    className="badge bg-light text-dark border ms-2"
                    style={{ fontSize: '10px', fontFamily: 'var(--font-pixel)' }}
                  >
                    {game.post_count || 0} posts
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Sugerencias de Géneros */}
          {!loading && suggestions.genres.length > 0 && (
            <div className="suggestion-section">
              <div className="suggestion-section-title">
                <span>🏷️ Géneros</span>
              </div>
              {suggestions.genres.map((genre) => (
                <button
                  key={`genre-${genre.id}`}
                  type="button"
                  className="suggestion-item"
                  onClick={() => handleSelectGenre(genre)}
                >
                  <div className="d-flex align-items-center gap-2 text-truncate">
                    <span>📁</span>
                    <span className="text-dark text-truncate">{genre.name}</span>
                  </div>
                  <span className="small text-muted" style={{ fontSize: '11px' }}>
                    Filtrar género
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Sugerencias de Publicaciones */}
          {!loading && suggestions.posts.length > 0 && (
            <div className="suggestion-section">
              <div className="suggestion-section-title">
                <span>📝 Publicaciones del Foro</span>
              </div>
              {suggestions.posts.map((post) => (
                <button
                  key={`post-${post.id}`}
                  type="button"
                  className="suggestion-item"
                  onClick={() => handleSelectPost(post)}
                >
                  <div className="d-flex align-items-center gap-2 text-truncate">
                    <span>💬</span>
                    <span className="text-dark text-truncate" style={{ fontSize: '13px' }}>
                      {post.title}
                    </span>
                  </div>
                  <span className="small text-muted text-nowrap ms-2" style={{ fontSize: '10px' }}>
                    Ver hilo →
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Opción para buscar todo */}
          <div className="suggestion-footer">
            <button
              type="button"
              className="btn-suggestion-all"
              onClick={handleSubmit}
            >
              🔎 Buscar "{query}" en todo el foro ➔
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isAdminOrMod = user && (user.role === 'ADMIN' || user.role === 'MODERATOR');
  const isGamesActive = location.pathname === '/games';

  return (
    <nav className="navbar navbar-expand-lg navbar-custom">
      <div className="container-fluid px-3 px-md-4">
        {/* Brand Group & GAMES Button */}
        <div className="d-flex align-items-center gap-2 gap-md-3">
          <Link to="/" className="text-decoration-none" aria-label="Inicio Foro">
            <div className="brand-pixel-box d-flex align-items-center gap-2">
              <span style={{ fontSize: '18px' }}>🕹️</span>
              <span>FORO GAMER</span>
            </div>
          </Link>

          {/* Botón GAMES puesto en funcionamiento directo hacia /games */}
          <Link
            to="/games"
            className={`btn-retro-games-nav ${isGamesActive ? 'btn-retro-games-nav-active' : ''}`}
            title="Explorar el Catálogo de Juegos (Cuadritos Simétricos)"
          >
            <span style={{ fontSize: '14px' }}>🎮</span>
            <span>GAMES</span>
          </Link>
        </div>

        {/* Barra de búsqueda central con autocompletado en vivo (Desktop) */}
        <div className="d-none d-lg-flex flex-grow-1 justify-content-center mx-4">
          <SearchWithAutocomplete />
        </div>

        {/* Sección de autenticación y accesos (Desktop) */}
        <div className="d-none d-lg-flex align-items-center gap-2">
          {user ? (
            <>
              {/* Botón Crear Post */}
              <Link
                to="/create-post"
                className="btn-retro-auth text-decoration-none"
                style={{
                  backgroundColor: '#22c55e',
                  borderColor: '#15803d',
                  color: '#ffffff',
                }}
                title="Crear una nueva publicación"
              >
                + Crear Post
              </Link>

              {/* Acceso al Panel Admin si tiene permiso */}
              {isAdminOrMod && (
                <Link
                  to="/admin"
                  className="btn-retro-auth text-decoration-none"
                  style={{
                    backgroundColor: '#f59e0b',
                    borderColor: '#b45309',
                    color: '#ffffff',
                  }}
                  title="Panel de Administración y Moderación"
                >
                  ⚙️ Admin
                </Link>
              )}

              {/* Perfil del usuario */}
              <Link
                to="/profile"
                className="nav-user-badge text-decoration-none"
                title="Ver mi perfil"
              >
                <span>🎮</span>
                <span>{user.username}</span>
                {user.role === 'ADMIN' && (
                  <span className="badge bg-warning text-dark px-1">👑</span>
                )}
                {user.role === 'MODERATOR' && (
                  <span className="badge bg-purple text-white px-1" style={{ backgroundColor: '#8b5cf6' }}>
                    🛡️
                  </span>
                )}
              </Link>

              {/* Botón Logout */}
              <button className="btn-logout-retro" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-retro-auth">
                Login
              </Link>
              <Link to="/register" className="btn-retro-auth">
                Register
              </Link>
            </>
          )}
        </div>

        {/* Botón hamburguesa para mobile */}
        <button
          className="navbar-toggler ms-auto"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarMenu"
          aria-controls="navbarMenu"
          aria-expanded="false"
          aria-label="Abrir menú"
          style={{
            border: '2px solid var(--border-dark)',
            backgroundColor: '#ffffff',
          }}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Menú colapsable en mobile */}
        <div className="collapse navbar-collapse mt-3 mt-lg-0" id="navbarMenu">
          <div className="d-lg-none my-3">
            <SearchWithAutocomplete />
          </div>

          <div className="d-lg-none d-flex flex-column gap-2 pb-2">
            <Link
              to="/games"
              className={`btn-retro-games-nav w-100 py-2 justify-content-center ${isGamesActive ? 'btn-retro-games-nav-active' : ''}`}
            >
              <span>🎮</span>
              <span>Catálogo de GAMES</span>
            </Link>

            {user ? (
              <>
                <Link
                  to="/create-post"
                  className="btn-retro-auth w-100 py-2 text-center"
                  style={{ backgroundColor: '#22c55e' }}
                >
                  + Crear Post
                </Link>
                {isAdminOrMod && (
                  <Link
                    to="/admin"
                    className="btn-retro-auth w-100 py-2 text-center"
                    style={{ backgroundColor: '#f59e0b' }}
                  >
                    ⚙️ Panel de Administración
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="nav-user-badge justify-content-center text-decoration-none"
                >
                  <span>🎮</span>
                  <span>{user.username}</span>
                  {user.role === 'ADMIN' && <span>(Admin)</span>}
                  {user.role === 'MODERATOR' && <span>(Mod)</span>}
                </Link>
                <button
                  className="btn-logout-retro w-100 py-2"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn-retro-auth w-100 py-2 text-center"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-retro-auth w-100 py-2 text-center"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
