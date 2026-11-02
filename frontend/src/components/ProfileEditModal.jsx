import { useState, useEffect } from 'react';
import {
  updateProfile,
  changePassword,
  getGames,
  searchRawg,
  importRawgGame,
} from '../services/forumService';

const AVATAR_PRESETS = ['👾', '🎮', '🕹️', '🧙‍♂️', '🤖', '🐱', '🐉', '⚔️', '🛡️', '🚀', '👑', '🍕'];

const BANNER_PRESETS = [
  { name: 'Cyberpunk Synth', color: '#1e1b4b', gradient: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)' },
  { name: 'Neon Arcade', color: '#831843', gradient: 'linear-gradient(135deg, #831843 0%, #db2777 100%)' },
  { name: 'Forest Quest', color: '#064e3b', gradient: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)' },
  { name: 'Golden Castle', color: '#78350f', gradient: 'linear-gradient(135deg, #78350f 0%, #d97706 100%)' },
  { name: 'Midnight Deep', color: '#0f172a', gradient: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)' },
  { name: 'Retro Sunset', color: '#7c2d12', gradient: 'linear-gradient(135deg, #7c2d12 0%, #ea580c 100%)' },
];

const PLATFORM_OPTIONS = [
  { id: 'PC', label: '💻 PC (Steam/Epic)', icon: '💻' },
  { id: 'PlayStation', label: '🎮 PlayStation', icon: '🎮' },
  { id: 'Xbox', label: '🟢 Xbox', icon: '🟢' },
  { id: 'Nintendo Switch', label: '🔴 Switch', icon: '🔴' },
  { id: 'Mobile', label: '📱 Mobile', icon: '📱' },
];

