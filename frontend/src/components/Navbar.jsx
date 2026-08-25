import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-custom sticky-top">
      <div className="container-fluid px-3 px-md-4">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <span className="brand-icon">joystick</span>
          <span className="brand-title">Games</span>
        </Link>

        <div className="d-none d-md-flex flex-grow-1 mx-4">
          <input
            className="form-control search-bar"
            type="search"
            placeholder="Buscar juegos, posts..."
            aria-label="Buscar"
          />
        </div>

        <div className="d-flex align-items-center gap-2">
          <button className="btn btn-icon d-md-none" aria-label="Buscar">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85zm-5.242.156a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"/>
            </svg>
          </button>
          <button className="btn btn-icon" aria-label="Notificaciones">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 16a2 2 0 0 0 1.985-1.75H6.015A2 2 0 0 0 8 16zM8 1.915l-.623.053A7.937 7.937 0 0 1 4.695 1.5H3.5a.5.5 0 0 0-.5.5v1a6.002 6.002 0 0 0 3.432 5.43l.25.135A7.99 7.99 0 0 1 8 4.5a7.937 7.937 0 0 1 .623.053V1.915z"/>
            </svg>
          </button>
          {user ? (
            <>
              <span className="text-light d-none d-md-inline">
                Hola, {user.username}
              </span>
              <button className="btn btn-auth" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-auth">Login</Link>
              <Link to="/register" className="btn btn-auth">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
