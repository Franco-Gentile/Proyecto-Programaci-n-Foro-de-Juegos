import { useState, useEffect, useRef, useCallback } from 'react';
import { getGames, getCategories, searchRawg, importRawgGame } from '../services/forumService';

function GameCategoryPicker({
  selectedGame,
  selectedCategory,
  onSelectGame,
  onSelectCategory,
}) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [importingSlug, setImportingSlug] = useState(null);
  const [importError, setImportError] = useState('');
  const [suggestions, setSuggestions] = useState({
    games: [],
    genres: [],
    rawgGames: [],
  });

  const [initialData, setInitialData] = useState({
    games: [],
    genres: [],
  });
  const [initialLoaded, setInitialLoaded] = useState(false);

  const containerRef = useRef(null);

  // Cargar lista inicial de juegos y categorías para explorar rápido sin necesidad de tipear
  useEffect(() => {
    let isMounted = true;
    async function loadDefaults() {
      try {
        const [gamesList, genresList] = await Promise.all([
          getGames({ page_size: 15 }),
          getCategories({ page_size: 20 }),
        ]);
        if (isMounted) {
          setInitialData({
            games: gamesList || [],
            genres: genresList || [],
          });
          setInitialLoaded(true);
        }
      } catch (err) {
        console.error('Error cargando juegos o categorías iniciales:', err);
      }
    }
    loadDefaults();
    return () => {
      isMounted = false;
    };
  }, []);

  // Cierre al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Búsqueda predictiva con debounce
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions({
        games: [],
        genres: [],
        rawgGames: [],
      });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setImportError('');
      try {
        const [localGames, localGenres, rawgResults] = await Promise.all([
          getGames({ search: trimmed }).catch(() => []),
          getCategories({ search: trimmed }).catch(() => []),
          searchRawg(trimmed).catch(() => []),
        ]);

        // Filtrar RAWG para evitar duplicados si el juego ya existe localmente
        const localSlugs = new Set((localGames || []).map((g) => g.slug?.toLowerCase()));
        const localNames = new Set((localGames || []).map((g) => g.name?.toLowerCase()));

        const filteredRawg = (rawgResults || []).filter((rg) => {
          if (!rg) return false;
          const slugMatch = rg.slug && localSlugs.has(rg.slug.toLowerCase());
          const nameMatch = rg.name && localNames.has(rg.name.toLowerCase());
          return !slugMatch && !nameMatch;
        });

        setSuggestions({
          games: localGames || [],
          genres: localGenres || [],
          rawgGames: filteredRawg.slice(0, 5),
        });
        setIsOpen(true);
      } catch (err) {
        console.error('Error buscando sugerencias:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Selección de juego local
  const handleSelectLocalGame = (game) => {
    if (selectedGame && selectedGame.id === game.id) {
      onSelectGame(null);
    } else {
      onSelectGame(game);
    }
    setIsOpen(false);
  };

  // Selección de género local
  const handleSelectGenre = (genre) => {
    if (selectedCategory && selectedCategory.id === genre.id) {
      onSelectCategory(null);
    } else {
      onSelectCategory(genre);
    }
    setIsOpen(false);
  };

  // Importar desde RAWG y seleccionar automáticamente
  const handleImportAndSelect = async (rawgGame) => {
    if (!rawgGame || !rawgGame.slug) return;
    try {
      setImportingSlug(rawgGame.slug);
      setImportError('');
      const res = await importRawgGame(rawgGame.slug);
      const imported = res.game;
      if (imported) {
        onSelectGame(imported);
        // Si el juego importado trajo géneros y aún no hay género seleccionado, podemos seleccionarle el primero
        if (!selectedCategory && imported.categories && imported.categories.length > 0) {
          onSelectCategory(imported.categories[0]);
        }
      }
      setIsOpen(false);
      setQuery('');
    } catch (err) {
      if (err.message && (err.message.includes('permission') || err.message.includes('permiso') || err.message.includes('403') || err.message.includes('credenciales'))) {
        setImportError('Solo los administradores o moderadores pueden incorporar títulos nuevos desde RAWG.');
      } else {
        setImportError(err.message || 'Error al importar juego de RAWG.');
      }
    } finally {
      setImportingSlug(null);
    }
  };

  const hasSearchQuery = query.trim().length >= 2;
  const currentGames = hasSearchQuery ? suggestions.games : initialData.games;
  const currentGenres = hasSearchQuery ? suggestions.genres : initialData.genres;
  const currentRawg = hasSearchQuery ? suggestions.rawgGames : [];

  const hasAnyResults = currentGames.length > 0 || currentGenres.length > 0 || currentRawg.length > 0;

  return (
    <div ref={containerRef} className="position-relative w-100 mb-3">
      {/* Chips de Selección Activa */}
      <div className="d-flex flex-wrap gap-2 align-items-center mb-2">
        {selectedGame ? (
          <div
            className="d-inline-flex align-items-center gap-2 px-3 py-1"
            style={{
              backgroundColor: '#fef3c7',
              border: '2px solid #d97706',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#92400e',
              boxShadow: '2px 2px 0px rgba(0,0,0,0.1)',
            }}
          >
            {selectedGame.image_url ? (
              <img
                src={selectedGame.image_url}
                alt={selectedGame.name}
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <span>🎮</span>
            )}
            <span>Juego: {selectedGame.name}</span>
            <button
              type="button"
              className="btn btn-sm btn-link p-0 text-danger ms-1 fw-bold"
              style={{ textDecoration: 'none', lineHeight: 1 }}
              onClick={() => onSelectGame(null)}
              title="Quitar juego"
            >
              ✕
            </button>
          </div>
        ) : null}

        {selectedCategory ? (
          <div
            className="d-inline-flex align-items-center gap-2 px-3 py-1"
            style={{
              backgroundColor: '#ede9fe',
              border: '2px solid #7c3aed',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#5b21b6',
              boxShadow: '2px 2px 0px rgba(0,0,0,0.1)',
            }}
          >
            <span>🏷️</span>
            <span>Género: {selectedCategory.name}</span>
            <button
              type="button"
              className="btn btn-sm btn-link p-0 text-danger ms-1 fw-bold"
              style={{ textDecoration: 'none', lineHeight: 1 }}
              onClick={() => onSelectCategory(null)}
              title="Quitar género"
            >
              ✕
            </button>
          </div>
        ) : null}

        {!selectedGame && !selectedCategory && (
          <span className="small text-muted fst-italic">
            Sin juego ni género seleccionado aún. Buscá o elegí abajo.
          </span>
        )}
      </div>

      {/* Input de Búsqueda tipo Cápsula (mismo planteamiento que Navbar) */}
      <div className="position-relative">
        <div
          className="search-capsule-container w-100"
          style={{ maxWidth: '100%' }}
        >
          <input
            className="search-capsule-input w-100"
            type="search"
            placeholder="Buscar juego o género (ej: Elden Ring, RPG, Cyberpunk)..."
            aria-label="Buscar juegos o géneros"
            value={query}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            style={{
              paddingRight: query ? '70px' : '45px',
            }}
          />

          {query && (
            <button
              type="button"
              className="btn btn-sm btn-link text-muted p-0 position-absolute"
              onClick={() => {
                setQuery('');
              }}
              style={{
                right: '48px',
                top: '50%',
                transform: 'translateY(-50%)',
                textDecoration: 'none',
                fontSize: '14px',
                zIndex: 4,
              }}
              title="Limpiar búsqueda"
            >
              ✕
            </button>
          )}

          <button
            className="search-circle-btn"
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label="Abrir opciones"
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

      {/* Mensaje de error al importar */}
      {importError && (
        <div className="alert alert-danger py-2 px-3 mt-2 small">
          {importError}
        </div>
      )}

      {/* Dropdown Flotante de Sugerencias y Exploración */}
      {isOpen && (
        <div
          className="search-suggestions-dropdown w-100"
          role="listbox"
          style={{
            maxHeight: '380px',
            overflowY: 'auto',
            zIndex: 1050,
          }}
        >
          {loading && (
            <div className="p-3 text-center text-muted small">
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Buscando en el foro y en RAWG...
            </div>
          )}

          {!loading && !hasAnyResults && (
            <div className="p-3 text-center text-muted small">
              No se encontraron juegos ni géneros para "{query}".
            </div>
          )}

          {/* SECCIÓN 1: JUEGOS EN EL FORO */}
          {!loading && currentGames.length > 0 && (
            <div className="suggestion-section">
              <div className="suggestion-section-title d-flex justify-content-between align-items-center">
                <span>🎮 {hasSearchQuery ? 'Juegos en el Foro' : 'Juegos Populares'}</span>
                <span className="small text-muted" style={{ fontSize: '10px' }}>
                  {hasSearchQuery ? `${currentGames.length} encontrados` : 'Sugeridos'}
                </span>
              </div>
              {currentGames.map((game) => {
                const isSelected = selectedGame?.id === game.id;
                return (
                  <button
                    key={`game-${game.id}`}
                    type="button"
                    className={`suggestion-item w-100 text-start d-flex justify-content-between align-items-center ${
                      isSelected ? 'bg-warning-subtle' : ''
                    }`}
                    onClick={() => handleSelectLocalGame(game)}
                  >
                    <div className="d-flex align-items-center gap-2 text-truncate">
                      {game.image_url ? (
                        <img
                          src={game.image_url}
                          alt={game.name}
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '6px',
                            objectFit: 'cover',
                            border: '1.5px solid var(--border-dark)',
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: '16px' }}>🕹️</span>
                      )}
                      <span className="fw-bold text-dark text-truncate">{game.name}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      {game.post_count !== undefined && (
                        <span
                          className="badge bg-light text-dark border"
                          style={{ fontSize: '10px', fontFamily: 'var(--font-pixel)' }}
                        >
                          {game.post_count} posts
                        </span>
                      )}
                      {isSelected && (
                        <span className="badge bg-success text-white" style={{ fontSize: '10px' }}>
                          ✓ Elegido
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* SECCIÓN 2: GÉNEROS */}
          {!loading && currentGenres.length > 0 && (
            <div className="suggestion-section">
              <div className="suggestion-section-title d-flex justify-content-between align-items-center">
                <span>🏷️ {hasSearchQuery ? 'Géneros encontrados' : 'Géneros del Foro'}</span>
              </div>
              {currentGenres.map((genre) => {
                const isSelected = selectedCategory?.id === genre.id;
                return (
                  <button
                    key={`genre-${genre.id}`}
                    type="button"
                    className={`suggestion-item w-100 text-start d-flex justify-content-between align-items-center ${
                      isSelected ? 'bg-primary-subtle' : ''
                    }`}
                    onClick={() => handleSelectGenre(genre)}
                  >
                    <div className="d-flex align-items-center gap-2 text-truncate">
                      <span>📁</span>
                      <span className="text-dark text-truncate">{genre.name}</span>
                    </div>
                    {isSelected && (
                      <span className="badge bg-success text-white" style={{ fontSize: '10px' }}>
                        ✓ Elegido
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* SECCIÓN 3: JUEGOS DE LA WEB (RAWG) - Para importar y postear */}
          {!loading && currentRawg.length > 0 && (
            <div className="suggestion-section border-top pt-2">
              <div
                className="suggestion-section-title d-flex justify-content-between align-items-center"
                style={{ color: '#0369a1' }}
              >
                <span>🌐 Juegos en RAWG (Clic para importar al foro y postear)</span>
                <span className="badge bg-info text-dark" style={{ fontSize: '9px' }}>
                  Web
                </span>
              </div>
              {currentRawg.map((rawgGame) => {
                const isImporting = importingSlug === rawgGame.slug;
                return (
                  <button
                    key={`rawg-${rawgGame.slug}`}
                    type="button"
                    className="suggestion-item w-100 text-start d-flex justify-content-between align-items-center"
                    onClick={() => handleImportAndSelect(rawgGame)}
                    disabled={isImporting}
                    style={{
                      backgroundColor: '#f0f9ff',
                    }}
                  >
                    <div className="d-flex align-items-center gap-2 text-truncate">
                      {rawgGame.image_url ? (
                        <img
                          src={rawgGame.image_url}
                          alt={rawgGame.name}
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '6px',
                            objectFit: 'cover',
                            border: '1.5px solid #0284c7',
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: '16px' }}>👾</span>
                      )}
                      <div>
                        <div className="fw-bold text-dark text-truncate">{rawgGame.name}</div>
                        <div className="text-muted" style={{ fontSize: '10px' }}>
                          No está en el foro aún • Clic para traerlo
                        </div>
                      </div>
                    </div>
                    <div>
                      {isImporting ? (
                        <span className="spinner-border spinner-border-sm text-primary" role="status"></span>
                      ) : (
                        <span
                          className="badge"
                          style={{
                            backgroundColor: '#0284c7',
                            color: '#ffffff',
                            fontFamily: 'var(--font-pixel)',
                            fontSize: '10px',
                          }}
                        >
                          + Traer y Elegir
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Ayuda visual bajo el selector */}
      <div className="mt-1 d-flex justify-content-between align-items-center flex-wrap gap-1">
        <span className="small text-muted" style={{ fontSize: '11px' }}>
          💡 Podés seleccionar un Juego, un Género o ambos a la vez para clasificar tu post.
        </span>
        {hasAnyResults && isOpen && (
          <button
            type="button"
            className="btn btn-sm btn-link p-0 text-secondary"
            onClick={() => setIsOpen(false)}
            style={{ fontSize: '11px' }}
          >
            Cerrar lista ✕
          </button>
        )}
      </div>
    </div>
  );
}

export default GameCategoryPicker;
