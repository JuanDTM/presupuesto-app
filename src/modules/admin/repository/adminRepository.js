import apiUrls from '../../../config/api_urls';
import { request } from '../../../lib/httpClient';

function buildQuery(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (typeof value === 'string' && value.trim() === '') return;
    query.set(key, String(value));
  });

  const qs = query.toString();
  return qs ? `?${qs}` : '';
}

export const adminRepository = {
  listarClientes: ({ page = 1, busqueda = '', porPagina = 10 } = {}) =>
    request(
      `${apiUrls.admin.clientes}${buildQuery({ page, busqueda, por_pagina: porPagina })}`,
      { method: 'GET', auth: true }
    ),

  obtenerCliente: (id) => request(`${apiUrls.admin.clientes}/${id}`, { method: 'GET', auth: true }),

  crearCliente: (payload) => request(apiUrls.admin.clientes, { method: 'POST', body: payload, auth: true }),

  actualizarCliente: (id, payload) =>
    request(`${apiUrls.admin.clientes}/${id}`, { method: 'PUT', body: payload, auth: true }),

  eliminarCliente: (id) => request(`${apiUrls.admin.clientes}/${id}`, { method: 'DELETE', auth: true }),

  cambiarEstadoCliente: (id, estado) =>
    request(`${apiUrls.admin.clientes}/${id}/estado`, {
      method: 'PATCH',
      body: { estado: Boolean(estado) },
      auth: true,
    }),

  listarModelosManoObra: () => request(apiUrls.admin.modelosManoObra, { method: 'GET', auth: true }),

  obtenerDatosModeloManoObra: (params = {}) =>
    request(`${apiUrls.admin.datosModeloManoObra}${buildQuery(params)}`, { method: 'GET', auth: true }),

  modificarDatoModeloManoObra: (payload) =>
    request(apiUrls.admin.modificarModeloManoObra, { method: 'POST', body: payload, auth: true }),

  crearDatoModeloManoObra: (payload) =>
    request(apiUrls.admin.crearModeloManoObra, { method: 'POST', body: payload, auth: true }),

  listarModelosMaterial: () => request(apiUrls.admin.modelosMaterial, { method: 'GET', auth: true }),

  obtenerDatosModeloMaterial: (params = {}) =>
    request(`${apiUrls.admin.datosModeloMaterial}${buildQuery(params)}`, { method: 'GET', auth: true }),

  modificarDatoModeloMaterial: (payload) =>
    request(apiUrls.admin.modificarModeloMaterial, { method: 'POST', body: payload, auth: true }),

  crearDatoModeloMaterial: (payload) =>
    request(apiUrls.admin.crearModeloMaterial, { method: 'POST', body: payload, auth: true }),

  actualizarPorcentajeManoObraIncremento: (payload) =>
    request(apiUrls.admin.incrementarPorcentajeManoObra, { method: 'POST', body: payload, auth: true }),

  actualizarPorcentajeManoObraDecremento: (payload) =>
    request(apiUrls.admin.decrementarPorcentajeManoObra, { method: 'POST', body: payload, auth: true }),
};
