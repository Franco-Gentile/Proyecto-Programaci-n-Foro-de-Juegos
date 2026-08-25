const juegos = [
  { nombre: 'Maikra', icono: '⛏️' },
  { nombre: 'CSGO', icono: '🔫' },
  { nombre: 'Fallout 4', icono: '👍' },
  { nombre: 'Sekiro', icono: '🥷' },
];

function Sidebar() {
  return (
    <aside className="sidebar-custom-card" aria-label="Sección Mis Juegos">
      <h2 className="sidebar-custom-title">Mis juegos</h2>
      <ul className="sidebar-games-list">
        {juegos.map((juego) => (
          <li key={juego.nombre} className="sidebar-game-item">
            <span className="sidebar-game-label">
              <span style={{ color: '#1a1a1a', marginRight: '4px' }}>*</span>
              {juego.nombre}
            </span>
            <span
              className="sidebar-game-icon-circle"
              role="img"
              aria-label={juego.nombre}
            >
              {juego.icono}
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default Sidebar;
