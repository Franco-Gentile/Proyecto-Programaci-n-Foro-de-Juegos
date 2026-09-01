import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  login as authServiceLogin,
  register as authServiceRegister,
  logout as authServiceLogout,
  getSession,
  SESSION_KEY,
} from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getSession());

  // Mantiene la sesión sincronizada entre pestañas: si otra pestaña hace
  // login/logout (o borra el storage), esta se actualiza en consecuencia.
  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === SESSION_KEY || event.key === null) {
        setUser(getSession());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const login = useCallback(async (username, password) => {
    const result = await authServiceLogin(username, password);
    if (result.success) {
      setUser(result.user);
    }
    return result;
  }, []);

  const register = useCallback(async (username, email, password) => {
    return await authServiceRegister(username, email, password);
  }, []);

  const logout = useCallback(async () => {
    await authServiceLogout();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, login, logout, register }), [user, login, logout, register]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
