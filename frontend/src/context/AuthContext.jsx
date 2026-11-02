import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  login as authServiceLogin,
  register as authServiceRegister,
  logout as authServiceLogout,
  getSession,
  getAuthToken,
  SESSION_KEY,
  TOKEN_KEY,
} from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const session = getSession();
    const token = getAuthToken();
    if (session && !token) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  });

  // Mantiene la sesión sincronizada entre pestañas y ante expiración de token
  useEffect(() => {
    const handleStorage = (event) => {
      if (!event.key || event.key === SESSION_KEY || event.key === TOKEN_KEY) {
        const session = getSession();
        const token = getAuthToken();
        if (session && !token) {
          localStorage.removeItem(SESSION_KEY);
          setUser(null);
        } else {
          setUser(session);
        }
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

  const updateUser = useCallback((updatedData) => {
    setUser((prev) => {
      const merged = { ...(prev || {}), ...updatedData };
      localStorage.setItem(SESSION_KEY, JSON.stringify(merged));
      return merged;
    });
  }, []);

  const value = useMemo(
    () => ({ user, login, logout, register, updateUser }),
    [user, login, logout, register, updateUser]
  );

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
