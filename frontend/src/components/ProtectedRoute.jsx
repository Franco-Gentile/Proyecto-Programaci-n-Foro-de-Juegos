import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAuthToken } from '../services/authService';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const token = getAuthToken();

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
