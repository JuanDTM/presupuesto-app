import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { adminRepository } from '../repository/adminRepository';
import styles from './ClientesAdmin.module.css';

const initialEditData = {
  id: null,
  nombre: '',
  telefono_contacto: '',
  documento_identidad: '',
  id_departamento: '',
  estado: true,
  cantidad_proyectos: '',
};

function parseClientesResponse(payload) {
  const pagination = payload?.data || {};
  return {
    rows: Array.isArray(pagination?.data) ? pagination.data : [],
    currentPage: Number(pagination?.current_page || 1),
    lastPage: Number(pagination?.last_page || 1),
    total: Number(pagination?.total || 0),
    perPage: Number(pagination?.per_page || 10),
  };
}

function formatEstado(value) {
  return Number(value) === 1 ? 'Activo' : 'Inactivo';
}

export default function ClientesAdmin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clientes, setClientes] = useState([]);
  const [busquedaInput, setBusquedaInput] = useState('');
  const [busquedaActiva, setBusquedaActiva] = useState('');
  const [porPagina, setPorPagina] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState(initialEditData);

  const canPrev = currentPage > 1;
  const canNext = currentPage < lastPage;

  const pages = useMemo(() => {
    const out = [];
    for (let page = 1; page <= lastPage; page += 1) out.push(page);
    return out;
  }, [lastPage]);

  const cargarClientes = async ({ page = currentPage, busqueda = busquedaActiva, limit = porPagina } = {}) => {
    setLoading(true);
    setError('');
    try {
      const response = await adminRepository.listarClientes({ page, busqueda, porPagina: limit });
      const parsed = parseClientesResponse(response);
      setClientes(parsed.rows);
      setCurrentPage(parsed.currentPage);
      setLastPage(parsed.lastPage);
      setTotal(parsed.total);
      setPorPagina(parsed.perPage);
    } catch (e) {
      setError(e?.message || 'No se pudo cargar la lista de clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarClientes({ page: 1, busqueda: '', limit: 10 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onBuscar = async (event) => {
    event.preventDefault();
    const trimmed = busquedaInput.trim();
    setBusquedaActiva(trimmed);
    await cargarClientes({ page: 1, busqueda: trimmed, limit: porPagina });
  };

  const onCambiarPorPagina = async (event) => {
    const nuevo = Number(event.target.value || 10);
    setPorPagina(nuevo);
    await cargarClientes({ page: 1, busqueda: busquedaActiva, limit: nuevo });
  };

  const iniciarEdicion = (cliente) => {
    setEditData({
      id: cliente.id,
      nombre: cliente.nombre || '',
      telefono_contacto: cliente.telefono_contacto || '',
      documento_identidad: cliente.documento_identidad || '',
      id_departamento: cliente.id_departamento ?? '',
      estado: Number(cliente.estado) === 1,
      cantidad_proyectos: cliente.cantidad_proyectos ?? '',
    });
  };

  const cancelarEdicion = () => setEditData(initialEditData);

  const onChangeEdit = (event) => {
    const { name, value } = event.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const guardarEdicion = async (event) => {
    event.preventDefault();
    if (!editData.id) return;

    setSaving(true);
    try {
      const payload = {
        nombre: editData.nombre.trim(),
        telefono_contacto: editData.telefono_contacto.trim(),
        documento_identidad: editData.documento_identidad.trim(),
        id_departamento: editData.id_departamento === '' ? null : Number(editData.id_departamento),
        estado: Number(editData.estado) === 1 || editData.estado === true,
        cantidad_proyectos:
          editData.cantidad_proyectos === '' || editData.cantidad_proyectos === null
            ? null
            : Number(editData.cantidad_proyectos),
      };

      await adminRepository.actualizarCliente(editData.id, payload);
      toast.success('Cliente actualizado');
      cancelarEdicion();
      await cargarClientes();
    } catch (e) {
      toast.error(e?.message || 'No se pudo actualizar el cliente');
    } finally {
      setSaving(false);
    }
  };

  const toggleEstado = async (cliente) => {
    const nuevoEstado = Number(cliente.estado) !== 1;
    try {
      await adminRepository.cambiarEstadoCliente(cliente.id, nuevoEstado);
      toast.success('Estado actualizado');
      await cargarClientes();
    } catch (e) {
      toast.error(e?.message || 'No se pudo cambiar el estado');
    }
  };

  const eliminarCliente = async (cliente) => {
    const confirmado = window.confirm(`Seguro que deseas eliminar a ${cliente.nombre}?`);
    if (!confirmado) return;

    try {
      await adminRepository.eliminarCliente(cliente.id);
      toast.success('Cliente eliminado');

      const isPageEmpty = clientes.length === 1 && currentPage > 1;
      const nextPage = isPageEmpty ? currentPage - 1 : currentPage;
      await cargarClientes({ page: nextPage });
    } catch (e) {
      toast.error(e?.message || 'No se pudo eliminar el cliente');
    }
  };

  return (
    <div className={styles.wrapper}>
      <form className={styles.filters} onSubmit={onBuscar}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Buscar por nombre, telefono o documento"
          value={busquedaInput}
          onChange={(e) => setBusquedaInput(e.target.value)}
        />
        <button type="submit" className={styles.primaryButton} disabled={loading}>
          Buscar
        </button>
        <label className={styles.pageSizeLabel}>
          Por pagina
          <select value={porPagina} onChange={onCambiarPorPagina} className={styles.select}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
          </select>
        </label>
      </form>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Telefono</th>
              <th>Documento</th>
              <th>Departamento</th>
              <th>Estado</th>
              <th>Proyectos</th>
              <th>Email</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {!loading && clientes.length === 0 && (
              <tr>
                <td colSpan={8} className={styles.empty}>
                  No hay clientes para mostrar
                </td>
              </tr>
            )}

            {clientes.map((cliente) => (
              <tr key={cliente.id}>
                <td>{cliente.nombre}</td>
                <td>{cliente.telefono_contacto || '-'}</td>
                <td>{cliente.documento_identidad || '-'}</td>
                <td>{cliente.id_departamento ?? '-'}</td>
                <td>{formatEstado(cliente.estado)}</td>
                <td>{cliente.cantidad_proyectos ?? '-'}</td>
                <td>{cliente?.usuario?.email || '-'}</td>
                <td>
                  <div className={styles.actions}>
                    <button type="button" className={styles.secondaryButton} onClick={() => iniciarEdicion(cliente)}>
                      Editar
                    </button>
                    <button type="button" className={styles.secondaryButton} onClick={() => toggleEstado(cliente)}>
                      Estado
                    </button>
                    <button type="button" className={styles.dangerButton} onClick={() => eliminarCliente(cliente)}>
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <span className={styles.total}>Total: {total}</span>
        <button
          type="button"
          className={styles.secondaryButton}
          disabled={!canPrev || loading}
          onClick={() => cargarClientes({ page: currentPage - 1 })}
        >
          Anterior
        </button>

        <div className={styles.pages}>
          {pages.map((page) => (
            <button
              type="button"
              key={page}
              className={`${styles.pageButton} ${page === currentPage ? styles.pageButtonActive : ''}`}
              onClick={() => cargarClientes({ page })}
              disabled={loading}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          type="button"
          className={styles.secondaryButton}
          disabled={!canNext || loading}
          onClick={() => cargarClientes({ page: currentPage + 1 })}
        >
          Siguiente
        </button>
      </div>

      {editData.id && (
        <form className={styles.editCard} onSubmit={guardarEdicion}>
          <h4 className={styles.editTitle}>Editar cliente #{editData.id}</h4>

          <div className={styles.formGrid}>
            <label>
              Nombre
              <input name="nombre" value={editData.nombre} onChange={onChangeEdit} required />
            </label>

            <label>
              Telefono
              <input name="telefono_contacto" value={editData.telefono_contacto} onChange={onChangeEdit} required />
            </label>

            <label>
              Documento
              <input
                name="documento_identidad"
                value={editData.documento_identidad}
                onChange={onChangeEdit}
                required
              />
            </label>

            <label>
              Id departamento
              <input name="id_departamento" value={editData.id_departamento} onChange={onChangeEdit} type="number" />
            </label>

            <label>
              Estado
              <select
                name="estado"
                value={Number(editData.estado) === 1 || editData.estado === true ? 1 : 0}
                onChange={onChangeEdit}
              >
                <option value={1}>Activo</option>
                <option value={0}>Inactivo</option>
              </select>
            </label>

            <label>
              Cantidad proyectos
              <input
                name="cantidad_proyectos"
                value={editData.cantidad_proyectos}
                onChange={onChangeEdit}
                type="number"
                min={0}
              />
            </label>
          </div>

          <div className={styles.editActions}>
            <button type="submit" className={styles.primaryButton} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <button type="button" className={styles.secondaryButton} onClick={cancelarEdicion}>
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
