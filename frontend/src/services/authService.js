// TODO(conectar-backend): este módulo es un mock con datos en localStorage.
// Cuando se conecte la API real, reemplazar el cuerpo de estas funciones por
// llamadas a `/api/auth/login/`, `/api/auth/register/`, etc. La interfaz
// (login, register, logout, getSession) ya es async-friendly a propósito:
// el resto de la app solo consume este archivo y no debería notar el cambio.

const USERS_KEY = 'registeredUsers';
export const SESSION_KEY = 'user';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

const INITIAL_USERS = [
  { id: 1, username: 'admin', email: 'admin@test.com', password: 'admin123' },
  { id: 2, username: 'user', email: 'user@test.com', password: 'user123' },
];

// Hash mock y determinista (djb2). NO es seguridad real: solo evita guardar
// contraseñas en texto plano dentro del localStorage. El hasheo verdadero
// (bcrypt/Argon2) debe hacerse en el backend.
function hashPassword(password) {
  let hash = 5381;
  for (let i = 0; i < password.length; i += 1) {
    hash = ((hash << 5) + hash + password.charCodeAt(i)) | 0;
  }
  return String(hash >>> 0);
}

// Lee y parsea una clave de localStorage. Si el JSON está corrupto (edición
// manual, cambio de esquema, otra app en el mismo origen) no rompe el render:
// descarta la clave corrupta y cae a un valor por defecto.
function readJSON(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

function getRegisteredUsers() {
  const stored = readJSON(USERS_KEY);
  return Array.isArray(stored) ? stored : [];
}

function getAllUsers() {
  // Los usuarios demo viven solo en memoria; los registrados se persisten
  // únicamente con el hash de la contraseña, nunca con el texto plano.
  const initial = INITIAL_USERS.map(({ id, username, email, password }) => ({
    id,
    username,
    email,
    passwordHash: hashPassword(password),
  }));
  return [...initial, ...getRegisteredUsers()];
}

// Devuelve al usuario sin datos sensibles para guardar en sesión.
function toSessionUser({ id, username, email }) {
  return { id, username, email };
}

export function getSession() {
  return readJSON(SESSION_KEY);
}

export function login(usernameInput, passwordInput) {
  // Normalización case-insensitive para que 'Admin' y 'admin' sean el mismo
  // usuario, igual que hará el backend real.
  const username = String(usernameInput ?? '')
    .trim()
    .toLowerCase();
  const password = String(passwordInput ?? '');

  const found = getAllUsers().find(
    (u) => u.username === username && u.passwordHash === hashPassword(password)
  );
  if (!found) {
    // Mensaje genérico a propósito: no revela si falló el usuario o la contraseña.
    return { success: false, error: 'Credenciales incorrectas' };
  }

  const sessionUser = toSessionUser(found);
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
  return { success: true, user: sessionUser };
}

export function register(usernameInput, emailInput, passwordInput) {
  const username = String(usernameInput ?? '')
    .trim()
    .toLowerCase();
  const email = String(emailInput ?? '')
    .trim()
    .toLowerCase();
  const password = String(passwordInput ?? '');

  if (!username || !email || !password) {
    return { success: false, error: 'Todos los campos son obligatorios' };
  }
  if (!EMAIL_REGEX.test(email)) {
    return { success: false, error: 'El email no tiene un formato válido' };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      success: false,
      error: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`,
    };
  }

  const users = getAllUsers();
  if (users.some((u) => u.username.toLowerCase() === username)) {
    return { success: false, error: 'El usuario ya existe' };
  }
  if (users.some((u) => u.email.toLowerCase() === email)) {
    return { success: false, error: 'El email ya está registrado' };
  }

  const newUser = {
    id: crypto.randomUUID(),
    username,
    email,
    passwordHash: hashPassword(password),
  };
  localStorage.setItem(
    USERS_KEY,
    JSON.stringify([...getRegisteredUsers(), newUser])
  );

  return { success: true, user: toSessionUser(newUser) };
}

// Usa removeItem (no serializa null como string "null") para que quede claro
// que no hay sesión activa.
export function logout() {
  localStorage.removeItem(SESSION_KEY);
}
