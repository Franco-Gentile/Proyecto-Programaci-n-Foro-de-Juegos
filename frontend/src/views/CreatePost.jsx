import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getCategories, createPost } from '../services/forumService';

function CreatePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchCats = async () => {
      try {
        setLoadingCats(true);
        const data = await getCategories();
        if (isMounted) {
          setCategories(data);
          if (data.length > 0) {
            setCategoryId(data[0].id);
          }
        }
      } catch (_err) {
        if (isMounted) {
          setError('No se pudieron cargar las categorías de juegos.');
        }
      } finally {
        if (isMounted) {
          setLoadingCats(false);
        }
      }
    };

    fetchCats();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !categoryId) {
      setError('Por favor completá todos los campos requeridos.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const newPost = await createPost({
        title: title.trim(),
        content: content.trim(),
        category_id: parseInt(categoryId, 10),
      });

      // Redirige al nuevo post creado
      navigate(`/posts/${newPost.id}`);
    } catch (err) {
      setError(err.message || 'Ocurrió un error al crear la publicación.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />

      <main className="flex-grow-1 forum-main-layout">
        <div className="container py-4" style={{ maxWidth: '720px' }}>
          <Link
            to="/"
            className="btn btn-outline-dark mb-4 d-inline-flex align-items-center gap-2"
            style={{
              border: '2px solid var(--border-dark)',
              boxShadow: '2px 2px 0px var(--border-dark)',
              fontFamily: 'var(--font-pixel)',
              fontSize: '12px',
              backgroundColor: '#ffffff',
            }}
          >
            ← Volver al Foro
          </Link>

          <div
            className="p-4 p-md-5"
            style={{
              backgroundColor: '#ffffff',
              border: '3px solid var(--border-dark)',
              borderRadius: '20px',
              boxShadow: '6px 6px 0px var(--border-dark)',
            }}
          >
            <div className="text-center mb-4">
              <div
                className="d-inline-block p-2 px-3 mb-2"
                style={{
                  backgroundColor: '#fee2e2',
                  border: '2px solid var(--border-dark)',
                  borderRadius: '10px',
                  boxShadow: '2px 2px 0px var(--border-dark)',
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '13px',
                }}
              >
                🎮 NUEVA PUBLICACIÓN
              </div>
              <h1
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '22px',
                  color: 'var(--text-dark)',
                }}
              >
                Crear Hilo de Debate
              </h1>
              <p className="text-muted small">
                Compartí noticias, dudas, opiniones o clips con la comunidad gamer.
              </p>
            </div>

            {error && (
              <div
                className="alert alert-danger"
                role="alert"
                style={{
                  border: '2px solid var(--border-dark)',
                  boxShadow: '2px 2px 0px var(--border-dark)',
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Categoría / Juego */}
              <div className="mb-3">
                <label className="form-label fw-bold small">
                  Comunidad / Juego <span className="text-danger">*</span>
                </label>
                {loadingCats ? (
                  <div className="spinner-border spinner-border-sm text-secondary" role="status"></div>
                ) : (
                  <select
                    className="form-select"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                    style={{
                      border: '2px solid var(--border-dark)',
                      borderRadius: '8px',
                      padding: '10px',
                    }}
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} {cat.description ? `- ${cat.description}` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Título */}
              <div className="mb-3">
                <label className="form-label fw-bold small">
                  Título del post <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej: ¿Qué les pareció el final de Sekiro?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={200}
                  required
                  style={{
                    border: '2px solid var(--border-dark)',
                    borderRadius: '8px',
                    padding: '10px',
                  }}
                />
                <div className="d-flex justify-content-end text-muted small mt-1">
                  {title.length}/200 caracteres
                </div>
              </div>

              {/* Contenido */}
              <div className="mb-4">
                <label className="form-label fw-bold small">
                  Contenido de la publicación <span className="text-danger">*</span>
                </label>
                <textarea
                  className="form-control"
                  rows="6"
                  placeholder="Escribí acá tu reseña, consulta, teoría o guía gamer..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  style={{
                    border: '2px solid var(--border-dark)',
                    borderRadius: '8px',
                    padding: '12px',
                  }}
                ></textarea>
              </div>

              {/* Botón Submit */}
              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => navigate('/')}
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-success d-flex align-items-center gap-2 px-4"
                  disabled={submitting || loadingCats || categories.length === 0}
                  style={{
                    border: '2.5px solid var(--border-dark)',
                    boxShadow: '3px 3px 0px var(--border-dark)',
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '13px',
                    backgroundColor: '#10b981',
                  }}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                      Publicando...
                    </>
                  ) : (
                    'Lanzar Post 🚀'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default CreatePost;
