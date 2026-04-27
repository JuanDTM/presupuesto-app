import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { adminRepository } from '../repository/adminRepository';
import styles from './ManoObraAdmin.module.css';

const initialCreateData = {
  actividad: '',
  unidad: '',
  valor: '',
};

const initialEditData = {
  id: null,
  actividad: '',
  unidad: '',
  valor: '',
};

function parsePaginated(payload) {
  const pagination = payload?.data || {};
  return {
    rows: Array.isArray(pagination?.data) ? pagination.data : [],
    currentPage: Number(pagination?.current_page || 1),
    lastPage: Number(pagination?.last_page || 1),
    total: Number(pagination?.total || 0),
  };
}

function formatCurrency(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 2 }).format(amount);
}

export default function ManoObraAdmin() {
  const [loadingModelos, setLoadingModelos] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  const [modelos, setModelos] = useState([]);
  const [modeloActivo, setModeloActivo] = useState('');

  const [rows, setRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [error, setError] = useState('');
  const [editData, setEditData] = useState(initialEditData);
  const [createData, setCreateData] = useState(initialCreateData);

  const [porcentaje, setPorcentaje] = useState('');
  const [bulkResult, setBulkResult] = useState(null);

  const pageList = useMemo(() => {
    const pages = [];
    for (let i = 1; i <= lastPage; i += 1) pages.push(i);
    return pages;
  }, [lastPage]);

  const cargarModelos = async () => {
    setLoadingModelos(true);
    setError('');
    try {
      const response = await adminRepository.listarModelosManoObra();
      const lista = Array.isArray(response?.data) ? response.data : [];
      setModelos(lista);
      if (lista.length > 0) {
        setModeloActivo((prev) => prev || lista[0]);
      }
    } catch (e) {
      setError(e?.message || 'No se pudieron cargar los modelos de mano de obra');
    } finally {
      setLoadingModelos(false);
    }
  };

  const cargarDatosModelo = async ({ modelo = modeloActivo, page = currentPage } = {}) => {
    if (!modelo) return;

    setLoadingData(true);
    setError('');
    try {
      const response = await adminRepository.obtenerDatosModeloManoObra({ modelo, page });
      const parsed = parsePaginated(response);
      setRows(parsed.rows);
      setCurrentPage(parsed.currentPage);
      setLastPage(parsed.lastPage);
      setTotal(parsed.total);
    } catch (e) {
      setError(e?.message || 'No se pudieron cargar los datos del modelo seleccionado');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    cargarModelos();
  }, []);

  useEffect(() => {
    if (modeloActivo) {
      setEditData(initialEditData);
      cargarDatosModelo({ modelo: modeloActivo, page: 1 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modeloActivo]);

  const iniciarEdicion = (item) => {
    setEditData({
      id: item.id,
      actividad: item.actividad || '',
      unidad: item.unidad || '',
      valor: item.valor ?? '',
    });
  };

  const cancelarEdicion = () => setEditData(initialEditData);

  const guardarEdicion = async (event) => {
    event.preventDefault();
    if (!modeloActivo || !editData.id) return;

    const valorNumerico = Number(editData.valor);
    if (!Number.isFinite(valorNumerico)) {
      toast.error('Ingresa un valor numerico valido');
      return;
    }

    setSaving(true);
    try {
      await adminRepository.modificarDatoModeloManoObra({
        modelo: modeloActivo,
        id: editData.id,
        actividad: editData.actividad,
        unidad: editData.unidad,
        valor: valorNumerico,
      });
      toast.success('Registro actualizado');
      cancelarEdicion();
      await cargarDatosModelo();
    } catch (e) {
      toast.error(e?.message || 'No se pudo actualizar el registro');
    } finally {
      setSaving(false);
    }
  };

  const crearRegistro = async (event) => {
    event.preventDefault();
    if (!modeloActivo) {
      toast.error('Selecciona un modelo');
      return;
    }

    const valorNumerico = Number(createData.valor);
    if (!createData.actividad.trim() || !createData.unidad.trim() || !Number.isFinite(valorNumerico)) {
      toast.error('Completa actividad, unidad y valor valido');
      return;
    }

    setSaving(true);
    try {
      await adminRepository.crearDatoModeloManoObra({
        modelo: modeloActivo,
        actividad: createData.actividad.trim(),
        unidad: createData.unidad.trim(),
        valor: valorNumerico,
      });
      toast.success('Registro creado');
      setCreateData(initialCreateData);
      await cargarDatosModelo({ page: 1 });
    } catch (e) {
      toast.error(e?.message || 'No se pudo crear el registro');
    } finally {
      setSaving(false);
    }
  };

  const aplicarPorcentajeGlobal = async (tipo) => {
    const valor = Number(porcentaje);
    if (!Number.isFinite(valor) || valor <= 0) {
      toast.error('Ingresa un porcentaje decimal mayor a 0');
      return;
    }

    setBulkLoading(true);
    try {
      const payload = { porcentaje: valor };
      const response =
        tipo === 'incremento'
          ? await adminRepository.actualizarPorcentajeManoObraIncremento(payload)
          : await adminRepository.actualizarPorcentajeManoObraDecremento(payload);

      setBulkResult(response);
      toast.success(response?.message || 'Operacion aplicada');
      await cargarDatosModelo();
    } catch (e) {
      toast.error(e?.message || 'No se pudo aplicar el porcentaje global');
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <section className={styles.wrapper}>
      <div className={styles.topBar}>
        <label className={styles.modelLabel}>
          Modelo
          <select
            className={styles.select}
            value={modeloActivo}
            onChange={(e) => setModeloActivo(e.target.value)}
            disabled={loadingModelos}
          >
            {modelos.map((modelo) => (
              <option key={modelo} value={modelo}>
                {modelo}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className={styles.secondaryButton}
          onClick={() => cargarDatosModelo({ page: currentPage })}
          disabled={loadingData || !modeloActivo}
        >
          Recargar
        </button>
      </div>

      <form className={styles.bulkCard} onSubmit={(e) => e.preventDefault()}>
        <h4 className={styles.cardTitle}>Ajuste global de mano de obra</h4>
        <p className={styles.cardHint}>Ingresa un decimal (ej: 0.1718) para incrementar o decrementar todos los valores.</p>
        <div className={styles.bulkActions}>
          <input
            type="number"
            min="0"
            step="0.0001"
            value={porcentaje}
            onChange={(e) => setPorcentaje(e.target.value)}
            className={styles.input}
            placeholder="0.1718"
          />
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => aplicarPorcentajeGlobal('incremento')}
            disabled={bulkLoading}
          >
            Incrementar
          </button>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => aplicarPorcentajeGlobal('decremento')}
            disabled={bulkLoading}
          >
            Decrementar
          </button>
        </div>
        {bulkResult && (
          <div className={styles.bulkResult}>
            <p><strong>Resultado:</strong> {bulkResult?.message}</p>
            <p>
              Modelos procesados: {bulkResult?.modelos_procesados ?? '-'} | Registros actualizados:{' '}
              {bulkResult?.total_registros_actualizados ?? '-'}
            </p>
          </div>
        )}
      </form>

      <form className={styles.createCard} onSubmit={crearRegistro}>
        <h4 className={styles.cardTitle}>Crear nuevo dato</h4>
        <div className={styles.createGrid}>
          <input
            className={styles.input}
            placeholder="Actividad"
            value={createData.actividad}
            onChange={(e) => setCreateData((prev) => ({ ...prev, actividad: e.target.value }))}
          />
          <input
            className={styles.input}
            placeholder="Unidad"
            value={createData.unidad}
            onChange={(e) => setCreateData((prev) => ({ ...prev, unidad: e.target.value }))}
          />
          <input
            className={styles.input}
            type="number"
            min="0"
            step="0.01"
            placeholder="Valor"
            value={createData.valor}
            onChange={(e) => setCreateData((prev) => ({ ...prev, valor: e.target.value }))}
          />
          <button type="submit" className={styles.primaryButton} disabled={saving || !modeloActivo}>
            Crear
          </button>
        </div>
      </form>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Actividad</th>
              <th>Unidad</th>
              <th>Valor</th>
              <th>Accion</th>
            </tr>
          </thead>
          <tbody>
            {!loadingData && rows.length === 0 && (
              <tr>
                <td colSpan={5} className={styles.empty}>No hay registros para este modelo</td>
              </tr>
            )}
            {rows.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.actividad}</td>
                <td>{item.unidad}</td>
                <td>{formatCurrency(item.valor)}</td>
                <td>
                  <button type="button" className={styles.secondaryButton} onClick={() => iniciarEdicion(item)}>
                    Modificar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <span>Total: {total}</span>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={() => cargarDatosModelo({ page: currentPage - 1 })}
          disabled={currentPage <= 1 || loadingData}
        >
          Anterior
        </button>
        <div className={styles.pages}>
          {pageList.map((page) => (
            <button
              type="button"
              key={page}
              className={`${styles.pageButton} ${page === currentPage ? styles.pageButtonActive : ''}`}
              onClick={() => cargarDatosModelo({ page })}
              disabled={loadingData}
            >
              {page}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={() => cargarDatosModelo({ page: currentPage + 1 })}
          disabled={currentPage >= lastPage || loadingData}
        >
          Siguiente
        </button>
      </div>

      {editData.id && (
        <form className={styles.editCard} onSubmit={guardarEdicion}>
          <h4 className={styles.cardTitle}>Modificar registro #{editData.id}</h4>
          <div className={styles.editGrid}>
            <label>
              Actividad
              <input className={styles.input} value={editData.actividad} readOnly />
            </label>
            <label>
              Unidad
              <input className={styles.input} value={editData.unidad} readOnly />
            </label>
            <label>
              Valor
              <input
                className={styles.input}
                type="number"
                step="0.01"
                min="0"
                value={editData.valor}
                onChange={(e) => setEditData((prev) => ({ ...prev, valor: e.target.value }))}
                required
              />
            </label>
          </div>
          <div className={styles.editActions}>
            <button type="submit" className={styles.primaryButton} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
            <button type="button" className={styles.secondaryButton} onClick={cancelarEdicion}>
              Cancelar
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
