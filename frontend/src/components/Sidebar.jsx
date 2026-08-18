const juegos = [
  { nombre: 'Mai kra', icono: 'knife' },
  { nombre: 'CSGO', icono: 'pistol' },
  { nombre: 'Fallout 4', icono: 'thumbsup' },
  { nombre: 'Sekiro', icono: 'shuriken' },
]

function Sidebar() {
  return (
    <div className="sidebar-custom">
      <h5 className="sidebar-title">Mis juegos</h5>
      <ul className="list-unstyled sidebar-list">
        {juegos.map((juego, index) => (
          <li key={index} className="sidebar-item">
            <span className="sidebar-item-icon">*</span>
            <span className="sidebar-item-name">{juego.nombre}</span>
            <span className="sidebar-item-emoji">
              {juego.icono === 'knife' && ''}
              {juego.icono === 'pistol' && ''}
              {juego.icono === 'thumbsup' && ''}
              {juego.icono === 'shuriken' && ''}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Sidebar
