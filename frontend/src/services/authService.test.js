import { beforeEach, describe, expect, it } from 'vitest';
import {
  login,
  register,
  logout,
  getSession,
  SESSION_KEY,
} from './authService';

// Stub mínimo de localStorage para entorno node: authService solo usa
// getItem/setItem/removeItem.
class MemoryStorage {
  constructor() {
    this.store = new Map();
  }

  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }

  setItem(key, value) {
    this.store.set(key, String(value));
  }

  removeItem(key) {
    this.store.delete(key);
  }
}

beforeEach(() => {
  globalThis.localStorage = new MemoryStorage();
});

describe('login', () => {
  it('acepta credenciales del usuario demo y guarda la sesión sin datos sensibles', () => {
    const result = login('admin', 'admin123');

    expect(result.success).toBe(true);
    expect(result.user).toEqual({
      id: 1,
      username: 'admin',
      email: 'admin@test.com',
    });
    expect(getSession()).toEqual(result.user);

    const rawSession = localStorage.getItem(SESSION_KEY);
    expect(rawSession).not.toContain('passwordHash');
  });

  it('rechaza credenciales incorrectas con error genérico y no deja sesión', () => {
    const result = login('admin', 'wrong-password');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Credenciales incorrectas');
    expect(getSession()).toBeNull();
  });

  it('es case-insensitive en el usuario e ignora espacios', () => {
    const result = login('  ADMIN ', 'admin123');

    expect(result.success).toBe(true);
    expect(result.user.username).toBe('admin');
  });
});

describe('register', () => {
  it('registra un usuario nuevo con id único y puede loguearse después', () => {
    const result = register('nuevoUsuario', 'nuevo@test.com', 'secreta123');

    expect(result.success).toBe(true);
    expect(result.user.username).toBe('nuevousuario');
    expect(typeof result.user.id).toBe('string');
    expect(result.user.id).toMatch(/^[0-9a-f-]{36}$/);

    const relogin = login('NuevoUsuario', 'secreta123');
    expect(relogin.success).toBe(true);
  });

  it('normaliza username y email a minúsculas', () => {
    const result = register('  Pepe  ', 'PEPE@Test.COM ', 'secreta123');

    expect(result.success).toBe(true);
    expect(result.user).toEqual({
      id: result.user.id,
      username: 'pepe',
      email: 'pepe@test.com',
    });
  });

  it('NO persiste la contraseña en texto plano en localStorage', () => {
    register('juan', 'juan@test.com', 'secreta123');

    const rawUsers = localStorage.getItem('registeredUsers');
    expect(rawUsers).not.toContain('secreta123');
    expect(rawUsers).toContain('passwordHash');
  });

  it('rechuta usuarios duplicados sin importar mayúsculas', () => {
    register('juan', 'juan@test.com', 'secreta123');

    const duplicate = register('JUAN', 'otro@test.com', 'secreta456');
    expect(duplicate.success).toBe(false);
    expect(duplicate.error).toBe('El usuario ya existe');
  });

  it('rechaza emails duplicados sin importar mayúsculas', () => {
    register('juan', 'juan@test.com', 'secreta123');

    const duplicate = register('juan2', 'Juan@Test.com', 'secreta456');
    expect(duplicate.success).toBe(false);
    expect(duplicate.error).toBe('El email ya está registrado');
  });

  it('rechaza emails con formato inválido', () => {
    const result = register('juan', 'no-es-un-email', 'secreta123');

    expect(result.success).toBe(false);
    expect(result.error).toContain('email');
  });

  it('rechaza contraseñas cortas (mínimo 8 caracteres)', () => {
    const result = register('juan', 'juan@test.com', 'corta12');

    expect(result.success).toBe(false);
    expect(result.error).toContain('8 caracteres');
  });

  it('rechaza campos vacíos o solo espacios', () => {
    expect(register('   ', 'a@test.com', 'secreta123').success).toBe(false);
    expect(register('juan', '   ', 'secreta123').success).toBe(false);
    expect(register('juan', 'a@test.com', '').success).toBe(false);
  });

  it('sigue funcionando si registeredUsers tiene JSON corrupto', () => {
    localStorage.setItem('registeredUsers', '{json roto');

    const result = register('juan', 'juan@test.com', 'secreta123');
    expect(result.success).toBe(true);

    const relogin = login('juan', 'secreta123');
    expect(relogin.success).toBe(true);
  });
});

describe('logout / sesión', () => {
  it('elimina la clave de sesión (no deja el string "null")', () => {
    login('user', 'user123');
    expect(localStorage.getItem(SESSION_KEY)).not.toBeNull();

    logout();

    expect(getSession()).toBeNull();
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
  });

  it('devuelve null si la sesión guardada está corrupta, sin lanzar excepción', () => {
    localStorage.setItem(SESSION_KEY, '{corrupto');

    expect(() => getSession()).not.toThrow();
    expect(getSession()).toBeNull();
    // Además limpia la clave corrupta.
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
  });
});
