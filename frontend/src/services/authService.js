// Utilizamos ruta relativa para pasar a través del proxy de Vite (M5)
export const API_URL = import.meta.env.VITE_API_URL || '/api';

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

// Wrapper para requests autenticados con refresh automático (U2)
export async function fetchWithAuth(url, options = {}) {
  let token = getAuthToken();
  
  if (!options.headers) options.headers = {};
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(url, options);

  if (response.status === 401 && token) {
    const refresh = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (refresh) {
      try {
        const refreshRes = await fetch(`${API_URL}/auth/refresh/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh })
        });

        if (refreshRes.ok) {
          const data = await refreshRes.json();
          localStorage.setItem(TOKEN_KEY, data.access);
          // Actualizar token y reintentar
          options.headers['Authorization'] = `Bearer ${data.access}`;
          response = await fetch(url, options);
        } else {
          // Refresh falló, la sesión realmente expiró
          throw new Error('Refresh token expired');
        }
      } catch (error) {
        // Falló el refresh, deslogueamos forzosamente
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        window.dispatchEvent(new Event('storage')); // Notificamos a AuthContext
        return response; // Devolvemos el 401 original
      }
    }
  }

  return response;
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
    
    // Obtenemos los detalles ANTES de persistir los tokens (M1)
    const userResponse = await fetch(`${API_URL}/users/me/`, {
      headers: {
        Authorization: `Bearer ${data.access}`,
      },
    });

    if (userResponse.ok) {
      const userData = await userResponse.json();
      const sessionUser = { id: userData.id, username: userData.username, email: userData.email };
      
      // Todo OK, persistimos sesión
      localStorage.setItem(TOKEN_KEY, data.access);
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh);
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
      // Intentamos blacklistear en el server (L2)
      const response = await fetch(`${API_URL}/auth/logout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ refresh }),
      });
      
      // Si dio 401 porque el access ya expiró, podríamos intentar un refresh primero, 
      // pero simplemente borramos localmente que es lo más importante en este caso.
      if (response.status === 401) {
          console.warn("Access token expirado durante el logout, borrando datos locales.");
      }
    }
  } catch (error) {
    console.error('Error durante el logout en el servidor', error);
  } finally {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}
