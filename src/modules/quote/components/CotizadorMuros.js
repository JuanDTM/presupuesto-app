// CotizadorMuros.js
import React, { useState } from "react";
import { request } from "../../../lib/httpClient";
import { pdf } from '@react-pdf/renderer';
import CotizacionPDF from '../../muro/components/CotizacionPDF';
import styles from "./CotizadorMuros.module.css";
import apiUrls from "../../../config/api_urls";

/**
 * Componente para cotizar muros creados
 * Transforma los datos del frontend al formato esperado por el backend
 */
export default function CotizadorMuros({ muros, altura, nivel }) {
  const [muroSeleccionado, setMuroSeleccionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [cotizacion, setCotizacion] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  // Parámetros de construcción (valores por defecto)
  const [params, setParams] = useState({
    cinta_corona: 1,
    viga_cimiento: 1,
    cinta_lateral: 1,
    pañete: 2,
    estuco: 2,
    pintura: 2,
    textura: 0,
    acabados_externos: 1,
    mamposteria: 1,
    ladrillo: 4, // 1: farol 10x20x30, 4: farol 12x20x30, 6: tolete 10x6x20
    tipo: 2, // 0: muy bajo, 1: bajo, 2: medio, 3: alto
    clase: 1, // 0: sin carga, 1: carga normal, 2: carga central
    estructura: 1, // 1: estructural, 0: no estructural
  });

  /**
   * Transforma los datos del muro del frontend al formato del backend
   */
  const transformarMuroParaAPI = (muro) => {
    // Calcular ancho libre (distancia entre nodos)
    const anchoLibre = Math.round(
      Math.sqrt(Math.pow(muro.x2 - muro.x1, 2) + Math.pow(muro.y2 - muro.y1, 2)) / 2
    );

    // Ancho estructura (asumiendo que es el ancho libre + nodos)
    const anchoEstructura = anchoLibre + 40; // Aproximación, ajustar según necesidad

    // Base común para todos los tipos de muro (asegurarse que son números)
    const muroBase = {
      tipo: mapearTipoMuro(muro.tipo),
      piso: String(nivel || "1 de 1"),
      ancho_estructura: Number(anchoEstructura),
      ancho: Number(anchoLibre),
      clase: Number(params.clase),
      estructura: Number(params.estructura),
      alto: Number(altura || 220),
    };

    // Mapear según tipo de muro
    switch (muro.tipo) {
      case "entero":
        return {
          ...muroBase,
          medida1: 0,
          medida2: 0,
          medida3: 0,
          ventana: null,
        };

      case "puerta":
        return {
          ...muroBase,
          medida1: Number(muro.muro1 || 0),
          medida2: Number(muro.anchoPuerta || 0),
          medida3: Number(muro.muro2 || 0),
          ventana: null,
        };

      case "ventana":
        return {
          ...muroBase,
          medida1: Number(muro.muro1 || 0),
          medida2: Number(muro.muro2 || 0),
          medida3: Number(muro.muro3 || 0),
          ventana: {
            tipo: "ventana", // Puede ser "ventana", "ventanal", "luceta"
            ancho: Number(muro.anchoVentana || 0),
            alto: Number(muro.altoVentana || 0),
            ubicacion: "centro", // o "lado"
          },
        };

      case "puertaventana":
        return {
          ...muroBase,
          medida1: Number(muro.muro1 || 0),
          medida2: Number(muro.anchoPuerta || 0),
          medida3: Number(muro.muro2 || 0),
          ventana: {
            tipo: "ventana",
            ancho: Number(muro.anchoVentana || 0),
            alto: Number(muro.altoVentana || 0),
            ubicacion: "centro",
          },
        };

      default:
        return {
          ...muroBase,
          medida1: 0,
          medida2: 0,
          medida3: 0,
          ventana: null,
        };
    }
  };

  /**
   * Mapea los tipos de muro del frontend al backend
   */
  const mapearTipoMuro = (tipoFrontend) => {
    const mapeo = {
      entero: "muroEntero",
      ventana: "muroVentana",
      puerta: "muroPuerta",
      puertaventana: "muroPuertaVentana",
    };
    return mapeo[tipoFrontend] || "muroEntero";
  };

  /**
   * Envía la solicitud de cotización al backend
   */
  const cotizarMuro = async () => {
    if (!muroSeleccionado) {
      setError("Debe seleccionar un muro para cotizar");
      return;
    }

    setCargando(true);
    setError(null);
    setCotizacion(null);

    try {
      const muroTransformado = transformarMuroParaAPI(muroSeleccionado);

      const payload = {
        cinta_corona: Number(params.cinta_corona),
        viga_cimiento: Number(params.viga_cimiento),
        cinta_lateral: Number(params.cinta_lateral),
        pañete: Number(params.pañete),
        estuco: Number(params.estuco),
        pintura: Number(params.pintura),
        textura: Number(params.textura),
        acabados_externos: Number(params.acabados_externos),
        mamposteria: Number(params.mamposteria),
        ladrillo: Number(params.ladrillo),
        tipo: Number(params.tipo),
        muro: muroTransformado,
      };

      // Validar que el payload tenga la estructura correcta
      console.log("=== DEBUG: Muro Original ===");
      console.log(muroSeleccionado);
      
      console.log("=== DEBUG: Muro Transformado ===");
      console.log(muroTransformado);
      
      console.log("=== DEBUG: Payload Completo ===");
      console.log(JSON.stringify(payload, null, 2));

      // Validar tipos de datos
      if (typeof payload.muro.ancho !== 'number' || isNaN(payload.muro.ancho)) {
        throw new Error('El ancho del muro debe ser un número válido');
      }
      if (typeof payload.muro.alto !== 'number' || isNaN(payload.muro.alto)) {
        throw new Error('El alto del muro debe ser un número válido');
      }

      const response = await request(apiUrls.cotizacion.cotizarMuro, { method: 'POST', body: payload });

      setCotizacion(response);
      console.log("=== Cotización recibida exitosamente ===");
      console.log(response);
    } catch (err) {
      console.error("Error al cotizar:", err);
      setError(err.message || "Error al obtener la cotización");
    } finally {
      setCargando(false);
    }
  };

  /**
   * Abre el modal con un muro seleccionado
   */
  const abrirModal = (muro, index) => {
    setMuroSeleccionado({ ...muro, index });
    setMostrarModal(true);
    setCotizacion(null);
    setError(null);
  };

  /**
   * Cierra el modal
   */
  const cerrarModal = () => {
    setMostrarModal(false);
    setMuroSeleccionado(null);
    setCotizacion(null);
    setError(null);
  };

  /**
   * Actualiza un parámetro de construcción
   */
  const actualizarParametro = (key, value) => {
    setParams({ ...params, [key]: parseInt(value) });
  };

  /**
   * Genera y descarga el PDF de la cotización
   */
  const descargarPDF = async () => {
    if (!cotizacion || !muroSeleccionado) {
      setError("No hay cotización disponible para descargar");
      return;
    }

    try {
      // Generar el PDF
      const blob = await pdf(<CotizacionPDF 
        cotizacion={cotizacion} 
        muroSeleccionado={muroSeleccionado} 
      />).toBlob();

      // Crear URL temporal y descargar
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cotizacion-muro-${muroSeleccionado.index + 1}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al generar PDF:", error);
      setError("Error al generar el PDF");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>Cotizador de Muros</div>
      <div className={styles.listContainer}>
        {muros && muros.length > 0 ? (
          <ul className={styles.murosList}>
            {muros.map((muro, index) => (
              <li key={index} className={styles.muroItem}>
                <div className={styles.muroInfo}>
                  <div className={styles.muroTitle}>Muro {index + 1}</div>
                  <div className={styles.muroDetails}>
                    Tipo: <strong>{muro.tipo}</strong>
                  </div>
                  <div className={styles.muroDetails}>
                    Nodos: N{muro.nodoA + 1} → N{muro.nodoB + 1}
                  </div>
                </div>
                <button
                  onClick={() => abrirModal(muro, index)}
                  className={styles.cotizarButton}
                >
                  Cotizar
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.emptyMessage}>No hay muros creados para cotizar</p>
        )}
      </div>

      {/* Modal de cotización */}
      {mostrarModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Cotizar Muro {muroSeleccionado?.index + 1}</h2>
              <p className={styles.modalSubtitle}>
                <strong>Tipo:</strong> {muroSeleccionado?.tipo} |{" "}
                <strong>Nodos:</strong> N{muroSeleccionado?.nodoA + 1} → N
                {muroSeleccionado?.nodoB + 1}
              </p>
            </div>

            {/* Parámetros de construcción */}
            <div className={styles.parametrosGrid}>
              <div className={styles.parametroItem}>
                <label className={styles.parametroLabel}>Cinta corona:</label>
                <select
                  value={params.cinta_corona}
                  onChange={(e) => actualizarParametro("cinta_corona", e.target.value)}
                  className={styles.parametroSelect}
                >
                  <option value={1}>Sí</option>
                  <option value={0}>No</option>
                </select>
              </div>

              <div className={styles.parametroItem}>
                <label className={styles.parametroLabel}>Viga cimiento:</label>
                <select
                  value={params.viga_cimiento}
                  onChange={(e) => actualizarParametro("viga_cimiento", e.target.value)}
                  className={styles.parametroSelect}
                >
                  <option value={1}>Sí</option>
                  <option value={0}>No</option>
                </select>
              </div>

              <div className={styles.parametroItem}>
                <label className={styles.parametroLabel}>Cinta lateral:</label>
                <select
                  value={params.cinta_lateral}
                  onChange={(e) => actualizarParametro("cinta_lateral", e.target.value)}
                  className={styles.parametroSelect}
                >
                  <option value={0}>Ninguna</option>
                  <option value={1}>Un lado</option>
                  <option value={2}>Ambos lados</option>
                </select>
              </div>

              <div className={styles.parametroItem}>
                <label className={styles.parametroLabel}>Pañete:</label>
                <select
                  value={params.pañete}
                  onChange={(e) => actualizarParametro("pañete", e.target.value)}
                  className={styles.parametroSelect}
                >
                  <option value={0}>Sin pañete</option>
                  <option value={1}>Una cara</option>
                  <option value={2}>Ambas caras</option>
                </select>
              </div>

              <div className={styles.parametroItem}>
                <label className={styles.parametroLabel}>Estuco:</label>
                <select
                  value={params.estuco}
                  onChange={(e) => actualizarParametro("estuco", e.target.value)}
                  className={styles.parametroSelect}
                >
                  <option value={0}>Sin estuco</option>
                  <option value={1}>Una cara</option>
                  <option value={2}>Ambas caras</option>
                </select>
              </div>

              <div className={styles.parametroItem}>
                <label className={styles.parametroLabel}>Pintura:</label>
                <select
                  value={params.pintura}
                  onChange={(e) => actualizarParametro("pintura", e.target.value)}
                  className={styles.parametroSelect}
                >
                  <option value={0}>Sin pintura</option>
                  <option value={1}>Una cara</option>
                  <option value={2}>Ambas caras</option>
                </select>
              </div>

              <div className={styles.parametroItem}>
                <label className={styles.parametroLabel}>Textura:</label>
                <select
                  value={params.textura}
                  onChange={(e) => actualizarParametro("textura", e.target.value)}
                  className={styles.parametroSelect}
                >
                  <option value={0}>Sin textura</option>
                  <option value={1}>Una cara</option>
                  <option value={2}>Ambas caras</option>
                </select>
              </div>

              <div className={styles.parametroItem}>
                <label className={styles.parametroLabel}>Acabados externos:</label>
                <select
                  value={params.acabados_externos}
                  onChange={(e) => actualizarParametro("acabados_externos", e.target.value)}
                  className={styles.parametroSelect}
                >
                  <option value={1}>Sí</option>
                  <option value={0}>No</option>
                </select>
              </div>

              <div className={styles.parametroItem}>
                <label className={styles.parametroLabel}>Mampostería:</label>
                <select
                  value={params.mamposteria}
                  onChange={(e) => actualizarParametro("mamposteria", e.target.value)}
                  className={styles.parametroSelect}
                >
                  <option value={1}>Sí</option>
                  <option value={0}>No</option>
                </select>
              </div>

              <div className={styles.parametroItem}>
                <label className={styles.parametroLabel}>Tipo de ladrillo:</label>
                <select
                  value={params.ladrillo}
                  onChange={(e) => actualizarParametro("ladrillo", e.target.value)}
                  className={styles.parametroSelect}
                >
                  <option value={1}>Farol 10x20x30</option>
                  <option value={4}>Farol 12x20x30</option>
                  <option value={6}>Tolete 10x6x20</option>
                </select>
              </div>

              <div className={styles.parametroItem}>
                <label className={styles.parametroLabel}>Resistencia:</label>
                <select
                  value={params.tipo}
                  onChange={(e) => actualizarParametro("tipo", e.target.value)}
                  className={styles.parametroSelect}
                >
                  <option value={0}>Peso muy bajo</option>
                  <option value={1}>Peso bajo</option>
                  <option value={2}>Peso medio</option>
                  <option value={3}>Peso alto</option>
                </select>
              </div>

              <div className={styles.parametroItem}>
                <label className={styles.parametroLabel}>Clase de viga:</label>
                <select
                  value={params.clase}
                  onChange={(e) => actualizarParametro("clase", e.target.value)}
                  className={styles.parametroSelect}
                >
                  <option value={0}>Sin carga</option>
                  <option value={1}>Carga normal</option>
                  <option value={2}>Carga central</option>
                </select>
              </div>

              <div className={styles.parametroItem}>
                <label className={styles.parametroLabel}>Muro estructural:</label>
                <select
                  value={params.estructura}
                  onChange={(e) => actualizarParametro("estructura", e.target.value)}
                  className={styles.parametroSelect}
                >
                  <option value={1}>Sí</option>
                  <option value={0}>No</option>
                </select>
              </div>
            </div>

            {/* Botones de acción */}
            <div className={styles.accionesContainer}>
              <button
                onClick={cotizarMuro}
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
                    <h4 className={styles.seccionTitle}>Mano de Obra:</h4>
                    <pre className={styles.manoObraText}>
                      {cotizacion.mano_obra}
                    </pre>
                  </div>
                )}

                {/* Valor total */}
                {cotizacion.valor_total_mano_obra && (
                  <div className={styles.valorTotal}>
                    Valor Total Mano de Obra: ${cotizacion.valor_total_mano_obra}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

