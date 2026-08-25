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
        <div className="text-center p-5 notfound-card">
          <div className="font-pixel display-3 fw-bold mb-3 notfound-404">
            404
          </div>
          <h2 className="font-pixel h5 mb-3">GAME OVER</h2>
          <p className="mb-4 notfound-text">
            La misión fracasó: la página que estás buscando no existe o fue
            movida a otra zona.
          </p>
          <Link to="/" className="btn-retro-auth btn-notfound">
            ← Volver al Foro
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default NotFound;
