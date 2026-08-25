import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function NotFound() {
  return (
    <div
      className="d-flex flex-column min-vh-100"
      style={{ backgroundColor: 'var(--forum-bg)' }}
    >
      <Navbar />

      <main className="flex-grow-1 d-flex align-items-center justify-content-center py-5 px-3">
        <div
          className="text-center p-5"
          style={{
            backgroundColor: '#ffffff',
            border: '3px solid var(--border-dark)',
            borderRadius: '24px',
            boxShadow: '4px 4px 0px var(--border-dark)',
            maxWidth: '500px',
            width: '100%',
          }}
        >
          <div
            className="font-pixel display-3 fw-bold mb-3"
            style={{ color: '#ff4d4f' }}
          >
            404
          </div>
          <h2 className="font-pixel h5 mb-3">GAME OVER</h2>
          <p className="mb-4" style={{ color: '#4a5568', fontSize: '15px' }}>
            La misión fracasó: la página que estás buscando no existe o fue
            movida a otra zona.
          </p>
          <Link
            to="/"
            className="btn-retro-auth"
            style={{
              backgroundColor: 'var(--nav-bg)',
              color: '#ffffff',
              borderStyle: 'solid',
              borderColor: 'var(--border-dark)',
              boxShadow: '2px 2px 0px var(--border-dark)',
              padding: '10px 20px',
            }}
          >
            ← Volver al Foro
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default NotFound;
