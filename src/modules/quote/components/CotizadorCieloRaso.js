// CotizadorCieloRaso.js
import React, { useState, useEffect } from "react";
import { request } from "../../../lib/httpClient";
import { pdf } from '@react-pdf/renderer';
import CotizacionCieloRasoPDF from './CotizacionCieloRasoPDF';
import styles from "./CotizadorCieloRaso.module.css";
import apiUrls from "../../../config/api_urls";

/**
 * Componente para cotizar cielo raso
 * @param {number} largo - Largo del cielo raso en cm (desde ComponenteEjesNodos)
 * @param {number} ancho - Ancho del cielo raso en cm (desde ComponenteEjesNodos)
 */
export default function CotizadorCieloRaso({ largo = 150, ancho = 200 }) {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [cotizacion, setCotizacion] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  // Parámetros del cielo raso
  const [params, setParams] = useState({
    largo: largo,      // Longitud A en cm (desde props)
    ancho: ancho,      // Longitud B en cm (desde props)
    tipo: 1,           // 1: panel_yeso, 2: superboard 6mm, 3: superboard 8mm, 4: pvc sencillo, 5: pvc diagonal
    vacio: 50,         // Medida entre el cielo raso y el techo en cm
    estructura: 1,     // 0: no lleva estructura, 1: lleva estructura
    laminacion: 1,     // 0: no lleva laminación, 1: lleva laminación
    masilla: 0,        // 0: no lleva masilla, 1: lleva masilla (sistema druwall)
    pintura: 0         // 0: no lleva pintura, 1: lleva pintura (sistema druwall)
  });

  // Actualizar largo y ancho cuando cambien las props
  useEffect(() => {
    setParams(prev => ({
      ...prev,
      largo: largo,
      ancho: ancho
    }));
  }, [largo, ancho]);

  // Si el tipo es PVC (4 o 5), masilla y pintura deben ser 0
  useEffect(() => {
    if (params.tipo === 4 || params.tipo === 5) {
      setParams(prev => ({
        ...prev,
        masilla: 0,
        pintura: 0
      }));
    }
  }, [params.tipo]);

  /**
   * Envía la solicitud de cotización al backend
   */
  const cotizarCieloRaso = async () => {
    // Validaciones
    if (!params.largo || params.largo <= 0) {
      setError("El largo debe ser mayor a 0");
      return;
    }
    if (!params.ancho || params.ancho <= 0) {
      setError("El ancho debe ser mayor a 0");
      return;
    }
    if (!params.vacio || params.vacio < 0) {
      setError("El vacío debe ser mayor o igual a 0");
      return;
    }

    setCargando(true);
    setError(null);
    setCotizacion(null);

    try {
      const payload = {
        largo: Number(params.largo),
        ancho: Number(params.ancho),
        tipo: Number(params.tipo),
        vacio: Number(params.vacio),
        estructura: Number(params.estructura),
        laminacion: Number(params.laminacion),
        masilla: Number(params.masilla),
        pintura: Number(params.pintura)
      };

      console.log("=== DEBUG: Payload Cotización Cielo Raso ===");
      console.log(JSON.stringify(payload, null, 2));

      const response = await request(apiUrls.cotizacion.cotizarCielo, { 
        method: 'POST', 
        body: payload 
      });

      setCotizacion(response);
      console.log("=== Cotización de cielo raso recibida exitosamente ===");
      console.log(response);
    } catch (err) {
      console.error("Error al cotizar cielo raso:", err);
      setError(err.message || "Error al obtener la cotización");
    } finally {
      setCargando(false);
    }
  };

  /**
   * Abre el modal
   */
  const abrirModal = () => {
    setMostrarModal(true);
    setCotizacion(null);
    setError(null);
  };

  /**
   * Cierra el modal
   */
  const cerrarModal = () => {
    setMostrarModal(false);
    setCotizacion(null);
    setError(null);
  };

  /**
   * Actualiza un parámetro del cielo raso
   */
  const actualizarParametro = (key, value) => {
    const newParams = { ...params, [key]: parseInt(value) || 0 };
    
    // Si se cambia el tipo a PVC, forzar masilla y pintura a 0
    if (key === 'tipo' && (value === '4' || value === '5')) {
      newParams.masilla = 0;
      newParams.pintura = 0;
    }
    
    setParams(newParams);
  };

  /**
   * Genera y descarga el PDF de la cotización
   */
  const descargarPDF = async () => {
    if (!cotizacion) {
      setError("No hay cotización disponible para descargar");
      return;
    }

    try {
      // Generar el PDF
      const blob = await pdf(<CotizacionCieloRasoPDF 
        cotizacion={cotizacion} 
        params={params}
      />).toBlob();

      // Crear URL temporal y descargar
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cotizacion-cielo-raso-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al generar PDF:", error);
      setError("Error al generar el PDF");
    }
  };

  // Calcular área en m²
  const areaM2 = ((params.largo * params.ancho) / 10000).toFixed(2);
  
  // Verificar si es PVC
  const esPVC = params.tipo === 4 || params.tipo === 5;

  return (
    <div className={styles.container}>
      <div className={styles.header}>Cotizador de Cielo Raso</div>
      
      <button
        onClick={abrirModal}
        className={styles.abrirModalButton}
      >
        Cotizar Cielo Raso
      </button>

      {/* Modal de cotización */}
      {mostrarModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Cotizar Cielo Raso</h2>
              <p className={styles.modalSubtitle}>
                Las dimensiones se toman del diseño actual. Configure las características del cielo raso a cotizar.
              </p>
            </div>

            {/* Parámetros del cielo raso */}
            <div className={styles.parametrosGrid}>
              <div className={styles.parametroItem}>
                <label className={styles.parametroLabel}>Largo (cm):</label>
                <div className={styles.areaDisplay}>{params.largo} cm</div>
                <small className={styles.infoText}>Valor tomado del diseño</small>
              </div>

              <div className={styles.parametroItem}>
                <label className={styles.parametroLabel}>Ancho (cm):</label>
                <div className={styles.areaDisplay}>{params.ancho} cm</div>
                <small className={styles.infoText}>Valor tomado del diseño</small>
              </div>

              <div className={styles.parametroItem}>
                <label className={styles.parametroLabel}>Área (m²):</label>
                <div className={styles.areaDisplay}>{areaM2} m²</div>
              </div>

              <div className={styles.parametroItem}>
                <label className={styles.parametroLabel}>Tipo de material:</label>
                <select
                  value={params.tipo}
                  onChange={(e) => actualizarParametro("tipo", e.target.value)}
                  className={styles.parametroSelect}
                >
                  <option value={1}>Panel Yeso</option>
                  <option value={2}>Superboard 6mm</option>
                  <option value={3}>Superboard 8mm</option>
                  <option value={4}>PVC Sencillo</option>
                  <option value={5}>PVC Diagonal</option>
                </select>
              </div>

              <div className={styles.parametroItem}>
                <label className={styles.parametroLabel}>Vacíos (cm):</label>
                <input
                  type="number"
                  value={params.vacio}
                  onChange={(e) => actualizarParametro("vacio", e.target.value)}
                  className={styles.parametroInput}
                  min="0"
                  step="1"
                />
                <small className={styles.infoText}>Medida entre cielo raso y techo</small>
              </div>

              <div className={styles.parametroItem}>
                <label className={styles.parametroLabel}>Estructura:</label>
                <select
                  value={params.estructura}
                  onChange={(e) => actualizarParametro("estructura", e.target.value)}
                  className={styles.parametroSelect}
                >
                  <option value={0}>No lleva estructura</option>
                  <option value={1}>Lleva estructura</option>
                </select>
              </div>

              <div className={styles.parametroItem}>
                <label className={styles.parametroLabel}>Laminación:</label>
                <select
                  value={params.laminacion}
                  onChange={(e) => actualizarParametro("laminacion", e.target.value)}
                  className={styles.parametroSelect}
                >
                  <option value={0}>No lleva laminación</option>
                  <option value={1}>Lleva laminación</option>
                </select>
              </div>

              <div className={styles.parametroItem}>
                <label className={styles.parametroLabel}>
                  Masilla (sistema druwall):
                  {esPVC && <span className={styles.warningText}> - No aplica para PVC</span>}
                </label>
                <select
                  value={params.masilla}
                  onChange={(e) => actualizarParametro("masilla", e.target.value)}
                  className={styles.parametroSelect}
                  disabled={esPVC}
                >
                  <option value={0}>No lleva masilla</option>
                  <option value={1}>Lleva masilla</option>
                </select>
              </div>

              <div className={styles.parametroItem}>
                <label className={styles.parametroLabel}>
                  Pintura (sistema druwall):
                  {esPVC && <span className={styles.warningText}> - No aplica para PVC</span>}
                </label>
                <select
                  value={params.pintura}
                  onChange={(e) => actualizarParametro("pintura", e.target.value)}
                  className={styles.parametroSelect}
                  disabled={esPVC}
                >
                  <option value={0}>No lleva pintura</option>
                  <option value={1}>Lleva pintura</option>
                </select>
              </div>
            </div>

            {/* Botones de acción */}
            <div className={styles.accionesContainer}>
              <button
                onClick={cotizarCieloRaso}
                disabled={cargando}
                className={styles.btnPrimario}
              >
                {cargando ? "Cotizando..." : "Obtener Cotización"}
              </button>
              {cotizacion && (
                <button
                  onClick={descargarPDF}
                  className={styles.btnDescargar}
                  title="Descargar cotización en PDF"
                >
                  📄 Descargar PDF
                </button>
              )}
              <button onClick={cerrarModal} className={styles.btnSecundario}>
                Cerrar
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className={styles.errorContainer}>
                <strong>Error:</strong> {error}
              </div>
            )}

            {/* Resultado de cotización */}
            {cotizacion && (
              <div className={styles.resultadosContainer}>
                <h3 className={styles.resultadosTitle}>Resultado de la Cotización</h3>

                {/* Materiales */}
                {cotizacion.materiales && (
                  <div className={styles.seccionMateriales}>
                    <h4 className={styles.seccionTitle}>Materiales:</h4>
                    <table className={styles.materialesTable}>
                      <tbody>
                        {Object.entries(cotizacion.materiales).map(([key, value]) => {
                          if (typeof value === "object") {
                            return Object.entries(value).map(([subKey, subValue]) => (
                              <tr key={`${key}-${subKey}`}>
                                <td>{subKey.replace(/_/g, " ")}</td>
                                <td>{subValue}</td>
                              </tr>
                            ));
                          }
                          return (
                            <tr key={key}>
                              <td>{key.replace(/_/g, " ")}</td>
                              <td>{value}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Mano de obra */}
                {cotizacion.mano_obra && (
                  <div className={styles.seccionManoObra}>
                    <h4 className={styles.seccionTitle}>Mano de Obra y Materiales:</h4>
                    <pre className={styles.manoObraText}>
                      {cotizacion.mano_obra}
                    </pre>
                  </div>
                )}

                {/* Valores totales */}
                <div className={styles.valoresTotalesContainer}>
                  {cotizacion.valor_total_mano_obra && (
                    <div className={styles.valorTotal}>
                      Valor Total Mano de Obra: ${cotizacion.valor_total_mano_obra}
                    </div>
                  )}
                  {cotizacion.Valor_total_Materiales && (
                    <div className={styles.valorTotal}>
                      Valor Total Materiales: ${cotizacion.Valor_total_Materiales}
                    </div>
                  )}
                  {cotizacion.Valor_total_obra_a_todo_costo && (
                    <div className={styles.valorTotalObra}>
                      Valor Total de la Obra: ${cotizacion.Valor_total_obra_a_todo_costo}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

