import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getGames,
  searchRawg,
  importRawgGame,
  deleteGame,
  updateGame,
  getReports,
  updateReportStatus,
  deletePost,
  deleteComment,
  getUsers,
} from '../services/forumService';

function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('genres'); // 'genres' | 'games' | 'reports' | 'users'

  // State: Géneros (Categorías)
  const [genres, setGenres] = useState([]);
  const [loadingGenres, setLoadingGenres] = useState(false);
  const [genreName, setGenreName] = useState('');
  const [genreDesc, setGenreDesc] = useState('');
  const [editingGenreId, setEditingGenreId] = useState(null);
  const [genreActionLoading, setGenreActionLoading] = useState(false);

  // State: Juegos (RAWG y Edición)
  const [games, setGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(false);
  const [rawgQuery, setRawgQuery] = useState('');
  const [rawgResults, setRawgResults] = useState([]);
  const [searchingRawg, setSearchingRawg] = useState(false);
  const [gameActionLoading, setGameActionLoading] = useState(false);
  const [editingGameId, setEditingGameId] = useState(null);
  const [editGameName, setEditGameName] = useState('');
  const [editGameDesc, setEditGameDesc] = useState('');
  const [editGameImage, setEditGameImage] = useState('');

  // State: Reportes
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);

  // State: Usuarios
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Notificaciones (Toast simplificado)
  const [notification, setNotification] = useState({ type: '', msg: '' });

  const showNotification = (type, msg) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification({ type: '', msg: '' }), 4000);
  };

  /* ========================================================================
     CARGAS INICIALES (FETCHES)
     ======================================================================== */
  const loadGenres = useCallback(async () => {
    try {
      setLoadingGenres(true);
      const data = await getCategories();
      setGenres(data);
    } catch (err) {
      showNotification('danger', 'Error al cargar géneros');
    } finally {
      setLoadingGenres(false);
    }
  }, []);

  const loadGames = useCallback(async () => {
    try {
      setLoadingGames(true);
      const data = await getGames();
      setGames(data);
    } catch (err) {
      showNotification('danger', 'Error al cargar juegos');
    } finally {
      setLoadingGames(false);
    }
  }, []);

  const loadReports = useCallback(async () => {
    try {
      setLoadingReports(true);
      const data = await getReports();
      setReports(data);
    } catch (err) {
      showNotification('danger', 'Error al cargar reportes');
    } finally {
      setLoadingReports(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const data = await getUsers();
      setUsersList(data);
    } catch (err) {
      showNotification('danger', 'Error al cargar usuarios');
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'genres') loadGenres();
    if (activeTab === 'games') loadGames();
    if (activeTab === 'reports') loadReports();
    if (activeTab === 'users') loadUsers();
  }, [activeTab, loadGenres, loadGames, loadReports, loadUsers]);

  /* ========================================================================
     HANDLERS: GÉNEROS (CATEGORIES)
     ======================================================================== */
  const handleSaveGenre = async (e) => {
    e.preventDefault();
    if (!genreName.trim()) return;

    try {
      setGenreActionLoading(true);
      if (editingGenreId) {
        const updated = await updateCategory(editingGenreId, {
          name: genreName.trim(),
          description: genreDesc.trim(),
        });
        setGenres((prev) =>
          prev.map((c) => (c.id === editingGenreId ? updated : c))
        );
        showNotification('success', 'Género actualizado exitosamente');
        setEditingGenreId(null);
      } else {
        const created = await createCategory({
          name: genreName.trim(),
          description: genreDesc.trim(),
        });
        setGenres((prev) => [...prev, created]);
        showNotification('success', 'Género creado exitosamente');
      }
      setGenreName('');
      setGenreDesc('');
    } catch (err) {
      showNotification('danger', err.message || 'Error al guardar género');
    } finally {
      setGenreActionLoading(false);
    }
  };

  const handleEditGenreClick = (genre) => {
    setEditingGenreId(genre.id);
    setGenreName(genre.name);
    setGenreDesc(genre.description || '');
  };

  const handleCancelGenreEdit = () => {
    setEditingGenreId(null);
    setGenreName('');
    setGenreDesc('');
  };

  const handleDeleteGenre = async (id, name) => {
    if (!window.confirm(`¿Seguro que deseás eliminar el género "${name}"?`)) return;
    try {
      await deleteCategory(id);
      setGenres((prev) => prev.filter((c) => c.id !== id));
      showNotification('success', `Género "${name}" eliminado`);
    } catch (err) {
      showNotification('danger', err.message || 'Error al eliminar género');
    }
  };

  /* ========================================================================
     HANDLERS: JUEGOS (GAMES)
     ======================================================================== */
  const handleSearchRawg = async (e) => {
    e.preventDefault();
    if (!rawgQuery.trim()) return;

    try {
      setSearchingRawg(true);
      const results = await searchRawg(rawgQuery.trim());
      setRawgResults(results);
      if (results.length === 0) {
        showNotification('warning', 'No se encontraron resultados en RAWG');
      }
    } catch (err) {
      showNotification('danger', err.message || 'Error al buscar en RAWG');
    } finally {
      setSearchingRawg(false);
    }
  };

  const handleImportSelectedGame = async (slug) => {
    try {
      setGameActionLoading(true);
      const response = await importRawgGame(slug);
      const created = response.game;
      setGames((prev) => {
        const exists = prev.find((g) => g.id === created.id);
        if (exists) return prev.map((g) => (g.id === created.id ? created : g));
        return [...prev, created];
      });
      showNotification('success', 'Juego importado exitosamente desde RAWG. Podés revisar o editar sus datos ahora.');
      setRawgQuery('');
      setRawgResults([]);
      
      // Abrir automáticamente el modo de edición con los datos recién traídos
      handleEditGameClick(created);
    } catch (err) {
      showNotification('danger', err.message || 'Error al importar juego de RAWG');
    } finally {
      setGameActionLoading(false);
    }
  };

  const handleDeleteGame = async (id, name) => {
    if (!window.confirm(`¿Seguro que deseás eliminar el juego "${name}"?`)) return;
    try {
      await deleteGame(id);
      setGames((prev) => prev.filter((g) => g.id !== id));
      showNotification('success', `Juego "${name}" eliminado`);
    } catch (err) {
      showNotification('danger', err.message || 'Error al eliminar juego');
    }
  };

  const handleEditGameClick = (game) => {
    setEditingGameId(game.id);
    setEditGameName(game.name);
    setEditGameDesc(game.description || '');
    setEditGameImage(game.image_url || '');
  };

  const handleCancelGameEdit = () => {
    setEditingGameId(null);
    setEditGameName('');
    setEditGameDesc('');
    setEditGameImage('');
  };

  const handleSaveEditedGame = async (e) => {
    e.preventDefault();
    if (!editGameName.trim()) return;

    try {
      setGameActionLoading(true);
      // Wait, we need to import updateGame from forumService if we haven't already. Let's check imports later.
      // Assuming updateGame exists:
      const updated = await updateGame(editingGameId, {
        name: editGameName.trim(),
        description: editGameDesc.trim(),
        image_url: editGameImage.trim() || null,
      });
      setGames((prev) => prev.map((g) => (g.id === editingGameId ? updated : g)));
      showNotification('success', 'Juego actualizado exitosamente');
      setEditingGameId(null);
    } catch (err) {
      showNotification('danger', err.message || 'Error al actualizar juego');
    } finally {
      setGameActionLoading(false);
    }
  };

  /* ========================================================================
     HANDLERS: REPORTES
     ======================================================================== */
  const handleResolveReport = async (reportId) => {
    try {
      const updated = await updateReportStatus(reportId, 'RESOLVED');
      setReports((prev) => prev.map((r) => (r.id === reportId ? updated : r)));
      showNotification('success', 'Reporte marcado como resuelto');
    } catch (err) {
      showNotification('danger', 'Error al resolver reporte');
    }
  };

  const handleDismissReport = async (reportId) => {
    try {
      const updated = await updateReportStatus(reportId, 'DISMISSED');
      setReports((prev) => prev.map((r) => (r.id === reportId ? updated : r)));
      showNotification('success', 'Reporte descartado');
    } catch (err) {
      showNotification('danger', 'Error al descartar reporte');
    }
  };

  const handleDeleteReportedItem = async (report) => {
    if (!window.confirm('¿Seguro que deseás eliminar el contenido reportado? Esta acción es irreversible.')) return;
    try {
      if (report.post_id) {
        await deletePost(report.post_id);
      } else if (report.comment_id) {
        await deleteComment(report.comment_id);
      }
      await updateReportStatus(report.id, 'RESOLVED');
      setReports((prev) => prev.map((r) => (r.id === report.id ? { ...r, status: 'RESOLVED' } : r)));
      showNotification('success', 'Contenido eliminado y reporte resuelto');
    } catch (err) {
      showNotification('danger', 'Error al eliminar el contenido');
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: 'var(--bg-main)' }}>
      <Navbar />

      <main className="container my-5 flex-grow-1">
        <h1 className="mb-4" style={{ fontFamily: 'var(--font-pixel)', fontSize: '28px', color: 'var(--text-dark)' }}>
          🛠️ Panel de Administración
        </h1>

        {/* Notificaciones OSD */}
        {notification.msg && (
          <div
            className={`alert alert-${notification.type} alert-dismissible fade show`}
            role="alert"
            style={{ border: '2px solid var(--border-dark)', borderRadius: '8px' }}
          >
            {notification.msg}
            <button
              type="button"
              className="btn-close"
              onClick={() => setNotification({ type: '', msg: '' })}
            ></button>
          </div>
        )}

        <div className="card" style={{ border: '3px solid var(--border-dark)', borderRadius: '12px', overflow: 'hidden' }}>
          
          {/* TABS DE NAVEGACIÓN */}
          <div className="card-header bg-white border-bottom" style={{ borderColor: 'var(--border-dark) !important' }}>
            <ul className="nav nav-pills card-header-pills gap-2">
              <li className="nav-item">
                <button
                  className={`nav-link fw-bold ${activeTab === 'genres' ? 'active' : ''}`}
                  onClick={() => setActiveTab('genres')}
                  style={{
                    color: activeTab === 'genres' ? '#ffffff' : 'var(--text-dark)',
                    backgroundColor: activeTab === 'genres' ? '#6366f1' : 'transparent',
                    border: activeTab === 'genres' ? '2px solid var(--border-dark)' : '2px solid transparent',
                  }}
                >
                  🏷️ Géneros ({genres.length})
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link fw-bold ${activeTab === 'games' ? 'active' : ''}`}
                  onClick={() => setActiveTab('games')}
                  style={{
                    color: activeTab === 'games' ? '#ffffff' : 'var(--text-dark)',
                    backgroundColor: activeTab === 'games' ? '#6366f1' : 'transparent',
                    border: activeTab === 'games' ? '2px solid var(--border-dark)' : '2px solid transparent',
                  }}
                >
                  🎮 Juegos ({games.length})
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link fw-bold ${activeTab === 'reports' ? 'active' : ''}`}
                  onClick={() => setActiveTab('reports')}
                  style={{
                    color: activeTab === 'reports' ? '#ffffff' : 'var(--text-dark)',
                    backgroundColor: activeTab === 'reports' ? '#ef4444' : 'transparent',
                    border: activeTab === 'reports' ? '2px solid var(--border-dark)' : '2px solid transparent',
                  }}
                >
                  🚨 Reportes ({reports.filter(r => r.status === 'PENDING').length})
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link fw-bold ${activeTab === 'users' ? 'active' : ''}`}
                  onClick={() => setActiveTab('users')}
                  style={{
                    color: activeTab === 'users' ? '#ffffff' : 'var(--text-dark)',
                    backgroundColor: activeTab === 'users' ? '#10b981' : 'transparent',
                    border: activeTab === 'users' ? '2px solid var(--border-dark)' : '2px solid transparent',
                  }}
                >
                  👥 Usuarios ({usersList.length})
                </button>
              </li>
            </ul>
          </div>

          <div className="card-body p-4">
            
            {/* =======================================================
                TAB 1: GÉNEROS (CATEGORIES)
                ======================================================= */}
            {activeTab === 'genres' && (
              <div className="row g-4">
                {/* Formulario de Géneros */}
                <div className="col-12 col-lg-4">
                  <div className="p-3 bg-light" style={{ border: '2px solid var(--border-dark)', borderRadius: '12px' }}>
                    <h5 className="fw-bold mb-3">
                      {editingGenreId ? 'Editar Género' : 'Crear Nuevo Género'}
                    </h5>
                    <form onSubmit={handleSaveGenre}>
                      <div className="mb-3">
                        <label className="form-label fw-bold small">Nombre del Género *</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Ej: RPG, Acción, Shooter..."
                          value={genreName}
                          onChange={(e) => setGenreName(e.target.value)}
                          required
                          style={{ border: '2px solid var(--border-dark)', borderRadius: '8px' }}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold small">Descripción (opcional)</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          placeholder="Breve descripción..."
                          value={genreDesc}
                          onChange={(e) => setGenreDesc(e.target.value)}
                          style={{ border: '2px solid var(--border-dark)', borderRadius: '8px' }}
                        ></textarea>
                      </div>
                      <div className="d-flex gap-2 justify-content-end">
                        {editingGenreId && (
                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm"
                            onClick={handleCancelGenreEdit}
                            disabled={genreActionLoading}
                          >
                            Cancelar
                          </button>
                        )}
                        <button
                          type="submit"
                          className="btn btn-sm"
                          disabled={genreActionLoading}
                          style={{ backgroundColor: '#10b981', color: 'white', border: '2px solid var(--border-dark)' }}
                        >
                          {genreActionLoading ? 'Guardando...' : (editingGenreId ? 'Guardar Cambios' : 'Crear Género')}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Lista de Géneros */}
                <div className="col-12 col-lg-8">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold m-0">Listado de Géneros</h5>
                    <button className="btn btn-sm btn-outline-dark" onClick={loadGenres} disabled={loadingGenres}>
                      🔄 Refrescar
                    </button>
                  </div>

                  {loadingGenres ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-secondary" role="status"></div>
                    </div>
                  ) : genres.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      No hay géneros creados aún.
                    </div>
                  ) : (
                    <div className="table-responsive" style={{ border: '2px solid var(--border-dark)', borderRadius: '8px' }}>
                      <table className="table table-hover table-borderless m-0 align-middle">
                        <thead className="table-light border-bottom" style={{ borderColor: 'var(--border-dark) !important' }}>
                          <tr>
                            <th>Nombre</th>
                            <th>Descripción</th>
                            <th className="text-end">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {genres.map((genre) => (
                            <tr key={genre.id} className="border-bottom">
                              <td className="fw-bold">{genre.name}</td>
                              <td className="text-muted small">{genre.description || '-'}</td>
                              <td className="text-end">
                                <div className="btn-group">
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => handleEditGenreClick(genre)}
                                    title="Editar"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDeleteGenre(genre.id, genre.name)}
                                    title="Eliminar"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* =======================================================
                TAB 2: JUEGOS (GAMES & RAWG)
                ======================================================= */}
            {activeTab === 'games' && (
              <div className="row g-4">
                {/* Formulario de Juegos */}
                <div className="col-12 col-lg-4">
                  <div className="p-3 bg-light" style={{ border: '2px solid var(--border-dark)', borderRadius: '12px' }}>
                    <h5 className="fw-bold mb-3">{editingGameId ? 'Editar Juego Manualmente' : 'Importar Juego de RAWG'}</h5>
                    
                    {!editingGameId ? (
                      <>
                        <p className="text-muted small mb-3">
                          Buscá un juego en la base de datos de RAWG y seleccionalo para importarlo al foro.
                        </p>
                        <form onSubmit={handleSearchRawg}>
                          <div className="input-group mb-3">
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Ej: Fallout 3, Skyrim..."
                              value={rawgQuery}
                              onChange={(e) => setRawgQuery(e.target.value)}
                              style={{ border: '2px solid var(--border-dark)' }}
                            />
                            <button
                              type="submit"
                              className="btn"
                              disabled={searchingRawg}
                              style={{ backgroundColor: '#6366f1', color: 'white', border: '2px solid var(--border-dark)' }}
                            >
                              {searchingRawg ? 'Buscando...' : '🔍'}
                            </button>
                          </div>
                        </form>

                        {/* Resultados de búsqueda RAWG */}
                        {rawgResults.length > 0 && (
                          <div className="mt-3" style={{ maxHeight: '350px', overflowY: 'auto', border: '2px solid var(--border-dark)', borderRadius: '8px', backgroundColor: 'white' }}>
                            <ul className="list-group list-group-flush m-0">
                              {rawgResults.map((res) => (
                                <li key={res.slug} className="list-group-item d-flex align-items-center gap-2 p-2">
                                  {res.image_url ? (
                                    <img src={res.image_url} alt={res.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                  ) : (
                                    <div style={{ width: '40px', height: '40px', backgroundColor: '#e5e7eb', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🎮</div>
                                  )}
                                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                                    <div className="fw-bold text-truncate" style={{ fontSize: '13px' }} title={res.name}>{res.name}</div>
                                    <div className="text-muted small" style={{ fontSize: '11px' }}>{res.slug}</div>
                                  </div>
                                  <button
                                    className="btn btn-sm"
                                    onClick={() => handleImportSelectedGame(res.slug)}
                                    disabled={gameActionLoading}
                                    style={{ backgroundColor: '#10b981', color: 'white', border: '1px solid var(--border-dark)', fontSize: '11px', padding: '2px 8px' }}
                                  >
                                    ➕ Agregar
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    ) : (
                      <form onSubmit={handleSaveEditedGame}>
                        <div className="mb-3">
                          <label className="form-label fw-bold small">Nombre *</label>
                          <input
                            type="text"
                            className="form-control"
                            value={editGameName}
                            onChange={(e) => setEditGameName(e.target.value)}
                            required
                            style={{ border: '2px solid var(--border-dark)', borderRadius: '8px' }}
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-bold small">URL de Portada</label>
                          <input
                            type="url"
                            className="form-control mb-2"
                            value={editGameImage}
                            onChange={(e) => setEditGameImage(e.target.value)}
                            style={{ border: '2px solid var(--border-dark)', borderRadius: '8px' }}
                          />
                          {editGameImage && (
                            <div className="text-center p-2 mt-2" style={{ border: '2px dashed var(--border-dark)', borderRadius: '8px', backgroundColor: 'white' }}>
                              <p className="small text-muted mb-1">Vista previa:</p>
                              <img src={editGameImage} alt="Vista previa de portada" style={{ maxHeight: '150px', maxWidth: '100%', objectFit: 'contain', borderRadius: '4px' }} />
                            </div>
                          )}
                        </div>
                        <div className="mb-3">
                          <label className="form-label fw-bold small">Descripción (HTML)</label>
                          <textarea
                            className="form-control"
                            rows="4"
                            value={editGameDesc}
                            onChange={(e) => setEditGameDesc(e.target.value)}
                            style={{ border: '2px solid var(--border-dark)', borderRadius: '8px' }}
                          ></textarea>
                        </div>
                        <div className="d-flex gap-2 justify-content-end">
                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm"
                            onClick={handleCancelGameEdit}
                            disabled={gameActionLoading}
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            className="btn btn-sm"
                            disabled={gameActionLoading}
                            style={{ backgroundColor: '#10b981', color: 'white', border: '2px solid var(--border-dark)' }}
                          >
                            {gameActionLoading ? 'Guardando...' : 'Guardar Cambios'}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>

                {/* Lista de Juegos */}
                <div className="col-12 col-lg-8">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold m-0">Listado de Juegos</h5>
                    <button className="btn btn-sm btn-outline-dark" onClick={loadGames} disabled={loadingGames}>
                      🔄 Refrescar
                    </button>
                  </div>

                  {loadingGames ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-secondary" role="status"></div>
                    </div>
                  ) : games.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      No hay juegos importados aún.
                    </div>
                  ) : (
                    <div className="table-responsive" style={{ border: '2px solid var(--border-dark)', borderRadius: '8px' }}>
                      <table className="table table-hover table-borderless m-0 align-middle">
                        <thead className="table-light border-bottom" style={{ borderColor: 'var(--border-dark) !important' }}>
                          <tr>
                            <th>Portada</th>
                            <th>Nombre</th>
                            <th>Géneros RAWG</th>
                            <th className="text-end">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {games.map((game) => (
                            <tr key={game.id} className="border-bottom">
                              <td>
                                {game.image_url ? (
                                  <img src={game.image_url} alt={game.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-dark)' }} />
                                ) : '🎮'}
                              </td>
                              <td className="fw-bold">{game.name}</td>
                              <td className="text-muted small">
                                {game.genres && game.genres.length > 0 ? game.genres.map(g => g.name).join(', ') : '-'}
                              </td>
                              <td className="text-end">
                                <div className="btn-group">
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => handleEditGameClick(game)}
                                    title="Editar"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDeleteGame(game.id, game.name)}
                                    title="Eliminar"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* =======================================================
                TAB 3: REPORTES
                ======================================================= */}
            {activeTab === 'reports' && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold m-0">Gestión de Reportes</h5>
                  <button className="btn btn-sm btn-outline-dark" onClick={loadReports} disabled={loadingReports}>
                    🔄 Refrescar
                  </button>
                </div>

                {loadingReports ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-secondary" role="status"></div>
                  </div>
                ) : reports.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    No hay reportes actualmente.
                  </div>
                ) : (
                  <div className="row g-3">
                    {reports.map((report) => (
                      <div className="col-12 col-lg-6" key={report.id}>
                        <div
                          className={`card h-100 ${report.status === 'PENDING' ? 'border-danger' : 'border-secondary'}`}
                          style={{
                            borderWidth: '2px',
                            borderStyle: 'solid',
                            opacity: report.status !== 'PENDING' ? 0.7 : 1,
                          }}
                        >
                          <div className="card-body">
                            <div className="d-flex justify-content-between mb-2">
                              <span className={`badge ${report.status === 'PENDING' ? 'bg-danger' : 'bg-secondary'}`}>
                                {report.status === 'PENDING' ? 'Pendiente' : report.status === 'RESOLVED' ? 'Resuelto' : 'Descartado'}
                              </span>
                              <span className="small text-muted">ID: {report.id}</span>
                            </div>
                            <p className="fw-bold mb-1">Motivo:</p>
                            <p className="text-muted small mb-3 p-2 bg-light rounded border">{report.reason}</p>
                            
                            <p className="small mb-1">
                              <strong>Tipo:</strong> {report.post_id ? 'Publicación' : 'Comentario'}
                            </p>
                            <p className="small mb-3">
                              <strong>Reportado por:</strong> {typeof report.reporter === 'string' ? report.reporter : report.reporter?.username || 'Usuario'}
                            </p>

                            {report.status === 'PENDING' && (
                              <div className="d-flex gap-2">
                                <button
                                  className="btn btn-sm btn-outline-danger flex-grow-1"
                                  onClick={() => handleDeleteReportedItem(report)}
                                >
                                  Borrar Contenido
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-secondary flex-grow-1"
                                  onClick={() => handleDismissReport(report.id)}
                                >
                                  Descartar
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* =======================================================
                TAB 4: USUARIOS
                ======================================================= */}
            {activeTab === 'users' && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold m-0">Lista de Usuarios</h5>
                  <button className="btn btn-sm btn-outline-dark" onClick={loadUsers} disabled={loadingUsers}>
                    🔄 Refrescar
                  </button>
                </div>

                {loadingUsers ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-secondary" role="status"></div>
                  </div>
                ) : usersList.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    No hay usuarios registrados.
                  </div>
                ) : (
                  <div className="table-responsive" style={{ border: '2px solid var(--border-dark)', borderRadius: '8px' }}>
                    <table className="table table-hover table-borderless m-0 align-middle">
                      <thead className="table-light border-bottom" style={{ borderColor: 'var(--border-dark) !important' }}>
                        <tr>
                          <th>ID</th>
                          <th>Usuario</th>
                          <th>Email</th>
                          <th>Rol</th>
                          <th>Fecha Registro</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usersList.map((u) => (
                          <tr key={u.id} className="border-bottom">
                            <td className="text-muted small">#{u.id}</td>
                            <td className="fw-bold">{u.username}</td>
                            <td>{u.email}</td>
                            <td>
                              <span className={`badge ${
                                u.role === 'ADMIN' ? 'bg-danger' : u.role === 'MODERATOR' ? 'bg-warning text-dark' : 'bg-primary'
                              }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="text-muted small">
                              {new Date(u.date_joined).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default AdminDashboard;
