import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * LIMITACIÓN CONOCIDA (mock del TP7): esta protección es solo visual y del
 * lado cliente. Confía en lo que haya en localStorage, así que cualquiera con
 * DevTools abierto puede falsificar una sesión, por ejemplo:
 *
 *   localStorage.setItem('user', JSON.stringify({ id: 99, username: 'intruso' }))
 *
 * Valida presencia de datos, no validez de sesión. Cuando se conecte el
 * backend real, la autorización debe vivir en el servidor: validar el JWT que
 * emite /api/auth/login/ en cada request protegido y nunca confiar en el
 * cliente para decidir el acceso.
 */
function ProtectedRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
