import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { adminRepository } from '../repository/adminRepository';
import styles from './MaterialesAdmin.module.css';

const HIDDEN_COLUMNS = new Set(['created_at', 'updated_at']);
const DEFAULT_REQUIRED_FIELDS = ['nombre'];
const CREATE_RULES_BY_MODEL = {
  Rio: {
    requiredAll: ['nombre'],
    requiredAny: [['valor_metro', 'valor_palada', 'valor_viaje']],
  },
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

function isNumericLike(value) {
  if (typeof value === 'number') return true;
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (trimmed === '') return false;
  return /^-?\d+(\.\d+)?$/.test(trimmed);
}

function normalizeForPayload(rawValue, originalValue) {
  if (rawValue === '') return null;
  if (rawValue === null) return null;

  if (isNumericLike(originalValue) || isNumericLike(rawValue)) {
    const parsed = Number(rawValue);
    if (Number.isFinite(parsed)) return parsed;
  }

  return rawValue;
}

export default function MaterialesAdmin() {
  const [loadingModelos, setLoadingModelos] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);

  const [modelos, setModelos] = useState([]);
  const [modeloActivo, setModeloActivo] = useState('');
  const [rows, setRows] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [error, setError] = useState('');

  const [editId, setEditId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [editOriginal, setEditOriginal] = useState({});
  const [createValues, setCreateValues] = useState({});

  const pages = useMemo(() => {
    const out = [];
    for (let page = 1; page <= lastPage; page += 1) out.push(page);
    return out;
  }, [lastPage]);

  const columns = useMemo(() => {
    const keys = new Set();

    rows.forEach((row) => {
      Object.keys(row || {}).forEach((key) => {
        if (!HIDDEN_COLUMNS.has(key)) keys.add(key);
      });
    });

    const ordered = Array.from(keys);
    ordered.sort((a, b) => {
      if (a === 'id') return -1;
      if (b === 'id') return 1;
      if (a === 'nombre') return -1;
      if (b === 'nombre') return 1;
      return a.localeCompare(b);
    });

    return ordered;
  }, [rows]);

  const editableColumns = useMemo(() => columns.filter((col) => col !== 'id'), [columns]);
  const createRules = useMemo(() => {
    const baseRule = CREATE_RULES_BY_MODEL[modeloActivo] || {
      requiredAll: DEFAULT_REQUIRED_FIELDS,
      requiredAny: [],
    };

    return {
      requiredAll: (baseRule.requiredAll || []).filter((field) => editableColumns.includes(field)),
      requiredAny: (baseRule.requiredAny || [])
        .map((group) => group.filter((field) => editableColumns.includes(field)))
        .filter((group) => group.length > 0),
    };
  }, [editableColumns, modeloActivo]);

  const requiredCreateFields = createRules.requiredAll;
  const requiredAnyGroups = createRules.requiredAny;

  const columnSamples = useMemo(() => {
    const samples = {};
    editableColumns.forEach((column) => {
      const sampleRow = rows.find((row) => row?.[column] !== null && row?.[column] !== undefined && row?.[column] !== '');
      samples[column] = sampleRow ? sampleRow[column] : '';
    });
    return samples;
  }, [editableColumns, rows]);

  const cargarModelos = async () => {
    setLoadingModelos(true);
    setError('');
    try {
      const response = await adminRepository.listarModelosMaterial();
      const lista = Array.isArray(response?.data) ? response.data : [];
      setModelos(lista);
      if (lista.length > 0) {
        setModeloActivo((prev) => prev || lista[0]);
      }
    } catch (e) {
      setError(e?.message || 'No se pudieron cargar los modelos de materiales');
    } finally {
      setLoadingModelos(false);
    }
  };

  const cargarDatos = async ({ modelo = modeloActivo, page = currentPage } = {}) => {
    if (!modelo) return;

    setLoadingData(true);
    setError('');
    try {
      const response = await adminRepository.obtenerDatosModeloMaterial({ modelo, page });
      const parsed = parsePaginated(response);
      setRows(parsed.rows);
      setCurrentPage(parsed.currentPage);
      setLastPage(parsed.lastPage);
      setTotal(parsed.total);
    } catch (e) {
      setError(e?.message || 'No se pudieron cargar los datos del modelo');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    cargarModelos();
  }, []);

  useEffect(() => {
    if (!modeloActivo) return;
    setEditId(null);
    setEditValues({});
    setEditOriginal({});
    setCreateValues({});
    cargarDatos({ modelo: modeloActivo, page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modeloActivo]);

  useEffect(() => {
    if (editableColumns.length === 0) {
      setCreateValues({});
      return;
    }

    setCreateValues((prev) => {
      const next = {};
      editableColumns.forEach((column) => {
        next[column] = prev[column] ?? '';
      });
      return next;
    });
  }, [editableColumns]);

  const iniciarEdicion = (row) => {
    setEditId(row.id);

    const values = {};
    editableColumns.forEach((key) => {
      values[key] = row[key] ?? '';
    });

    setEditValues(values);
    setEditOriginal(values);
  };

  const cancelarEdicion = () => {
    setEditId(null);
    setEditValues({});
    setEditOriginal({});
  };

  const guardarCambios = async (event) => {
    event.preventDefault();
    if (!modeloActivo || !editId) return;

    const payload = {
      modelo: modeloActivo,
      id: editId,
    };

    editableColumns.forEach((key) => {
      const current = editValues[key] ?? '';
      const original = editOriginal[key] ?? '';
      if (String(current) === String(original)) return;
      payload[key] = normalizeForPayload(current, original);
    });

    const changedFields = Object.keys(payload).filter((key) => key !== 'modelo' && key !== 'id');
    if (changedFields.length === 0) {
      toast('No hay cambios para guardar');
      return;
    }

    setSaving(true);
    try {
      await adminRepository.modificarDatoModeloMaterial(payload);
      toast.success('Registro actualizado');
      cancelarEdicion();
      await cargarDatos();
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

    for (const requiredField of requiredCreateFields) {
      const value = createValues[requiredField];
      if (value === undefined || value === null || String(value).trim() === '') {
        toast.error(`El campo ${requiredField} es obligatorio`);
        return;
      }
    }

    for (const group of requiredAnyGroups) {
      const hasValue = group.some((field) => {
        const value = createValues[field];
        return value !== undefined && value !== null && String(value).trim() !== '';
      });

      if (!hasValue) {
        toast.error(`Debes diligenciar al menos uno de estos campos: ${group.join(', ')}`);
        return;
      }
    }

    const payload = { modelo: modeloActivo };

    editableColumns.forEach((column) => {
      const value = createValues[column];
      if (value === undefined || value === null || String(value).trim() === '') return;
      payload[column] = normalizeForPayload(value, columnSamples[column]);
    });

    const keys = Object.keys(payload).filter((key) => key !== 'modelo');
    if (keys.length === 0) {
      toast.error('Debes diligenciar al menos un campo para crear el registro');
      return;
    }

    setSaving(true);
    try {
      await adminRepository.crearDatoModeloMaterial(payload);
      toast.success('Registro creado');
      setCreateValues({});
      await cargarDatos({ page: 1 });
    } catch (e) {
      toast.error(e?.message || 'No se pudo crear el registro');
    } finally {
      setSaving(false);
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
          onClick={() => cargarDatos({ page: currentPage })}
          disabled={loadingData || !modeloActivo}
        >
          Recargar
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <form className={styles.createCard} onSubmit={crearRegistro}>
        <h4 className={styles.editTitle}>Crear nuevo registro</h4>
        {requiredCreateFields.length > 0 && (
          <p className={styles.hint}>
            Campos obligatorios: {requiredCreateFields.join(', ')}
          </p>
        )}
        {requiredAnyGroups.map((group, idx) => (
          <p key={`group-${idx}`} className={styles.hint}>
            Debes diligenciar al menos uno: {group.join(', ')}
          </p>
        ))}
        <div className={styles.formGrid}>
          {editableColumns.length === 0 && (
            <p className={styles.hint}>No hay columnas disponibles para crear en este modelo.</p>
          )}

          {editableColumns.map((column) => (
            <label key={`create-${column}`}>
              {column}
              {requiredCreateFields.includes(column) && <span className={styles.requiredMark}>*</span>}
              <input
                className={styles.input}
                value={createValues[column] ?? ''}
                required={requiredCreateFields.includes(column)}
                onChange={(e) =>
                  setCreateValues((prev) => ({
                    ...prev,
                    [column]: e.target.value,
                  }))
                }
              />
            </label>
          ))}
        </div>

        <div className={styles.editActions}>
          <button type="submit" className={styles.primaryButton} disabled={saving || editableColumns.length === 0}>
            {saving ? 'Creando...' : 'Crear registro'}
          </button>
        </div>
      </form>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
              <th>accion</th>
            </tr>
          </thead>
          <tbody>
            {!loadingData && rows.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className={styles.empty}>
                  No hay registros para este modelo
                </td>
              </tr>
            )}

            {rows.map((row) => (
              <tr key={row.id}>
                {columns.map((column) => (
                  <td key={`${row.id}-${column}`}>{row[column] ?? '-'}</td>
                ))}
                <td>
                  <button type="button" className={styles.secondaryButton} onClick={() => iniciarEdicion(row)}>
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
          onClick={() => cargarDatos({ page: currentPage - 1 })}
          disabled={currentPage <= 1 || loadingData}
        >
          Anterior
        </button>
        <div className={styles.pages}>
          {pages.map((page) => (
            <button
              type="button"
              key={page}
              className={`${styles.pageButton} ${page === currentPage ? styles.pageButtonActive : ''}`}
              onClick={() => cargarDatos({ page })}
              disabled={loadingData}
            >
              {page}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={() => cargarDatos({ page: currentPage + 1 })}
          disabled={currentPage >= lastPage || loadingData}
        >
          Siguiente
        </button>
      </div>

      {editId && (
        <form className={styles.editCard} onSubmit={guardarCambios}>
          <h4 className={styles.editTitle}>Modificar registro #{editId}</h4>

          <div className={styles.formGrid}>
            {editableColumns.map((column) => (
              <label key={column}>
                {column}
                <input
                  className={styles.input}
                  value={editValues[column] ?? ''}
                  onChange={(e) =>
                    setEditValues((prev) => ({
                      ...prev,
                      [column]: e.target.value,
                    }))
                  }
                />
              </label>
            ))}
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
    </section>
  );
}
