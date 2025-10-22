import apiUrls from '../../../config/api_urls';
import { request } from '../../../lib/httpClient';

export const authRepository = {
  register: (payload) => request(apiUrls.auth.register, { method: 'POST', body: payload }),
  login: ({ email, password }) =>
    request(apiUrls.auth.login, { method: 'POST', body: { email: String(email || '').trim(), password } }),
  logout: () => request(apiUrls.auth.logout, { method: 'POST', auth: true }),
  preguntaSeguridad: (email) =>
    request(apiUrls.auth.preguntaSeguridad, { method: 'POST', body: { email: String(email || '').trim() } }),
  recuperarPassword: (payload) =>
    request(apiUrls.auth.recuperarPassword, { method: 'POST', body: { ...payload, email: String(payload?.email || '').trim() } }),
};


