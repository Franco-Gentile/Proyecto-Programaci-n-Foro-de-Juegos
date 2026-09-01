import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-custom">
      <div className="container-fluid px-3 px-md-4">
        {/* Brand Group: Logo circular + Box Games */}
        <div className="d-flex align-items-center gap-3">
          <Link to="/" className="brand-circle-btn" aria-label="Inicio">
            <svg
              className="brand-circle-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="6" y1="18" x2="18" y2="6" />
              <line x1="6" y1="6" x2="6.01" y2="6" />
              <line x1="18" y1="18" x2="18.01" y2="18" />
            </svg>
          </Link>

          <Link to="/" className="text-decoration-none">
            <div className="brand-pixel-box">Games</div>
          </Link>
        </div>

        {/* Barra de búsqueda central: desktop */}
        <div className="d-none d-lg-flex flex-grow-1 justify-content-center mx-4">
          <div className="search-capsule-container">
            <input
              className="search-capsule-input"
              type="search"
              placeholder="Buscar juegos, publicaciones..."
              aria-label="Buscar"
            />
            <button
              className="search-circle-btn"
              type="button"
              aria-label="Buscar"
            >
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
          </div>
        </div>

        {/* Sección de autenticación: desktop */}
        <div className="d-none d-lg-flex align-items-center gap-3">
          {user ? (
            <>
              <div className="nav-user-badge">
                <span>🎮</span>
                <span>{user.username}</span>
              </div>
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
            <div className="search-capsule-container">
              <input
                className="search-capsule-input"
                type="search"
                placeholder="Buscar juegos, publicaciones..."
                aria-label="Buscar"
              />
              <button
                className="search-circle-btn"
                type="button"
                aria-label="Buscar"
              >
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
            </div>
          </div>

          <div className="d-lg-none d-flex flex-column gap-2 pb-2">
            {user ? (
              <>
                <div className="nav-user-badge justify-content-center">
                  <span>🎮</span>
                  <span>{user.username}</span>
                </div>
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
