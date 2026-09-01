const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
export const SESSION_KEY = 'user';
export const TOKEN_KEY = 'access_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';

function readJSON(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

export function getSession() {
  return readJSON(SESSION_KEY);
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export async function login(username, password) {
  try {
    const response = await fetch(`${API_URL}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const data = await response.json();
      return { success: false, error: data.detail || 'Credenciales incorrectas' };
    }

    const data = await response.json();
    localStorage.setItem(TOKEN_KEY, data.access);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh);

    // Get user details
    const userResponse = await fetch(`${API_URL}/users/me/`, {
      headers: {
        Authorization: `Bearer ${data.access}`,
      },
    });

    if (userResponse.ok) {
      const userData = await userResponse.json();
      const sessionUser = { id: userData.id, username: userData.username, email: userData.email };
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
      return { success: true, user: sessionUser };
    } else {
      return { success: false, error: 'No se pudo obtener la información del usuario' };
    }
  } catch (error) {
    return { success: false, error: 'Error de conexión con el servidor' };
  }
}

export async function register(username, email, password) {
  try {
    const response = await fetch(`${API_URL}/users/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });

    if (!response.ok) {
      const data = await response.json();
      // Handle Django Rest Framework validation errors
      let errorMessage = 'Error al registrar el usuario';
      if (data.username) errorMessage = `Usuario: ${data.username[0]}`;
      else if (data.email) errorMessage = `Email: ${data.email[0]}`;
      else if (data.password) errorMessage = `Contraseña: ${data.password[0]}`;
      else if (typeof data === 'string') errorMessage = data;
      else if (data.detail) errorMessage = data.detail;
      
      return { success: false, error: errorMessage };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Error de conexión con el servidor' };
  }
}

export async function logout() {
  try {
    const refresh = localStorage.getItem(REFRESH_TOKEN_KEY);
    const token = localStorage.getItem(TOKEN_KEY);
    
    if (refresh && token) {
      await fetch(`${API_URL}/auth/logout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ refresh }),
      });
    }
  } catch (error) {
    console.error('Error durante el logout en el servidor', error);
  } finally {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}
