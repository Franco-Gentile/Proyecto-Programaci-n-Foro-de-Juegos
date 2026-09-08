import { useEffect, useState } from 'react';
import { getCategories } from '../services/forumService';

const ICONS = ['🎮', '⚔️', '👾', '🔫', '🕹️', '🛡️', '🏎️', '⛏️', '🥷', '🎲'];

function getCategoryIcon(name, index) {
  if (!name) return '🎮';
  const lower = name.toLowerCase();
  if (lower.includes('mine') || lower.includes('maikra') || lower.includes('craft')) return '⛏️';
  if (lower.includes('cs') || lower.includes('shoot') || lower.includes('war') || lower.includes('call')) return '🔫';
  if (lower.includes('rpg') || lower.includes('zelda') || lower.includes('sekiro') || lower.includes('soul')) return '🥷';
  if (lower.includes('fallout') || lower.includes('post')) return '👍';
  if (lower.includes('indie') || lower.includes('retro')) return '👾';
  if (lower.includes('carrera') || lower.includes('auto') || lower.includes('speed')) return '🏎️';
  return ICONS[index % ICONS.length];
}

function Sidebar({ selectedCategory = null, onSelectCategory }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchCats = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getCategories();
        if (isMounted) {
          setCategories(data);
        }
      } catch (err) {
        if (isMounted) {
          setError('No se pudieron cargar los juegos.');
          console.error(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCats();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCategoryClick = (catId) => {
    if (onSelectCategory) {
      // Si ya está seleccionada, deselecciona; de lo contrario, selecciona
      onSelectCategory(selectedCategory === catId ? null : catId);
    }
  };

  return (
    <aside className="sidebar-custom-card" aria-label="Sección Mis Juegos">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2 className="sidebar-custom-title mb-0">Comunidades</h2>
        {selectedCategory && (
          <button
            type="button"
            className="btn btn-sm btn-outline-dark"
            onClick={() => onSelectCategory && onSelectCategory(null)}
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '10px',
              padding: '2px 8px',
              border: '2px solid var(--border-dark)',
            }}
          >
            Ver todos
          </button>
        )}
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="spinner-border spinner-border-sm text-secondary" role="status">
            <span className="visually-hidden">Cargando comunidades...</span>
          </div>
          <p className="small text-muted mt-2 mb-0" style={{ fontFamily: 'var(--font-pixel)', fontSize: '11px' }}>
            Cargando juegos...
          </p>
        </div>
      )}

      {error && !loading && (
        <div className="alert alert-warning py-2 small text-center" role="alert" style={{ fontSize: '12px' }}>
          {error}
        </div>
      )}

      {!loading && !error && categories.length === 0 && (
        <div className="text-center py-3 text-muted small">
          No hay comunidades registradas aún.
        </div>
      )}

      {!loading && !error && categories.length > 0 && (
        <ul className="sidebar-games-list">
          {/* Opción Todos los juegos */}
          <li
            className={`sidebar-game-item ${selectedCategory === null ? 'sidebar-game-item-active' : ''}`}
            onClick={() => onSelectCategory && onSelectCategory(null)}
            style={{
              backgroundColor: selectedCategory === null ? '#fee2e2' : undefined,
              borderColor: selectedCategory === null ? '#ef4444' : undefined,
            }}
          >
            <span className="sidebar-game-label">
              <span style={{ color: '#1a1a1a', marginRight: '4px' }}>*</span>
              Todos los juegos
            </span>
            <span className="sidebar-game-icon-circle" role="img" aria-label="Todos">
              🌐
            </span>
          </li>

          {categories.map((categoria, idx) => {
            const isSelected = selectedCategory === categoria.id || selectedCategory === categoria.name;
            return (
              <li
                key={categoria.id}
                className={`sidebar-game-item ${isSelected ? 'sidebar-game-item-active' : ''}`}
                onClick={() => handleCategoryClick(categoria.id)}
                style={{
                  backgroundColor: isSelected ? '#fed7aa' : undefined,
                  borderColor: isSelected ? '#ea580c' : undefined,
                  transform: isSelected ? 'translate(-2px, -2px)' : undefined,
                  boxShadow: isSelected ? '4px 4px 0px var(--border-dark)' : undefined,
                }}
              >
                <span className="sidebar-game-label">
                  <span style={{ color: '#1a1a1a', marginRight: '4px' }}>*</span>
                  {categoria.name}
                </span>
                <span
                  className="sidebar-game-icon-circle"
                  role="img"
                  aria-label={categoria.name}
                >
                  {getCategoryIcon(categoria.name, idx)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}

export default Sidebar;
