import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import GameModal from '../components/GameModal';
import { useAuth } from '../context/AuthContext';
import { getCategories, deleteCategory } from '../services/forumService';

function GamesCatalog() {
  const { user } = useAuth();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterText, setFilterText] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [modalState, setModalState] = useState({ isOpen: false, game: null });

  const isAdminOrMod = user && (user.role === 'ADMIN' || user.role === 'MODERATOR');

  const fetchGames = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getCategories({ is_genre: false });
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

  const handleOpenCreate = () => {
    setModalState({ isOpen: true, game: null });
  };

  const handleOpenEdit = (game) => {
    setModalState({ isOpen: true, game });
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, game: null });
  };

  const handleSavedGame = (savedGame, isEditing) => {
    if (isEditing) {
      setGames((prev) => prev.map((g) => (g.id === savedGame.id ? savedGame : g)));
      setFeedbackMsg(`¡Juego "${savedGame.name}" actualizado con éxito!`);
    } else {
      setGames((prev) => [savedGame, ...prev]);
      setFeedbackMsg(`¡Nuevo juego "${savedGame.name}" agregado al catálogo!`);
    }
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  const handleDeleteGame = async (game) => {
    if (!window.confirm(`¿Estás seguro de que deseás eliminar "${game.name}" del catálogo?`)) {
      return;
    }

    try {
      await deleteCategory(game.id);
      setGames((prev) => prev.filter((g) => g.id !== game.id));
      setFeedbackMsg(`El juego "${game.name}" fue eliminado.`);
      setTimeout(() => setFeedbackMsg(''), 3500);
    } catch (err) {
      alert(err.message || 'No se pudo eliminar el juego.');
    }
  };

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

              {/* Botón de Administración: Agregar Juego */}
              {isAdminOrMod && (
                <button
                  type="button"
                  className="btn btn-retro-auth d-flex align-items-center justify-content-center gap-2"
                  onClick={handleOpenCreate}
                  style={{
                    backgroundColor: '#22c55e',
                    borderColor: '#15803d',
                    color: '#ffffff',
                    padding: '10px 18px',
                    fontSize: '13px',
                  }}
                >
                  <span>➕</span>
                  <span>Agregar Nuevo Juego</span>
                </button>
              )}
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

          {/* Notificación Feedback */}
          {feedbackMsg && (
            <div
              className="alert alert-success alert-dismissible fade show mb-4"
              role="alert"
              style={{
                border: '2.5px solid var(--border-dark)',
                boxShadow: '3px 3px 0px var(--border-dark)',
                borderRadius: '14px',
                fontFamily: 'var(--font-pixel)',
                fontSize: '13px',
              }}
            >
              {feedbackMsg}
              <button
                type="button"
                className="btn-close"
                onClick={() => setFeedbackMsg('')}
              ></button>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando catálogo...</span>
              </div>
              <p
                className="mt-3 text-muted"
                style={{ fontFamily: 'var(--font-pixel)', fontSize: '13px' }}
              >
                Cargando juegos y portadas...
              </p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div
              className="alert alert-danger text-center py-4"
              role="alert"
              style={{
                border: '3px solid var(--border-dark)',
                borderRadius: '16px',
                boxShadow: '4px 4px 0px var(--border-dark)',
              }}
            >
              <h4>⚠️ Ups!</h4>
              <p className="mb-3">{error}</p>
              <button className="btn btn-outline-dark btn-sm" onClick={fetchGames}>
                Reintentar
              </button>
            </div>
          )}

          {/* Grid de Juegos Simétricos ("Cuadritos") */}
          {!loading && !error && filteredGames.length > 0 && (
            <div className="games-catalog-grid">
              {filteredGames.map((game) => (
                <article key={game.id} className="game-card-grid-item">
                  {/* Portada con proporción estricta 16:9 y adaptación automática */}
                  <div className="game-card-img-wrapper">
                    {game.image_url ? (
                      <img
                        src={game.image_url}
                        alt={game.name}
                        className="game-card-img"
                        loading="lazy"
                        onError={(e) => {
                          // Si falla la URL, mostramos el fallback elegante
                          e.target.style.display = 'none';
                          if (e.target.nextSibling) {
                            e.target.nextSibling.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}

                    {/* Fallback si no hay imagen o dio error */}
                    <div
                      className="d-flex flex-column align-items-center justify-content-center text-white w-100 h-100 p-3"
                      style={{
                        display: game.image_url ? 'none' : 'flex',
                        background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
                      }}
                    >
                      <span style={{ fontSize: '36px', marginBottom: '4px' }}>🎮</span>
                      <span
                        className="text-center text-truncate w-100 fw-bold"
                        style={{
                          fontFamily: 'var(--font-pixel)',
                          fontSize: '11px',
                          color: '#f8fafc',
                        }}
                      >
                        {game.name}
                      </span>
                    </div>

                    {/* Badge de discusiones superpuesto */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '8px',
                        right: '8px',
                        backgroundColor: 'rgba(0, 0, 0, 0.75)',
                        color: '#ffffff',
                        border: '1px solid #ffffff',
                        borderRadius: '12px',
                        padding: '2px 8px',
                        fontSize: '10px',
                        fontFamily: 'var(--font-pixel)',
                      }}
                    >
                      💬 {game.post_count || 0} posts
                    </div>
                  </div>

                  {/* Cuerpo del Cuadro */}
                  <div className="game-card-body">
                    <h2 className="game-card-title text-truncate" title={game.name}>
                      {game.name}
                    </h2>

                    <p className="game-card-desc">
                      {game.description || 'Comunidad dedicada a debates, guías, noticias y opiniones de este título.'}
                    </p>

                    <div className="game-card-footer">
                      {/* Botón Principal para ir al Feed de este juego */}
                      <Link
                        to={`/?category=${game.id}`}
                        className="btn w-100 text-decoration-none d-flex align-items-center justify-content-center gap-2"
                        style={{
                          backgroundColor: '#6366f1',
                          borderColor: '#4338ca',
                          color: '#ffffff',
                          border: '2px solid var(--border-dark)',
                          borderRadius: '12px',
                          boxShadow: '2px 2px 0px var(--border-dark)',
                          fontFamily: 'var(--font-pixel)',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          padding: '8px 12px',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#4f46e5';
                          e.currentTarget.style.transform = 'translate(-1px, -1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#6366f1';
                          e.currentTarget.style.transform = 'none';
                        }}
                      >
                        <span>Ver Discusiones</span>
                        <span>➔</span>
                      </Link>

                      {/* Herramientas de Administrador / Moderador */}
                      {isAdminOrMod && (
                        <div className="d-flex gap-2 pt-2 border-top mt-1" style={{ borderColor: '#e2e8f0' }}>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-dark flex-grow-1 d-flex align-items-center justify-content-center gap-1"
                            onClick={() => handleOpenEdit(game)}
                            style={{
                              border: '1.5px solid var(--border-dark)',
                              fontFamily: 'var(--font-pixel)',
                              fontSize: '11px',
                              borderRadius: '8px',
                              backgroundColor: '#fef08a',
                              color: '#854d0e',
                            }}
                          >
                            <span>✏️</span>
                            <span>Editar</span>
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger flex-grow-1 d-flex align-items-center justify-content-center gap-1"
                            onClick={() => handleDeleteGame(game)}
                            style={{
                              border: '1.5px solid #dc2626',
                              fontFamily: 'var(--font-pixel)',
                              fontSize: '11px',
                              borderRadius: '8px',
                              backgroundColor: '#fee2e2',
                              color: '#991b1b',
                            }}
                          >
                            <span>🗑️</span>
                            <span>Eliminar</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Estado Vacío */}
          {!loading && !error && filteredGames.length === 0 && (
            <div className="text-center py-5">
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🕹️</div>
              <h3 style={{ fontFamily: 'var(--font-pixel)', fontSize: '18px' }}>
                No se encontraron juegos
              </h3>
              <p className="text-muted small mb-3">
                {filterText
                  ? `Ningún juego coincide con "${filterText}".`
                  : 'Aún no hay juegos cargados en el catálogo.'}
              </p>
              {filterText && (
                <button
                  type="button"
                  className="btn btn-outline-dark btn-sm"
                  onClick={() => setFilterText('')}
                >
                  Limpiar filtro
                </button>
              )}
              {isAdminOrMod && !filterText && (
                <button
                  type="button"
                  className="btn btn-success btn-sm mt-2"
                  onClick={handleOpenCreate}
                >
                  + Agregar el primer juego
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modal para Agregar o Editar Juego */}
      <GameModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        onSaved={handleSavedGame}
        game={modalState.game}
      />

      <Footer />
    </div>
  );
}

export default GamesCatalog;
