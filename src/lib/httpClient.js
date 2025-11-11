import apiUrls from '../config/api_urls';

const API_URL = apiUrls.baseURL;

function getTokenFromSessionStorage() {
  try {
    return sessionStorage.getItem('token');
  } catch {
    return null;
  }
}

export async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
  if (auth) {
    const token = getTokenFromSessionStorage();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401) {
    try { sessionStorage.removeItem('token'); } catch {}
    throw new Error('Error de autenticación');
  }

  const rawText = await response.text();
  const cleanedText = (rawText || '')
    .replace(/^\uFEFF/, '')
    .trim()
    .replace(/^[^\[{\"]+/, '');

  let data = {};
  try {
    data = cleanedText ? JSON.parse(cleanedText) : {};
  } catch {
    data = {};
  }

  if (!response.ok) {
    const message = data?.error || data?.message || (cleanedText || 'Error en la solicitud');
    throw new Error(message);
  }

  return data;
}

// Métodos de conveniencia
export const httpClient = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
};
