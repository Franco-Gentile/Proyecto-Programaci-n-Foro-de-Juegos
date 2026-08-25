import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

function AuthLayout({ title, subtitle, error, children, footer }) {
  return (
    <div className="auth-fullscreen-bg">
      <div className="auth-dark-overlay"></div>

      <div className="auth-wrapper-content">
        <Navbar />

        <main className="flex-grow-1 d-flex align-items-center justify-content-center py-5 px-3">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">
                <div className="auth-card-glass">
                  <div className="auth-card-header">
                    <div className="auth-logo-badge">Games</div>
                    <h1 className="auth-card-title">{title}</h1>
                    {subtitle && (
                      <p className="auth-card-subtitle">{subtitle}</p>
                    )}
                  </div>

                  {error && (
                    <div
                      className="alert alert-danger d-flex align-items-center gap-2 mb-4 py-2 px-3 alert-error-custom"
                      role="alert"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                        className="flex-shrink-0"
                      >
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                        <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z" />
                      </svg>
                      <span>{error}</span>
                    </div>
                  )}

                  {children}

                  {footer && <div className="auth-footer-text">{footer}</div>}

                  <div className="text-center mt-3">
                    <Link to="/" className="auth-back-link">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <line x1="19" y1="12" x2="5" y2="12" />
                        <polyline points="12 19 5 12 12 5" />
                      </svg>
                      Volver al Foro
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default AuthLayout;
