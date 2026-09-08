import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getCategories } from '../services/forumService';

const ICONS = ['🎮', '⚔️', '👾', '🔫', '🕹️', '🛡️', '🏎️', '⛏️', '🥷', '🎲', '🗡️', '🤖', '⚽', '🧟', '💥', '⚡', '🪲'];

function getCategoryIcon(name, index) {
  if (!name) return '🎮';
  const lower = name.toLowerCase();
  if (lower.includes('gta') || lower.includes('theft') || lower.includes('auto')) return '🚗';
  if (lower.includes('mine') || lower.includes('craft')) return '⛏️';
  if (lower.includes('cs') || lower.includes('counter') || lower.includes('strike')) return '🔫';
  if (lower.includes('shoot') || lower.includes('fps')) return '🎯';
  if (lower.includes('elden') || lower.includes('ring') || lower.includes('dark soul')) return '🗡️';
  if (lower.includes('zelda') || lower.includes('hyrule')) return '🛡️';
  if (lower.includes('valorant')) return '🎯';
  if (lower.includes('league') || lower.includes('lol')) return '⚔️';
  if (lower.includes('fortnite')) return '🪂';
  if (lower.includes('cyberpunk')) return '🤖';
  if (lower.includes('fc') || lower.includes('fifa') || lower.includes('deporte')) return '⚽';
  if (lower.includes('sekiro')) return '🥷';
  if (lower.includes('god of war') || lower.includes('kratos')) return '🪓';
  if (lower.includes('warzone') || lower.includes('duty')) return '💥';
  if (lower.includes('hollow') || lower.includes('knight') || lower.includes('silk')) return '🪲';
  if (lower.includes('pokémon') || lower.includes('pokemon')) return '⚡';
  if (lower.includes('rpg') || lower.includes('rol')) return '🐉';
  if (lower.includes('terror') || lower.includes('survival') || lower.includes('horror')) return '🧟';
  if (lower.includes('indie')) return '👾';
  if (lower.includes('estrategia') || lower.includes('táctica')) return '♟️';
  if (lower.includes('carrera') || lower.includes('speed')) return '🏎️';
  return ICONS[index % ICONS.length];
}

function Sidebar({ selectedCategory = null, onSelectCategory }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterText, setFilterText] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchCats = async () => {
      try {
        setLoading(true);
        setError('');
        // En el sidebar del foro principal mostramos exclusivamente los Géneros
        const data = await getCategories({ is_genre: true });
        if (isMounted) {
          setCategories(data);
        }
      } catch (err) {
        if (isMounted) {
          setError('No se pudieron cargar los géneros.');
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

  const filteredCategories = useMemo(() => {
    if (!filterText.trim()) return categories;
    const q = filterText.toLowerCase();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
    );
  }, [categories, filterText]);

  const handleCategoryClick = (catId) => {
    if (onSelectCategory) {
      onSelectCategory(selectedCategory === catId ? null : catId);
    }
  };

  return (
    <aside className="sidebar-custom-card" aria-label="Sección Comunidades de Juegos">
      {/* Cabecera Sidebar */}
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h2 className="sidebar-custom-title mb-0">
          Géneros <span className="small text-muted" style={{ fontSize: '12px' }}>({categories.length})</span>
        </h2>
        {selectedCategory && (
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={() => onSelectCategory && onSelectCategory(null)}
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '10px',
              padding: '2px 8px',
              border: '2px solid var(--border-dark)',
            }}
            title="Quitar filtro de género"
          >
            ✕ Ver todos
          </button>
        )}
      </div>

      {/* Input de filtro rápido interno */}
      {categories.length > 5 && (
        <div className="mb-3">
          <input
            type="search"
            className="form-control form-control-sm"
            placeholder="🔎 Filtrar géneros..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            style={{
              fontSize: '12px',
              borderRadius: '20px',
              border: '2px solid var(--border-dark)',
              padding: '4px 12px',
              boxShadow: '1.5px 1.5px 0px var(--border-dark)',
            }}
          />
        </div>
      )}

      {loading && (
        <div className="text-center py-4">
          <div className="spinner-border spinner-border-sm text-secondary" role="status">
            <span className="visually-hidden">Cargando géneros...</span>
          </div>
          <p className="small text-muted mt-2 mb-0" style={{ fontFamily: 'var(--font-pixel)', fontSize: '11px' }}>
            Cargando géneros...
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
          No hay géneros registrados aún.
        </div>
      )}

      {!loading && !error && categories.length > 0 && (
        <ul className="sidebar-games-list">
          {/* Opción Todos los géneros */}
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
              Todos los géneros
            </span>
            <span className="sidebar-game-icon-circle" role="img" aria-label="Todos">
              🌐
            </span>
          </li>

          {filteredCategories.map((categoria, idx) => {
            const isSelected = selectedCategory === categoria.id || selectedCategory === categoria.name;
            return (
              <li
                key={categoria.id}
                className={`sidebar-game-item ${isSelected ? 'sidebar-game-item-active' : ''}`}
                onClick={() => handleCategoryClick(categoria.id)}
                title={categoria.description || categoria.name}
                style={{
                  backgroundColor: isSelected ? '#fed7aa' : undefined,
                  borderColor: isSelected ? '#ea580c' : undefined,
                  transform: isSelected ? 'translate(-2px, -2px)' : undefined,
                  boxShadow: isSelected ? '4px 4px 0px var(--border-dark)' : undefined,
                }}
              >
                <span className="sidebar-game-label text-truncate" style={{ maxWidth: '180px' }}>
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

          {filteredCategories.length === 0 && filterText && (
            <li className="text-center py-3 text-muted small">
              No coincide ningún género con "{filterText}"
            </li>
          )}
        </ul>
      )}

      {/* Botón al Catálogo de Juegos */}
      <div className="pt-3 mt-2 border-top" style={{ borderColor: 'var(--border-dark)' }}>
        <Link
          to="/games"
          className="btn w-100 text-decoration-none d-flex align-items-center justify-content-between p-2"
          style={{
            backgroundColor: '#ffb703',
            color: '#1a1a1a',
            border: '2.5px solid var(--border-dark)',
            borderRadius: '16px',
            boxShadow: '2.5px 2.5px 0px var(--border-dark)',
            fontFamily: 'var(--font-pixel)',
            fontSize: '12px',
            fontWeight: 'bold',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translate(-2px, -2px)';
            e.currentTarget.style.boxShadow = '4px 4px 0px var(--border-dark)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '2.5px 2.5px 0px var(--border-dark)';
          }}
        >
          <span>🎮 Catálogo de Juegos</span>
          <span style={{ fontSize: '14px' }}>➔</span>
        </Link>
      </div>
    </aside>
  );
}

export default Sidebar;
