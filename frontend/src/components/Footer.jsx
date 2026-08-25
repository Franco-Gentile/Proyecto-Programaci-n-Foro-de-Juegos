import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer-custom mt-auto">
      <div className="container-fluid px-3 px-md-5">
        <div className="row g-4">
          <div className="col-md-4 mb-3 mb-md-0">
            <h5 className="footer-brand">Games</h5>
            <p className="small mb-0" style={{ color: '#b2c8d2' }}>
              Tu foro de videojuegos favorito. Compartí noticias, descubrí
              partidas y unite a la comunidad gamer.
            </p>
          </div>
          <div className="col-md-4 mb-3 mb-md-0">
            <h6 className="footer-subtitle">Navegación</h6>
            <ul className="list-unstyled mb-0">
              <li>
                <Link to="/" className="footer-link">
                  Inicio / Foro
                </Link>
              </li>
              <li>
                <Link to="/login" className="footer-link">
                  Iniciar Sesión
                </Link>
              </li>
              <li>
                <Link to="/register" className="footer-link">
                  Crear Cuenta
                </Link>
              </li>
            </ul>
          </div>
          <div className="col-md-4">
            <h6 className="footer-subtitle">Sobre el Proyecto</h6>
            <p className="small mb-0" style={{ color: '#b2c8d2' }}>
              Proyecto de Programación 1 - 2026. Diseñado y maquetado con
              componentes React y diseño gamer retro.
            </p>
          </div>
        </div>
        <hr className="footer-divider my-4" />
        <p className="text-center small mb-0" style={{ color: '#9db7c3' }}>
          &copy; 2026 Games. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
