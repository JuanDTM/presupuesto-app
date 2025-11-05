// CotizadorPiso.js
import React, { useState, useEffect } from "react";
import { request } from "../../../lib/httpClient";
import { pdf } from '@react-pdf/renderer';
import CotizacionPisoPDF from './CotizacionPisoPDF';
import styles from "./CotizadorPiso.module.css";
import apiUrls from "../../../config/api_urls";

/**
 * Componente para cotizar pisos
 * @param {number} largo - Largo del piso en cm (desde ComponenteEjesNodos)
 * @param {number} ancho - Ancho del piso en cm (desde ComponenteEjesNodos)
 */
export default function CotizadorPiso({ largo = 150, ancho = 200 }) {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [cotizacion, setCotizacion] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  // Parámetros del piso
  const [params, setParams] = useState({
    largo: largo,      // Longitud A en cm (desde props)
    ancho: ancho,      // Longitud B en cm (desde props)
    losa: 2,         // 0: sin losa, 1: losa fina 7cm, 2: losa normal 8cm, 3: losa pobre 10cm
    mortero: 1,      // 0: sin mortero, 1: mortero 3cm, 2: mortero 5cm, 3: mortero 7cm
    enchape: 1       // 0: sin enchape, 1: cerámica, 2: porcelanato
  });

  // Actualizar largo y ancho cuando cambien las props
  useEffect(() => {
    setParams(prev => ({
      ...prev,
      largo: largo,
      ancho: ancho
    }));
  }, [largo, ancho]);

  /**
   * Envía la solicitud de cotización al backend
   */
  const cotizarPiso = async () => {
    // Validaciones
    if (!params.largo || params.largo <= 0) {
      setError("El largo debe ser mayor a 0");
      return;
    }
    if (!params.ancho || params.ancho <= 0) {
      setError("El ancho debe ser mayor a 0");
      return;
    }

    setCargando(true);
    setError(null);
    setCotizacion(null);

    try {
      const payload = {
        largo: Number(params.largo),
        ancho: Number(params.ancho),
        losa: Number(params.losa),
        mortero: Number(params.mortero),
        enchape: Number(params.enchape)
      };

      console.log("=== DEBUG: Payload Cotización Piso ===");
      console.log(JSON.stringify(payload, null, 2));

      const response = await request(apiUrls.cotizacion.cotizarPiso, { 
        method: 'POST', 
        body: payload 
      });

      setCotizacion(response);
      console.log("=== Cotización de piso recibida exitosamente ===");
      console.log(response);
    } catch (err) {
      console.error("Error al cotizar piso:", err);
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
   * Actualiza un parámetro del piso
   */
  const actualizarParametro = (key, value) => {
    setParams({ ...params, [key]: parseFloat(value) || 0 });
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
      const blob = await pdf(<CotizacionPisoPDF 
        cotizacion={cotizacion} 
        params={params}
      />).toBlob();

      // Crear URL temporal y descargar
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cotizacion-piso-${new Date().toISOString().split('T')[0]}.pdf`;
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

  return (
    <div className={styles.container}>
      <div className={styles.header}>Cotizador de Pisos</div>
      
      <button
        onClick={abrirModal}
        className={styles.abrirModalButton}
      >
        Cotizar Piso
      </button>

      {/* Modal de cotización */}
      {mostrarModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Cotizar Piso</h2>
              <p className={styles.modalSubtitle}>
                Las dimensiones se toman del diseño actual. Configure las características del piso a cotizar.
              </p>
            </div>

            {/* Parámetros del piso */}
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
                <label className={styles.parametroLabel}>Losa:</label>
                <select
                  value={params.losa}
                  onChange={(e) => actualizarParametro("losa", e.target.value)}
                  className={styles.parametroSelect}
                >
                  <option value={0}>Sin losa</option>
                  <option value={1}>Losa fina de 7cm</option>
                  <option value={2}>Losa normal de 8cm</option>
                  <option value={3}>Losa pobre de 10cm</option>
                </select>
              </div>

              <div className={styles.parametroItem}>
                <label className={styles.parametroLabel}>Mortero:</label>
                <select
                  value={params.mortero}
                  onChange={(e) => actualizarParametro("mortero", e.target.value)}
                  className={styles.parametroSelect}
                >
                  <option value={0}>Sin mortero</option>
                  <option value={1}>Mortero de 3cm</option>
                  <option value={2}>Mortero de 5cm</option>
                  <option value={3}>Mortero de 7cm</option>
                </select>
              </div>

              <div className={styles.parametroItem}>
                <label className={styles.parametroLabel}>Enchape:</label>
                <select
                  value={params.enchape}
                  onChange={(e) => actualizarParametro("enchape", e.target.value)}
                  className={styles.parametroSelect}
                >
                  <option value={0}>Sin enchape</option>
                  <option value={1}>Cerámica</option>
                  <option value={2}>Porcelanato</option>
                </select>
              </div>
            </div>

            {/* Botones de acción */}
            <div className={styles.accionesContainer}>
              <button
                onClick={cotizarPiso}
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

