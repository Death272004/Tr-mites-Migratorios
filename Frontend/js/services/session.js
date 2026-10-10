/**
 * session.js — gestor de sesión en el cliente.
 * Sprint 1: token ficticio con expiración, guardado en sessionStorage.
 * Sprint 2 (HU-12): conectar con el backend real /api/auth/* sin cambiar la API.
 * Regla: nunca guardar secretos ni datos reales (Ley 81).
 */

const KEY = "tm.session.v1";
const EXPIRA_DEFAULT_SEG = 3600;

export function saveSession({ token, rol, usuario, expiraEn = EXPIRA_DEFAULT_SEG } = {}) {
  const session = {
    token,
    rol,
    usuario,
    expira: Date.now() + expiraEn * 1000,
  };
  try {
    sessionStorage.setItem(KEY, JSON.stringify(session));
  } catch {
    /* almacenamiento no disponible: sesión en memoria */
  }
  return session;
}

export function getSession() {
  let raw = null;
  try {
    raw = sessionStorage.getItem(KEY);
  } catch {
    raw = null;
  }
  if (!raw) return null;
  try {
    const session = JSON.parse(raw);
    if (!session.expira || session.expira < Date.now()) {
      clearSession();
      return null;
    }
    return session;
  } catch {
    clearSession();
    return null;
  }
}

export function clearSession() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
}

export function isAuthenticated() {
  return getSession() != null;
}

export function updateSessionRole(rol) {
  const session = getSession();
  if (!session) return null;
  return saveSession({ ...session, rol });
}