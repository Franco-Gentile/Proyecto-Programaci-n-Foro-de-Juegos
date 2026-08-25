import { createContext, useContext, useEffect, useState } from 'react';
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

  const login = (username, password) => {
    const result = authServiceLogin(username, password);
    if (result.success) {
      setUser(result.user);
    }
    return result;
  };

  const register = (username, email, password) => {
    return authServiceRegister(username, email, password);
  };

  const logout = () => {
    authServiceLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
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
