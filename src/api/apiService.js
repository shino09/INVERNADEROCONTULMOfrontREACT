// Servicio de API que conecta con el backend .NET en el puerto 5090
const API = 'http://localhost:5090/api';

// Obtiene el token JWT del almacenamiento local
function getToken() {
  return localStorage.getItem('token');
}

// Construye los headers con el token de autorización
function authHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

// Maneja la respuesta HTTP y devuelve el JSON
async function handle(res) {
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || `Error HTTP ${res.status}`);
  }
  return res.json();
}

// Realiza una petición GET
export async function apiGet(url, params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API}${url}${qs ? '?' + qs : ''}`, { headers: authHeaders() });
  return handle(res);
}

// Realiza una petición POST con cuerpo JSON
export async function apiPost(url, body) {
  const res = await fetch(`${API}${url}`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) });
  return handle(res);
}

// Realiza una petición PUT con cuerpo JSON
export async function apiPut(url, body) {
  const res = await fetch(`${API}${url}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(body) });
  return handle(res);
}

// Realiza una petición DELETE
export async function apiDelete(url) {
  const res = await fetch(`${API}${url}`, { method: 'DELETE', headers: authHeaders() });
  return handle(res);
}

// Inicia sesión y devuelve el token JWT
export async function login(dto) {
  const res = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dto) });
  return handle(res);
}

// Descarga un PDF desde el backend y lo abre en una pestaña nueva
export async function apiGetPdf(url, params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API}${url}${qs ? '?' + qs : ''}`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Error al generar el PDF');
  const blob = await res.blob();
  window.open(window.URL.createObjectURL(blob));
}
