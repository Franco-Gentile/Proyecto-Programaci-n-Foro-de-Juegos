import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getGames } from '../services/forumService';

function GamesCatalog() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterText, setFilterText] = useState('');

  const fetchGames = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getGames();
      setGames(data);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los juegos del catálogo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const filteredGames = useMemo(() => {
    if (!filterText.trim()) return games;
    const q = filterText.toLowerCase();
    return games.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        (g.description && g.description.toLowerCase().includes(q))
    );
  }, [games, filterText]);

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />

      <main className="flex-grow-1 forum-main-layout py-4">
        <div className="container-fluid px-3 px-md-5">
          {/* Header del Catálogo */}
          <div className="games-catalog-header">
            <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
              <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span style={{ fontSize: '26px' }}>🎮</span>
                  <h1
                    className="mb-0"
                    style={{
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '22px',
                      color: 'var(--text-dark)',
                    }}
                  >
                    Catálogo de Juegos
                  </h1>
                  <span
                    className="badge bg-dark text-white px-2 py-1 ms-2"
                    style={{
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '11px',
                      border: '1.5px solid var(--border-dark)',
                    }}
                  >
                    {games.length} TÍTULOS
                  </span>
                </div>
                <p className="text-muted small mb-0">
                  Explorá todos los juegos de la comunidad, descubrí temas de debate y participá en sus discusiones.
                </p>
              </div>
            </div>

            {/* Barra de Filtro Rápido */}
            <div className="row mt-4 align-items-center">
              <div className="col-12 col-md-6 col-lg-5">
                <div className="position-relative">
                  <input
                    type="search"
                    className="form-control"
                    placeholder="🔎 Filtrar juegos por nombre o descripción..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    style={{
                      border: '2.5px solid var(--border-dark)',
                      borderRadius: '25px',
                      padding: '8px 18px',
                      boxShadow: '2px 2px 0px var(--border-dark)',
                      fontSize: '14px',
                    }}
                  />
                  {filterText && (
                    <button
                      type="button"
                      className="btn btn-sm btn-link text-muted position-absolute"
                      onClick={() => setFilterText('')}
                      style={{
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        textDecoration: 'none',
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
              <div className="col-12 col-md-6 col-lg-7 text-md-end mt-2 mt-md-0">
                <span className="small text-muted" style={{ fontFamily: 'var(--font-pixel)', fontSize: '11px' }}>
                  Mostrando {filteredGames.length} de {games.length} juegos disponibles
                </span>
              </div>
            </div>
          </div>

          {/* Grilla de Juegos */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-secondary" role="status"></div>
              <p className="mt-3 text-muted small" style={{ fontFamily: 'var(--font-pixel)' }}>
                Cargando el arsenal...
              </p>
            </div>
          ) : error ? (
            <div className="alert alert-danger" role="alert" style={{ border: '2px solid var(--border-dark)' }}>
              {error}
            </div>
          ) : filteredGames.length === 0 ? (
            <div className="text-center py-5">
              <span style={{ fontSize: '48px' }}>👾</span>
              <p className="mt-3 fw-bold text-muted">No encontramos ningún juego con ese filtro.</p>
              <button className="btn btn-outline-dark btn-sm" onClick={() => setFilterText('')}>
                Limpiar filtro
              </button>
            </div>
          ) : (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-4 mt-2">
              {filteredGames.map((game) => (
                <div className="col" key={game.id}>
                  <div
                    className="card h-100 game-card-hover"
                    style={{
                      border: '2.5px solid var(--border-dark)',
                      borderRadius: '16px',
                      boxShadow: '3px 3px 0px var(--border-dark)',
                      overflow: 'hidden',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <div className="game-card-image-wrapper" style={{ height: '160px', overflow: 'hidden', backgroundColor: '#f3f4f6' }}>
                      {game.image_url ? (
                        <img
                          src={game.image_url}
                          alt={game.name}
                          className="w-100 h-100"
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <div className="d-flex align-items-center justify-content-center h-100" style={{ fontSize: '48px', color: '#9ca3af' }}>
                          🎮
                        </div>
                      )}
                    </div>

                    <div className="card-body d-flex flex-column p-3">
                      <h5
                        className="card-title mb-1 text-truncate"
                        style={{
                          fontWeight: '800',
                          fontSize: '16px',
                          color: '#1f2937',
                        }}
                        title={game.name}
                      >
                        {game.name}
                      </h5>

                      <div className="mb-2">
                        <span
                          className="badge bg-light text-dark border"
                          style={{ fontSize: '10px', padding: '3px 6px', fontFamily: 'var(--font-pixel)' }}
                        >
                          {game.genres && game.genres.length > 0 ? game.genres[0].name : 'Sin Genero'}
                        </span>
                      </div>

                      <p
                        className="card-text text-muted mb-3"
                        style={{ fontSize: '12px', lineHeight: '1.4', flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}
                      >
                        {game.description
                          ? game.description.replace(/<[^>]+>/g, '') // strip HTML tags
                          : 'Sin descripción disponible para este juego.'}
                      </p>

                      <div className="mt-auto pt-2 border-top">
                        <Link
                          to={`/?game=${game.id}`}
                          className="btn btn-sm w-100 fw-bold"
                          style={{
                            backgroundColor: '#fbbf24',
                            color: '#1a1a1a',
                            border: '2px solid var(--border-dark)',
                            borderRadius: '8px',
                            boxShadow: '1.5px 1.5px 0px var(--border-dark)',
                          }}
                        >
                          Ver Discusiones ({game.post_count ?? 0}) 💬
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default GamesCatalog;
