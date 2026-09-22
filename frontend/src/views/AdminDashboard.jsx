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
  getReports,
  updateReportStatus,
  deletePost,
  deleteComment,
  getUsers,
} from '../services/forumService';

function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('categories'); // 'categories' | 'reports' | 'users'

  // State: Categorías
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(false);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [editingCatId, setEditingCatId] = useState(null);
  const [catActionLoading, setCatActionLoading] = useState(false);

  // State: Reportes
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);

  // State: Usuarios
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Notificaciones / Mensajes
  const [message, setMessage] = useState({ type: '', text: '' });

  const showNotification = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3500);
  };

  // Carga de categorías
  const loadCategories = useCallback(async () => {
    try {
      setLoadingCats(true);
      const data = await getCategories();
      setCategories(data);
    } catch (_err) {
      showNotification('danger', 'Error al cargar categorías');
    } finally {
      setLoadingCats(false);
    }
  }, []);

  // Carga de reportes
  const loadReports = useCallback(async () => {
    try {
      setLoadingReports(true);
      const data = await getReports();
      setReports(data);
    } catch (_err) {
      showNotification('danger', 'Error al cargar reportes');
    } finally {
      setLoadingReports(false);
    }
  }, []);

  // Carga de usuarios (solo ADMIN)
  const loadUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const data = await getUsers();
      setUsersList(data);
    } catch (_err) {
      showNotification('warning', 'No se pudieron cargar los usuarios (solo ADMIN)');
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'categories') loadCategories();
    if (activeTab === 'reports') loadReports();
    if (activeTab === 'users') loadUsers();
  }, [activeTab, loadCategories, loadReports, loadUsers]);

  // Handlers Categorías
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!catName.trim()) return;

    try {
      setCatActionLoading(true);
      if (editingCatId) {
        const updated = await updateCategory(editingCatId, {
          name: catName.trim(),
          description: catDesc.trim(),
        });
        setCategories((prev) =>
          prev.map((c) => (c.id === editingCatId ? updated : c))
        );
        showNotification('success', 'Categoría actualizada exitosamente');
        setEditingCatId(null);
      } else {
        const created = await createCategory({
          name: catName.trim(),
          description: catDesc.trim(),
        });
        setCategories((prev) => [...prev, created]);
        showNotification('success', 'Categoría creada exitosamente');
      }
      setCatName('');
      setCatDesc('');
    } catch (err) {
      showNotification('danger', err.message || 'Error al guardar categoría');
    } finally {
      setCatActionLoading(false);
    }
  };

  const handleEditClick = (cat) => {
    setEditingCatId(cat.id);
    setCatName(cat.name);
    setCatDesc(cat.description || '');
  };

  const handleCancelEdit = () => {
    setEditingCatId(null);
    setCatName('');
    setCatDesc('');
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`¿Seguro que deseás eliminar la categoría "${name}"?`)) return;
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      showNotification('success', `Categoría "${name}" eliminada`);
    } catch (err) {
      showNotification('danger', err.message || 'Error al eliminar categoría');
    }
  };

  // Handlers Reportes
  const handleUpdateReportStatus = async (reportId, newStatus) => {
    try {
      await updateReportStatus(reportId, newStatus);
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r))
      );
      showNotification('success', `Reporte actualizado a ${newStatus}`);
    } catch (_err) {
      showNotification('danger', 'No se pudo actualizar el estado');
    }
  };

  const handleDeleteReportedItem = async (report) => {
    if (report.post) {
      if (!window.confirm('¿Eliminar la publicación denunciada?')) return;
      try {
        const postId = typeof report.post === 'object' ? report.post.id : report.post_id || report.post;
        await deletePost(postId);
        await updateReportStatus(report.id, 'REVIEWED');
        setReports((prev) =>
          prev.map((r) => (r.id === report.id ? { ...r, status: 'REVIEWED' } : r))
        );
        showNotification('success', 'Publicación eliminada y reporte marcado como revisado');
      } catch (_err) {
        showNotification('danger', 'Error al eliminar la publicación');
      }
    } else if (report.comment) {
      if (!window.confirm('¿Eliminar el comentario denunciado?')) return;
      try {
        const commentId = typeof report.comment === 'object' ? report.comment.id : report.comment_id || report.comment;
        await deleteComment(commentId);
        await updateReportStatus(report.id, 'REVIEWED');
        setReports((prev) =>
          prev.map((r) => (r.id === report.id ? { ...r, status: 'REVIEWED' } : r))
        );
        showNotification('success', 'Comentario eliminado y reporte marcado como revisado');
      } catch (_err) {
        showNotification('danger', 'Error al eliminar el comentario');
      }
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />

      <main className="flex-grow-1 forum-main-layout">
        <div className="container py-4">
          {/* Cabecera del Panel */}
          <div
            className="p-4 mb-4"
            style={{
              backgroundColor: '#ffffff',
              border: '3px solid var(--border-dark)',
              borderRadius: '16px',
              boxShadow: '5px 5px 0px var(--border-dark)',
            }}
          >
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
              <div>
                <span
                  className="badge px-3 py-2 mb-2"
                  style={{
                    backgroundColor: '#fed7aa',
                    color: '#9a3412',
                    border: '2px solid var(--border-dark)',
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '11px',
                  }}
                >
                  ⚙️ ZONA DE ADMINISTRACIÓN & MODERACIÓN
                </span>
                <h1
                  className="mb-1"
                  style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '22px',
                    color: 'var(--text-dark)',
                  }}
                >
                  Panel de Control Gamer
                </h1>
                <p className="text-muted small mb-0">
                  Gestioná comunidades, atendé denuncias de usuarios y administrá la plataforma.
                </p>
              </div>

              <Link
                to="/"
                className="btn btn-outline-dark d-inline-flex align-items-center gap-2"
                style={{
                  border: '2px solid var(--border-dark)',
                  boxShadow: '2px 2px 0px var(--border-dark)',
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '12px',
                }}
              >
                ← Volver al Foro
              </Link>
            </div>
          </div>

          {/* Notificación Toast/Alert */}
          {message.text && (
            <div
              className={`alert alert-${message.type} alert-dismissible fade show`}
              style={{
                border: '2px solid var(--border-dark)',
                boxShadow: '3px 3px 0px var(--border-dark)',
              }}
            >
              {message.text}
            </div>
          )}

          {/* Navegación por pestañas */}
          <ul
            className="nav nav-pills mb-4 gap-2"
            style={{
              backgroundColor: '#ffffff',
              padding: '12px',
              border: '3px solid var(--border-dark)',
              borderRadius: '16px',
              boxShadow: '4px 4px 0px var(--border-dark)',
            }}
          >
            <li className="nav-item">
              <button
                type="button"
                className={`nav-link fw-bold ${activeTab === 'categories' ? 'active' : ''}`}
                onClick={() => setActiveTab('categories')}
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '12px',
                  border: '2px solid var(--border-dark)',
                  borderRadius: '10px',
                  color: activeTab === 'categories' ? '#ffffff' : 'var(--text-dark)',
                  backgroundColor: activeTab === 'categories' ? '#6366f1' : 'transparent',
                }}
              >
                🎮 Categorías / Juegos ({categories.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                type="button"
                className={`nav-link fw-bold ${activeTab === 'reports' ? 'active' : ''}`}
                onClick={() => setActiveTab('reports')}
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '12px',
                  border: '2px solid var(--border-dark)',
                  borderRadius: '10px',
                  color: activeTab === 'reports' ? '#ffffff' : 'var(--text-dark)',
                  backgroundColor: activeTab === 'reports' ? '#ef4444' : 'transparent',
                }}
              >
                🚨 Centro de Reportes ({reports.filter((r) => r.status === 'PENDING').length} pendientes)
              </button>
            </li>
            {user?.role === 'ADMIN' && (
              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link fw-bold ${activeTab === 'users' ? 'active' : ''}`}
                  onClick={() => setActiveTab('users')}
                  style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '12px',
                    border: '2px solid var(--border-dark)',
                    borderRadius: '10px',
                    color: activeTab === 'users' ? '#ffffff' : 'var(--text-dark)',
                    backgroundColor: activeTab === 'users' ? '#10b981' : 'transparent',
                  }}
                >
                  👥 Usuarios ({usersList.length})
                </button>
              </li>
            )}
          </ul>

          {/* TAB 1: CATEGORÍAS */}
          {activeTab === 'categories' && (
            <div className="row g-4">
              {/* Formulario Crear / Editar */}
              <div className="col-12 col-lg-5">
                <div
                  className="p-4"
                  style={{
                    backgroundColor: '#ffffff',
                    border: '3px solid var(--border-dark)',
                    borderRadius: '16px',
                    boxShadow: '5px 5px 0px var(--border-dark)',
                  }}
                >
                  <h3
                    style={{
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '15px',
                      color: 'var(--text-dark)',
                    }}
                  >
                    {editingCatId ? '✏️ Editar Comunidad' : '➕ Nueva Comunidad / Juego'}
                  </h3>
                  <p className="text-muted small mb-3">
                    Creá nuevas categorías de juegos para que la comunidad publique debates.
                  </p>

                  <form onSubmit={handleSaveCategory}>
                    <div className="mb-3">
                      <label className="form-label fw-bold small">Nombre de la Comunidad *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ej: Dark Souls, Valorant, Indie Games..."
                        value={catName}
                        onChange={(e) => setCatName(e.target.value)}
                        required
                        style={{ border: '2px solid var(--border-dark)', borderRadius: '8px' }}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold small">Descripción (opcional)</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="Breve descripción de la temática..."
                        value={catDesc}
                        onChange={(e) => setCatDesc(e.target.value)}
                        style={{ border: '2px solid var(--border-dark)', borderRadius: '8px' }}
                      ></textarea>
                    </div>

                    <div className="d-flex gap-2 justify-content-end">
                      {editingCatId && (
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                          onClick={handleCancelEdit}
                          disabled={catActionLoading}
                        >
                          Cancelar
                        </button>
                      )}
                      <button
                        type="submit"
                        className="btn btn-primary btn-sm d-flex align-items-center gap-2"
                        disabled={catActionLoading}
                        style={{
                          border: '2px solid var(--border-dark)',
                          boxShadow: '2px 2px 0px var(--border-dark)',
                          fontFamily: 'var(--font-pixel)',
                          fontSize: '11px',
                        }}
                      >
                        {catActionLoading ? 'Guardando...' : editingCatId ? 'Actualizar' : 'Guardar'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Lista de Categorías */}
              <div className="col-12 col-lg-7">
                <div
                  className="p-4"
                  style={{
                    backgroundColor: '#ffffff',
                    border: '3px solid var(--border-dark)',
                    borderRadius: '16px',
                    boxShadow: '5px 5px 0px var(--border-dark)',
                  }}
                >
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h3
                      className="mb-0"
                      style={{
                        fontFamily: 'var(--font-pixel)',
                        fontSize: '15px',
                        color: 'var(--text-dark)',
                      }}
                    >
                      Comunidades Existentes
                    </h3>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-dark"
                      onClick={loadCategories}
                      disabled={loadingCats}
                    >
                      🔄 Recargar
                    </button>
                  </div>

                  {loadingCats && (
                    <div className="text-center py-4">
                      <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                    </div>
                  )}

                  {!loadingCats && categories.length === 0 && (
                    <div className="text-center py-4 text-muted small">
                      No hay categorías creadas aún. Creá la primera en el formulario de la izquierda.
                    </div>
                  )}

                  {!loadingCats && categories.length > 0 && (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                          <tr style={{ fontFamily: 'var(--font-pixel)', fontSize: '11px' }}>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Descripción</th>
                            <th className="text-end">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {categories.map((cat) => (
                            <tr key={cat.id}>
                              <td><span className="badge bg-dark">{cat.id}</span></td>
                              <td className="fw-bold">{cat.name}</td>
                              <td className="text-muted small">{cat.description || '-'}</td>
                              <td className="text-end">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-primary me-2"
                                  onClick={() => handleEditClick(cat)}
                                  style={{ fontSize: '11px' }}
                                  title="Editar"
                                >
                                  ✏️
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                  style={{ fontSize: '11px' }}
                                  title="Eliminar"
                                >
                                  🗑️
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REPORTES */}
          {activeTab === 'reports' && (
            <div
              className="p-4"
              style={{
                backgroundColor: '#ffffff',
                border: '3px solid var(--border-dark)',
                borderRadius: '16px',
                boxShadow: '5px 5px 0px var(--border-dark)',
              }}
            >
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h3
                  className="mb-0"
                  style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '16px',
                    color: 'var(--text-dark)',
                  }}
                >
                  🚨 Denuncias de la Comunidad
                </h3>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-dark"
                  onClick={loadReports}
                  disabled={loadingReports}
                >
                  🔄 Recargar
                </button>
              </div>

              {loadingReports && (
                <div className="text-center py-4">
                  <div className="spinner-border spinner-border-sm text-danger" role="status"></div>
                </div>
              )}

              {!loadingReports && reports.length === 0 && (
                <div className="text-center py-5 text-muted">
                  <div style={{ fontSize: '36px' }}>🛡️</div>
                  <p className="mt-2 mb-0">¡Todo limpio! No hay reportes activos ni denuncias pendientes.</p>
                </div>
              )}

              {!loadingReports && reports.length > 0 && (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr style={{ fontFamily: 'var(--font-pixel)', fontSize: '11px' }}>
                        <th>ID</th>
                        <th>Denunciante</th>
                        <th>Contenido</th>
                        <th>Motivo</th>
                        <th>Estado</th>
                        <th className="text-end">Acciones de Moderación</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map((report) => {
                        const reporter =
                          typeof report.reported_by === 'object'
                            ? report.reported_by?.username
                            : report.reported_by || 'Anónimo';

                        const postTitle =
                          typeof report.post === 'object'
                            ? report.post?.title
                            : report.post ? `Post #${report.post}` : null;

                        const commentSnippet =
                          typeof report.comment === 'object'
                            ? report.comment?.content
                            : report.comment ? `Comentario #${report.comment}` : null;

                        const statusBadgeColor =
                          report.status === 'PENDING'
                            ? 'bg-danger text-white'
                            : report.status === 'REVIEWED'
                            ? 'bg-success text-white'
                            : 'bg-secondary text-white';

                        return (
                          <tr key={report.id}>
                            <td>#{report.id}</td>
                            <td>
                              <span className="fw-bold small">@{reporter}</span>
                            </td>
                            <td>
                              {postTitle && (
                                <div>
                                  <span className="badge bg-primary me-1">Post</span>
                                  <span className="small">{postTitle}</span>
                                </div>
                              )}
                              {commentSnippet && (
                                <div>
                                  <span className="badge bg-warning text-dark me-1">Comentario</span>
                                  <span className="small text-truncate d-inline-block" style={{ maxWidth: '200px' }}>
                                    {commentSnippet}
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="small text-danger fw-bold">{report.reason}</td>
                            <td>
                              <span className={`badge ${statusBadgeColor}`} style={{ fontSize: '10px' }}>
                                {report.status}
                              </span>
                            </td>
                            <td className="text-end">
                              <div className="btn-group btn-group-sm">
                                {report.status === 'PENDING' && (
                                  <>
                                    <button
                                      type="button"
                                      className="btn btn-outline-success"
                                      onClick={() => handleUpdateReportStatus(report.id, 'REVIEWED')}
                                      title="Marcar como Revisado"
                                    >
                                      ✓ Revisar
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-outline-secondary"
                                      onClick={() => handleUpdateReportStatus(report.id, 'DISMISSED')}
                                      title="Desestimar denuncia"
                                    >
                                      ✕ Desestimar
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-danger"
                                      onClick={() => handleDeleteReportedItem(report)}
                                      title="Eliminar contenido denunciado"
                                    >
                                      🗑️ Borrar Contenido
                                    </button>
                                  </>
                                )}
                                {report.status !== 'PENDING' && (
                                  <span className="text-muted small">Sin acciones pendientes</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: USUARIOS */}
          {activeTab === 'users' && user?.role === 'ADMIN' && (
            <div
              className="p-4"
              style={{
                backgroundColor: '#ffffff',
                border: '3px solid var(--border-dark)',
                borderRadius: '16px',
                boxShadow: '5px 5px 0px var(--border-dark)',
              }}
            >
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h3
                  className="mb-0"
                  style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '16px',
                    color: 'var(--text-dark)',
                  }}
                >
                  👥 Usuarios Registrados en el Foro
                </h3>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-dark"
                  onClick={loadUsers}
                  disabled={loadingUsers}
                >
                  🔄 Recargar
                </button>
              </div>

              {loadingUsers && (
                <div className="text-center py-4">
                  <div className="spinner-border spinner-border-sm text-success" role="status"></div>
                </div>
              )}

              {!loadingUsers && usersList.length > 0 && (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr style={{ fontFamily: 'var(--font-pixel)', fontSize: '11px' }}>
                        <th>ID</th>
                        <th>Usuario</th>
                        <th>Email</th>
                        <th>Rol</th>
                        <th>Activo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersList.map((u) => (
                        <tr key={u.id}>
                          <td>#{u.id}</td>
                          <td className="fw-bold">🎮 {u.username}</td>
                          <td className="text-muted small">{u.email}</td>
                          <td>
                            <span
                              className="badge"
                              style={{
                                backgroundColor:
                                  u.role === 'ADMIN'
                                    ? '#fef08a'
                                    : u.role === 'MODERATOR'
                                    ? '#e9d5ff'
                                    : '#bbf7d0',
                                color:
                                  u.role === 'ADMIN'
                                    ? '#854d0e'
                                    : u.role === 'MODERATOR'
                                    ? '#6b21a8'
                                    : '#166534',
                                border: '1px solid var(--border-dark)',
                                fontFamily: 'var(--font-pixel)',
                                fontSize: '10px',
                              }}
                            >
                              {u.role === 'ADMIN' ? '👑 ADMIN' : u.role === 'MODERATOR' ? '🛡️ MOD' : '🎮 USER'}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${u.is_active ? 'bg-success' : 'bg-danger'}`}>
                              {u.is_active ? 'Activo' : 'Inactivo'}
                            </span>
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
      </main>

      <Footer />
    </div>
  );
}

export default AdminDashboard;
