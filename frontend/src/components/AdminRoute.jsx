import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import Footer from './Footer';

function AdminRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const hasAdminPermission = user.role === 'ADMIN' || user.role === 'MODERATOR';

  if (!hasAdminPermission) {
    return (
      <div className="d-flex flex-column min-vh-100">
        <Navbar />
        <main className="flex-grow-1 forum-main-layout d-flex align-items-center justify-content-center">
          <div className="container text-center py-5">
            <div
              className="p-5 mx-auto"
              style={{
                maxWidth: '560px',
                backgroundColor: '#ffffff',
                border: '3px solid var(--border-dark)',
                borderRadius: '20px',
                boxShadow: '6px 6px 0px var(--border-dark)',
              }}
            >
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>⛔</div>
              <h2
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '22px',
                  marginBottom: '12px',
                  color: 'var(--text-dark)',
                }}
              >
                Acceso No Autorizado
              </h2>
              <p className="text-muted mb-4">
                Esta sección está reservada exclusivamente para Administradores y
                Moderadores del foro. Tu rol actual es{' '}
                <span className="badge bg-secondary">{user.role || 'USER'}</span>.
              </p>
              <Link
                to="/"
                className="btn-retro-auth text-decoration-none"
                style={{
                  backgroundColor: 'var(--brand-accent)',
                  color: '#ffffff',
                  padding: '10px 24px',
                  fontSize: '14px',
                }}
              >
                Volver al Foro
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return children;
}

export default AdminRoute;