function ProfileEditModal({ isOpen, onClose, userProfile, onProfileUpdated }) {
  const [activeTab, setActiveTab] = useState('identity'); // 'identity' | 'security'

  // Datos de Identidad
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('👾');
  const [bannerColor, setBannerColor] = useState('#1e1b4b');
  const [bannerUrl, setBannerUrl] = useState('');
  const [platforms, setPlatforms] = useState([]);
  const [steamId, setSteamId] = useState('');
  const [discordTag, setDiscordTag] = useState('');
  const [favoriteGames, setFavoriteGames] = useState([]); // Array de objetos {id, name, image_url}

  // Búsqueda de juegos favoritos
  const [gameSearchQuery, setGameSearchQuery] = useState('');
  const [gameSearchResults, setGameSearchResults] = useState([]);
  const [rawgSearchResults, setRawgSearchResults] = useState([]);
  const [searchingGames, setSearchingGames] = useState(false);
  const [importingRawgSlug, setImportingRawgSlug] = useState(null);

  // Datos de Seguridad
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');

  // Estados de estado y feedback
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  // Inicializar estados con el perfil actual
  useEffect(() => {
    if (userProfile) {
      setBio(userProfile.bio || '');
      setAvatar(userProfile.avatar || '👾');
      setBannerColor(userProfile.banner_color || '#1e1b4b');
      setBannerUrl(userProfile.banner_url || '');
      setPlatforms(Array.isArray(userProfile.platforms) ? userProfile.platforms : []);
      setSteamId(userProfile.steam_id || '');
      setDiscordTag(userProfile.discord_tag || '');

      if (userProfile.favorite_games_details) {
        setFavoriteGames(userProfile.favorite_games_details);
      } else {
        setFavoriteGames([]);
      }
    }
  }, [userProfile, isOpen]);

  // Búsqueda de juegos para favoritos con debounce
  useEffect(() => {
    const trimmed = gameSearchQuery.trim();
    if (trimmed.length < 2) {
      setGameSearchResults([]);
      setRawgSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchingGames(true);
      try {
        const [local, rawg] = await Promise.all([
          getGames({ search: trimmed }).catch(() => []),
          searchRawg(trimmed).catch(() => []),
        ]);
        setGameSearchResults(local || []);

        const localSlugs = new Set((local || []).map((g) => g.slug?.toLowerCase()));
        const filteredRawg = (rawg || []).filter((rg) => rg && !localSlugs.has(rg.slug?.toLowerCase()));
        setRawgSearchResults(filteredRawg.slice(0, 4));
      } catch (err) {
        console.error('Error buscando juegos para favoritos:', err);
      } finally {
        setSearchingGames(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [gameSearchQuery]);

  if (!isOpen) return null;

  const handleTogglePlatform = (platformId) => {
    setPlatforms((prev) => {
      if (prev.includes(platformId)) {
        return prev.filter((p) => p !== platformId);
      } else {
        return [...prev, platformId];
      }
    });
  };

  const handleAddFavoriteGame = (game) => {
    if (favoriteGames.length >= 3) {
      setFeedback({ type: 'danger', text: 'Solo podés destacar hasta 3 juegos favoritos.' });
      return;
    }
    if (favoriteGames.some((g) => g.id === game.id)) {
      return;
    }
    setFavoriteGames((prev) => [...prev, game]);
    setGameSearchQuery('');
    setGameSearchResults([]);
    setRawgSearchResults([]);
  };

  const handleRemoveFavoriteGame = (gameId) => {
    setFavoriteGames((prev) => prev.filter((g) => g.id !== gameId));
  };

  const handleImportAndAddFavorite = async (rawgGame) => {
    try {
      setImportingRawgSlug(rawgGame.slug);
      const res = await importRawgGame(rawgGame.slug);
      if (res.game) {
        handleAddFavoriteGame(res.game);
      }
    } catch (err) {
      setFeedback({ type: 'danger', text: err.message || 'Error al importar juego de RAWG.' });
    } finally {
      setImportingRawgSlug(null);
    }
  };

  const handleSaveIdentity = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback({ type: '', text: '' });

    try {
      const payload = {
        bio: bio.trim(),
        avatar: avatar.trim(),
        banner_color: bannerColor,
        banner_url: bannerUrl.trim(),
        platforms: platforms,
        steam_id: steamId.trim(),
        discord_tag: discordTag.trim(),
        favorite_games: favoriteGames.map((g) => g.id),
      };

      const updated = await updateProfile(payload);
      setFeedback({ type: 'success', text: '¡Perfil actualizado con éxito!' });
      if (onProfileUpdated) {
        onProfileUpdated(updated);
      }
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setFeedback({ type: 'danger', text: err.message || 'Error al guardar el perfil.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSecurity = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', text: '' });

    if (!currentPassword) {
      setFeedback({ type: 'danger', text: 'Ingresá tu contraseña actual.' });
      return;
    }
    if (newPassword.length < 8) {
      setFeedback({ type: 'danger', text: 'La nueva contraseña debe tener al menos 8 caracteres.' });
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setFeedback({ type: 'danger', text: 'Las nuevas contraseñas no coinciden.' });
      return;
    }

    try {
      setLoading(true);
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setFeedback({ type: 'success', text: '¡Contraseña cambiada exitosamente!' });
      setCurrentPassword('');
      setNewPassword('');
      setNewPasswordConfirm('');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setFeedback({ type: 'danger', text: err.message || 'Error al cambiar la contraseña.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(3px)', zIndex: 1060 }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div
          className="modal-content"
          style={{
            border: '3px solid var(--border-dark)',
            borderRadius: '16px',
            boxShadow: '6px 6px 0px var(--border-dark)',
            overflow: 'hidden',
          }}
        >
          {/* Header del Modal */}
          <div
            className="modal-header px-4 py-3"
            style={{
              backgroundColor: '#f3f4f6',
              borderBottom: '2.5px solid var(--border-dark)',
            }}
          >
            <div className="d-flex align-items-center gap-2">
              <span style={{ fontSize: '20px' }}>⚙️</span>
              <h5
                className="modal-title mb-0"
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '15px',
                  color: 'var(--text-dark)',
                }}
              >
                Configurar Perfil Gamer
              </h5>
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Cerrar"
            ></button>
          </div>

          {/* Navegación por Pestañas */}
          <div className="px-4 pt-3 pb-2 border-bottom d-flex gap-2 bg-light">
            <button
              type="button"
              className={`btn btn-sm ${activeTab === 'identity' ? 'btn-dark' : 'btn-outline-dark'}`}
              onClick={() => {
                setActiveTab('identity');
                setFeedback({ type: '', text: '' });
              }}
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '11px',
                borderRadius: '8px',
                border: '2px solid var(--border-dark)',
              }}
            >
              🎮 Identidad Gamer
            </button>
            <button
              type="button"
              className={`btn btn-sm ${activeTab === 'security' ? 'btn-dark' : 'btn-outline-dark'}`}
              onClick={() => {
                setActiveTab('security');
                setFeedback({ type: '', text: '' });
              }}
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '11px',
                borderRadius: '8px',
                border: '2px solid var(--border-dark)',
              }}
            >
              🔒 Seguridad y Clave
            </button>
          </div>

          {/* Cuerpo del Modal */}
          <div className="modal-body p-4" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
            {feedback.text && (
              <div
                className={`alert alert-${feedback.type} py-2 mb-3 small`}
                style={{
                  border: '2px solid var(--border-dark)',
                  boxShadow: '2px 2px 0px var(--border-dark)',
                }}
              >
                {feedback.text}
              </div>
            )}

            {/* TAB IDENTIDAD GAMER */}
            {activeTab === 'identity' && (
              <form onSubmit={handleSaveIdentity}>
                {/* PREVIEW DEL BANNER + AVATAR */}
                <div className="mb-4">
                  <label className="form-label fw-bold small text-muted text-uppercase mb-2">
                    Vista previa de encabezado
                  </label>
                  <div
                    style={{
                      height: '110px',
                      borderRadius: '12px',
                      backgroundColor: bannerColor,
                      backgroundImage: bannerUrl ? `url(${bannerUrl})` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      border: '2.5px solid var(--border-dark)',
                      position: 'relative',
                      boxShadow: '3px 3px 0px var(--border-dark)',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '-24px',
                        left: '20px',
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        backgroundColor: '#ffffff',
                        border: '3px solid var(--border-dark)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '32px',
                        boxShadow: '2px 2px 0px var(--border-dark)',
                      }}
                    >
                      {avatar}
                    </div>
                  </div>
                </div>

                <div className="pt-3 mb-4">
                  {/* SELECCIÓN DE AVATAR */}
                  <label className="form-label fw-bold small">Elegí tu Avatar Retro</label>
                  <div className="d-flex flex-wrap gap-2 mb-2">
                    {AVATAR_PRESETS.map((item) => (
                      <button
                        key={item}
                        type="button"
                        className={`btn p-0 d-flex align-items-center justify-content-center ${
                          avatar === item ? 'border-primary' : ''
                        }`}
                        style={{
                          width: '42px',
                          height: '42px',
                          fontSize: '22px',
                          backgroundColor: avatar === item ? '#fed7aa' : '#ffffff',
                          border: avatar === item ? '2.5px solid #ea580c' : '2px solid var(--border-dark)',
                          borderRadius: '10px',
                          boxShadow: avatar === item ? '2px 2px 0px #ea580c' : '2px 2px 0px var(--border-dark)',
                        }}
                        onClick={() => setAvatar(item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                {/* BANNER: COLOR O IMAGEN */}
                <div className="mb-4">
                  <label className="form-label fw-bold small">Color o Estilo del Banner</label>
                  <div className="d-flex flex-wrap gap-2 mb-2">
                    {BANNER_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        className="btn p-2 px-3 text-white small"
                        style={{
                          background: preset.gradient,
                          border: bannerColor === preset.color ? '2.5px solid #000' : '2px solid var(--border-dark)',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: 600,
                          transform: bannerColor === preset.color ? 'scale(1.03)' : 'none',
                          boxShadow: bannerColor === preset.color ? '3px 3px 0px #000' : '2px 2px 0px var(--border-dark)',
                        }}
                        onClick={() => {
                          setBannerColor(preset.color);
                        }}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>

                  <div className="row g-2 align-items-center mt-1">
                    <div className="col-12 col-md-5">
                      <div className="input-group input-group-sm">
                        <span className="input-group-text fw-bold">Color HEX</span>
                        <input
                          type="color"
                          className="form-control form-control-color"
                          value={bannerColor}
                          onChange={(e) => setBannerColor(e.target.value)}
                          title="Elegir color personalizado"
                        />
                      </div>
                    </div>
                    <div className="col-12 col-md-7">
                      <input
                        type="url"
                        className="form-control form-control-sm"
                        placeholder="O URL de imagen de fondo (opcional)"
                        value={bannerUrl}
                        onChange={(e) => setBannerUrl(e.target.value)}
                        style={{ border: '1.5px solid var(--border-dark)', borderRadius: '6px' }}
                      />
                    </div>
                  </div>
                </div>

                {/* BIO */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between">
                    <label className="form-label fw-bold small">Bio / Acerca de mí</label>
                    <span className="small text-muted">{bio.length}/200</span>
                  </div>
                  <textarea
                    className="form-control"
                    rows="3"
                    maxLength={200}
                    placeholder="Contale a la comunidad tus gustos gamer, juegos favoritos o de qué disfrutás hablar..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    style={{
                      border: '2px solid var(--border-dark)',
                      borderRadius: '8px',
                      fontSize: '13px',
                    }}
                  ></textarea>
                </div>

                {/* PLATAFORMAS */}
                <div className="mb-4">
                  <label className="form-label fw-bold small">Tus Plataformas de Juego</label>
                  <div className="d-flex flex-wrap gap-2">
                    {PLATFORM_OPTIONS.map((plat) => {
                      const isSelected = platforms.includes(plat.id);
                      return (
                        <button
                          key={plat.id}
                          type="button"
                          className={`btn btn-sm ${isSelected ? 'btn-dark' : 'btn-outline-dark'}`}
                          style={{
                            borderRadius: '20px',
                            border: '2px solid var(--border-dark)',
                            fontSize: '12px',
                            boxShadow: isSelected ? '2px 2px 0px var(--border-dark)' : 'none',
                          }}
                          onClick={() => handleTogglePlatform(plat.id)}
                        >
                          {plat.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* GAMER HANDLES */}
                <div className="mb-4">
                  <label className="form-label fw-bold small">Perfiles Gamer</label>
                  <div className="row g-2">
                    <div className="col-12 col-md-6">
                      <div className="input-group input-group-sm">
                        <span className="input-group-text fw-bold">🎮 Steam ID</span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Tu ID o usuario de Steam"
                          value={steamId}
                          onChange={(e) => setSteamId(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="col-12 col-md-6">
                      <div className="input-group input-group-sm">
                        <span className="input-group-text fw-bold">💬 Discord</span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="ej: gamer#1234"
                          value={discordTag}
                          onChange={(e) => setDiscordTag(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* TOP 3 JUEGOS FAVORITOS */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label fw-bold small mb-0">
                      🏆 Top 3 Juegos Favoritos en tu Perfil
                    </label>
                    <span className="small text-muted">{favoriteGames.length}/3 seleccionados</span>
                  </div>
                  <p className="small text-muted mb-2">
                    Aparecerán destacados con sus portadas en tu ficha de usuario.
                  </p>

                  {/* Chips de juegos favoritos elegidos */}
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    {favoriteGames.map((game, index) => (
                      <div
                        key={game.id}
                        className="d-flex align-items-center gap-2 p-1 px-3"
                        style={{
                          backgroundColor: '#fef3c7',
                          border: '2px solid #d97706',
                          borderRadius: '12px',
                          boxShadow: '2px 2px 0px rgba(0,0,0,0.1)',
                        }}
                      >
                        <span className="fw-bold" style={{ fontSize: '11px', color: '#b45309' }}>
                          #{index + 1}
                        </span>
                        {game.image_url ? (
                          <img
                            src={game.image_url}
                            alt={game.name}
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '6px',
                              objectFit: 'cover',
                            }}
                          />
                        ) : (
                          <span>🕹️</span>
                        )}
                        <span className="fw-bold small text-dark">{game.name}</span>
                        <button
                          type="button"
                          className="btn btn-sm btn-link text-danger p-0 ms-1 fw-bold"
                          style={{ textDecoration: 'none' }}
                          onClick={() => handleRemoveFavoriteGame(game.id)}
                          title="Quitar de favoritos"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {favoriteGames.length === 0 && (
                      <span className="small text-muted fst-italic">
                        No seleccionaste ningún juego favorito aún.
                      </span>
                    )}
                  </div>

                  {/* Buscador de juegos para agregar */}
                  {favoriteGames.length < 3 && (
                    <div className="position-relative">
                      <input
                        type="search"
                        className="form-control form-control-sm"
                        placeholder="Buscar juego en el foro o RAWG para destacar..."
                        value={gameSearchQuery}
                        onChange={(e) => setGameSearchQuery(e.target.value)}
                        style={{ border: '2px solid var(--border-dark)', borderRadius: '8px' }}
                      />

                      {searchingGames && (
                        <div className="position-absolute end-0 top-50 translate-middle-y me-2">
                          <span className="spinner-border spinner-border-sm text-secondary"></span>
                        </div>
                      )}

                      {/* Dropdown de resultados de búsqueda */}
                      {(gameSearchResults.length > 0 || rawgSearchResults.length > 0) && (
                        <div
                          className="search-suggestions-dropdown w-100"
                          style={{ maxHeight: '240px', overflowY: 'auto' }}
                        >
                          {gameSearchResults.length > 0 && (
                            <div className="suggestion-section">
                              <div className="suggestion-section-title">
                                <span>🎮 Juegos del Foro</span>
                              </div>
                              {gameSearchResults.map((game) => (
                                <button
                                  key={`fav-local-${game.id}`}
                                  type="button"
                                  className="suggestion-item w-100 text-start d-flex justify-content-between align-items-center"
                                  onClick={() => handleAddFavoriteGame(game)}
                                >
                                  <div className="d-flex align-items-center gap-2 text-truncate">
                                    {game.image_url ? (
                                      <img
                                        src={game.image_url}
                                        alt={game.name}
                                        style={{ width: '22px', height: '22px', borderRadius: '4px', objectFit: 'cover' }}
                                      />
                                    ) : (
                                      <span>🕹️</span>
                                    )}
                                    <span className="small fw-bold text-dark text-truncate">{game.name}</span>
                                  </div>
                                  <span className="badge bg-primary text-white" style={{ fontSize: '9px' }}>
                                    + Añadir
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}

                          {rawgSearchResults.length > 0 && (
                            <div className="suggestion-section border-top pt-1">
                              <div className="suggestion-section-title" style={{ color: '#0369a1' }}>
                                <span>🌐 RAWG (Traer a Favoritos)</span>
                              </div>
                              {rawgSearchResults.map((rg) => (
                                <button
                                  key={`fav-rawg-${rg.slug}`}
                                  type="button"
                                  className="suggestion-item w-100 text-start d-flex justify-content-between align-items-center"
                                  onClick={() => handleImportAndAddFavorite(rg)}
                                  disabled={importingRawgSlug === rg.slug}
                                >
                                  <div className="d-flex align-items-center gap-2 text-truncate">
                                    {rg.image_url ? (
                                      <img
                                        src={rg.image_url}
                                        alt={rg.name}
                                        style={{ width: '22px', height: '22px', borderRadius: '4px', objectFit: 'cover' }}
                                      />
                                    ) : (
                                      <span>👾</span>
                                    )}
                                    <span className="small fw-bold text-dark text-truncate">{rg.name}</span>
                                  </div>
                                  {importingRawgSlug === rg.slug ? (
                                    <span className="spinner-border spinner-border-sm text-primary"></span>
                                  ) : (
                                    <span className="badge bg-info text-dark" style={{ fontSize: '9px' }}>
                                      + Importar y Añadir
                                    </span>
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="d-flex justify-content-end gap-2 pt-2 border-top">
                  <button
                    type="button"
                    className="btn btn-outline-dark btn-sm"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm d-flex align-items-center gap-2"
                    disabled={loading}
                    style={{
                      border: '2px solid var(--border-dark)',
                      boxShadow: '2px 2px 0px var(--border-dark)',
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '12px',
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm"></span>
                        Guardando...
                      </>
                    ) : (
                      '💾 Guardar Cambios'
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* TAB SEGURIDAD Y CLAVE */}
            {activeTab === 'security' && (
              <form onSubmit={handleSaveSecurity}>
                <div className="alert alert-info py-2 small mb-3">
                  🔐 Por tu seguridad, recordá utilizar una contraseña que contenga al menos 8 caracteres y no sea fácil de adivinar.
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold small">Contraseña Actual</label>
                  <input
                    type="password"
                    className="form-control"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    style={{ border: '2px solid var(--border-dark)', borderRadius: '8px' }}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold small">Nueva Contraseña</label>
                  <input
                    type="password"
                    className="form-control"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ border: '2px solid var(--border-dark)', borderRadius: '8px' }}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold small">Confirmar Nueva Contraseña</label>
                  <input
                    type="password"
                    className="form-control"
                    required
                    value={newPasswordConfirm}
                    onChange={(e) => setNewPasswordConfirm(e.target.value)}
                    style={{ border: '2px solid var(--border-dark)', borderRadius: '8px' }}
                  />
                </div>

                <div className="d-flex justify-content-end gap-2 pt-2 border-top">
                  <button
                    type="button"
                    className="btn btn-outline-dark btn-sm"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-danger btn-sm d-flex align-items-center gap-2"
                    disabled={loading}
                    style={{
                      border: '2px solid var(--border-dark)',
                      boxShadow: '2px 2px 0px var(--border-dark)',
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '12px',
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm"></span>
                        Cambiando...
                      </>
                    ) : (
                      '🔑 Actualizar Contraseña'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileEditModal;
