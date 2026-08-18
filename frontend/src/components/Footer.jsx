function Footer() {
  return (
    <footer className="footer-custom py-4 mt-auto">
      <div className="container-fluid px-3 px-md-4">
        <div className="row">
          <div className="col-md-4 mb-3 mb-md-0">
            <h5 className="footer-brand">Games</h5>
            <p className="text-muted small mb-0">
              Tu foro de juegos favorito. Comparte, discute y descubre.
            </p>
          </div>
          <div className="col-md-4 mb-3 mb-md-0">
            <h6 className="footer-subtitle">Enlaces</h6>
            <ul className="list-unstyled mb-0">
              <li><a href="/" className="footer-link">Home</a></li>
              <li><a href="/login" className="footer-link">Login</a></li>
              <li><a href="/register" className="footer-link">Register</a></li>
            </ul>
          </div>
          <div className="col-md-4">
            <h6 className="footer-subtitle">Sobre nosotros</h6>
            <p className="text-muted small mb-0">
              Proyecto de Programacion 1 - 2026
            </p>
          </div>
        </div>
        <hr className="footer-divider my-3" />
        <p className="text-center text-muted small mb-0">
          &copy; 2026 Games. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}

export default Footer
