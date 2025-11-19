import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Stage,
  Layer,
  Line,
  Image as KonvaImage,
  Rect,
  Group,
  Transformer,
  Text,
  Circle,
} from "react-konva";
import { pdf } from "@react-pdf/renderer";
import { request } from "../../../lib/httpClient";
import apiUrls from "../../../config/api_urls";
import CotizacionHidraulicaPDF from "./CotizacionHidraulicaPDF";
import "./HidraulicaModal.css";

/**
 * HidraulicaModal.jsx
 *
 * - Dibuja ejes principales/secundarios
 * - Preload de iconos
 * - Colocar / mover / rotar iconos
 * - Preparar payload para API y enviar
 * - Mostrar resultado (cotizacion) y permitir descargar PDF
 */

/* Rutas de iconos (ajusta según tu estructura pública) */
const ICONS_PATHS = {
  inodoro: "/imagenes-proyecto/inodoro.png",
  recamara: "/imagenes-proyecto/recamara.png",
  ducha: "/imagenes-proyecto/ducha.png",
  calentador: "/imagenes-proyecto/calentador.png",
  lavadero: "/imagenes-proyecto/lavadero.png",
  lavaplatos: "/imagenes-proyecto/lavaplatos.png",
  lavadora: "/imagenes-proyecto/lavadora.png",
  lavamanos: "/imagenes-proyecto/lavamanos.png",
  bajante: "/imagenes-proyecto/bajante.png",
  salida: "/imagenes-proyecto/salida.png",
  sifon: "/imagenes-proyecto/sifon.png",
};

/* Tamaños en cm (usa para cálculo visual y conversión) */
const ICON_SIZES_CM = {
  inodoro: [60, 60],
  recamara: [100, 100],
  ducha: [10, 40],
  calentador: [15, 30],
  lavadero: [60, 60],
  lavaplatos: [60, 60],
  lavadora: [100, 100],
  lavamanos: [45, 35],
  bajante: [10, 10],
  salida: [20, 40],
  sifon: [10, 10],
};

/* Rotaciones permitidas por tipo */
const ROTATION_OPTIONS = {
  inodoro: [0, 90, 180, 270],
  ducha: [0, 90, 180, 270],
  salida: [0, 90, 180, 270],
  calentador: [0, 90],
  lavadero: [0, 90],
  lavaplatos: [0, 90],
  lavadora: [0, 90],
  lavamanos: [0, 90],
  recamara: [0],
  bajante: [0],
  sifon: [0],
};

const AGUA_CALIENTE = ["lavaplatos", "lavamanos", "lavadora", "ducha", "calentador"];
const AGUA_FRIA = ["recamara", "inodoro", "lavaplatos", "lavamanos", "lavadero", "lavadora", "ducha", "bajante", "calentador"];

/* Stage sizing & scaling */
const margen = 50;
const baseStageWidth = 800;
const baseStageHeight = 600;
const escalaBase = 2; // pixeles por cm (visual)

/* Helper: convierte px -> cm (basado en escalaBase) */
const pxToCm = (px) => px / escalaBase;

/* -----------------------------------------
   Componente principal
   ----------------------------------------- */
export default function HidraulicaModal({ onVolver = () => {}, onClose = () => {} }) {
    // dimensiones del área en cm
    const [ancho, setAncho] = useState(200);
    const [largo, setLargo] = useState(300);

    // zoom %
    const [zoomPct, setZoomPct] = useState(40);

    // ejes secundarios (orientacion: 'V'|'H', distancia en cm)
    const [ejesSecundarios, setEjesSecundarios] = useState([]);

    // puntos colocados en canvas
    // cada punto: { id, tipo, x (px), y (px), rotation }
    const [puntos, setPuntos] = useState([]);

    // colocación temporal (cuando el usuario clickea el icono para colocar)
    const [placingPoint, setPlacingPoint] = useState(null);

    // selección de punto para mover / rotar
    const [selectedPointId, setSelectedPointId] = useState(null);

    // opciones adicionales
    const [tienePiso, setTienePiso] = useState(true);
    const [tieneResane, setTieneResane] = useState(false);

    // respuesta API y params usados
    const [cotizacion, setCotizacion] = useState(null);
    const [ultimoFormulario, setUltimoFormulario] = useState(null);

    // estado de envío
    const [isSubmitting, setIsSubmitting] = useState(false);

    const stageRef = useRef(null);
    const trRef = useRef(null);

  // ------------- precarga de imágenes -------------
  const [imagesMap, setImagesMap] = useState({});
  useEffect(() => {
    let mounted = true;
    const entries = Object.entries(ICONS_PATHS);
    Promise.all(
      entries.map(([tipo, src]) =>
        new Promise((resolve) => {
          const img = new window.Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve([tipo, img]);
          img.onerror = () => {
            console.warn("Error cargando imagen:", src);
            resolve([tipo, null]);
          };
          img.src = src;
        })
      )
    ).then((results) => {
      if (!mounted) return;
      const map = {};
      results.forEach(([tipo, img]) => {
        if (img) map[tipo] = img;
      });
      setImagesMap(map);
      console.log("Images preloaded:", Object.keys(map));
    });
    return () => {
      mounted = false;
    };
  }, []);
  // ------------------------------------------------

  /* Ejes principales (rectángulo que delimita área) */
  const ejesPrincipales = useMemo(() => {
    return [
      { x1: margen, y1: margen, x2: margen + ancho * escalaBase, y2: margen },
      { x1: margen + ancho * escalaBase, y1: margen, x2: margen + ancho * escalaBase, y2: margen + largo * escalaBase },
      { x1: margen + ancho * escalaBase, y1: margen + largo * escalaBase, x2: margen, y2: margen + largo * escalaBase },
      { x1: margen, y1: margen + largo * escalaBase, x2: margen, y2: margen },
    ];
  }, [ancho, largo]);

  /* Add / remove ejes secundarios */
  const [nuevoEjeOrientacion, setNuevoEjeOrientacion] = useState("V");
  const [nuevoEjeDistancia, setNuevoEjeDistancia] = useState("");
  const agregarEje = () => {
    const dist = parseFloat(nuevoEjeDistancia);
    if (!Number.isFinite(dist) || dist <= 0) {
      alert("Ingresa una distancia válida mayor que 0");
      return;
    }
    if (nuevoEjeOrientacion === "V" && dist >= ancho) {
      alert("La distancia vertical debe ser menor que el ancho");
      return;
    }
    if (nuevoEjeOrientacion === "H" && dist >= largo) {
      alert("La distancia horizontal debe ser menor que el largo");
      return;
    }
    setEjesSecundarios((prev) => [...prev, { orientacion: nuevoEjeOrientacion, distancia: dist }]);
    setNuevoEjeDistancia("");
  };
  const eliminarEje = (index) => setEjesSecundarios((prev) => prev.filter((_, i) => i !== index));

  /* get visual size in px para un tipo */
  const getSizePx = (tipo) => {
    const [wCm, hCm] = ICON_SIZES_CM[tipo] || [40, 40];
    return [wCm * escalaBase, hCm * escalaBase];
  };

  /* Zoom helpers */
  const applyStageZoom = (stage, newScale, center) => {
    const oldScale = stage.scaleX() || 1;
    const mousePointTo = {
      x: (center.x - stage.x()) / oldScale,
      y: (center.y - stage.y()) / oldScale,
    };
    stage.scale({ x: newScale, y: newScale });
    const newPos = {
      x: center.x - mousePointTo.x * newScale,
      y: center.y - mousePointTo.y * newScale,
    };
    stage.position(newPos);
    stage.batchDraw();
    setZoomPct(Math.round(newScale * 100));
  };
  const zoomIn = () => {
    const stage = stageRef.current;
    if (!stage) return;
    const oldScale = stage.scaleX() || 1;
    const newScale = Math.min(oldScale * 1.15, 3);
    applyStageZoom(stage, newScale, { x: baseStageWidth / 2, y: baseStageHeight / 2 });
  };
  const zoomOut = () => {
    const stage = stageRef.current;
    if (!stage) return;
    const oldScale = stage.scaleX() || 1;
    const newScale = Math.max(oldScale / 1.15, 0.4);
    applyStageZoom(stage, newScale, { x: baseStageWidth / 2, y: baseStageHeight / 2 });
  };
  const handleWheel = (e) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    const oldScale = stage.scaleX() || 1;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    const scaleBy = 1.05;
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    const clamped = Math.min(Math.max(newScale, 0.4), 3);
    applyStageZoom(stage, clamped, pointer);
  };

  /* Mouse move para colocar icono flotante */
  const handleMouseMove = (e) => {
    if (!placingPoint) return;
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    if (!pos) return;
    setPlacingPoint((p) => ({ ...p, x: pos.x, y: pos.y }));
  };

  /* Click en stage: si estamos en placingPoint, confirmamos el punto */
  const handleStageClick = (e) => {
    if (placingPoint) {
      const { x, y } = placingPoint;
      // validar dentro del área
      if (x < margen || x > margen + ancho * escalaBase || y < margen || y > margen + largo * escalaBase) {
        alert("El punto debe quedar dentro del área de dibujo");
        return;
      }
      setPuntos((prev) => [...prev, { ...placingPoint, id: Date.now() }]);
      setPlacingPoint(null);
      setSelectedPointId(null);
      return;
    }
    // si no se estaba colocando, deselect
    setSelectedPointId(null);
  };

  /* Selection / movimiento / rotación */
  const seleccionarPunto = (id) => setSelectedPointId(id);
  const moverPunto = (id, x, y) => setPuntos((prev) => prev.map((p) => (p.id === id ? { ...p, x, y } : p)));
  const rotarPunto = (id) => {
    setPuntos((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const opciones = ROTATION_OPTIONS[p.tipo] || [0];
        const actualIndex = opciones.indexOf(p.rotation || 0);
        const siguienteIndex = (actualIndex + 1) % opciones.length;
        return { ...p, rotation: opciones[siguienteIndex] };
      })
    );
  };

  /* Attach transformer to selected node */
  useEffect(() => {
    if (!trRef.current || !stageRef.current) return;
    const stage = stageRef.current;
    const layer = stage.findOne("Layer");
    if (!layer) return;
    const node = layer.findOne(`#point-${selectedPointId}`);
    if (node) {
      trRef.current.nodes([node]);
      trRef.current.getLayer().batchDraw();
    } else {
      trRef.current.nodes([]);
      trRef.current.getLayer().batchDraw();
    }
  }, [selectedPointId, puntos]);

    /* Preparar payload para API basado en puntos / ejes / dimensiones */
    const prepararPayload = () => {
      // Convertir puntos a coordenadas en cm (restando margen)
      const puntosEnCm = puntos.map((punto) => ({
        id: punto.id,
        tipo: punto.tipo,
        x_cm: Number(pxToCm(punto.x - margen).toFixed(2)),
        y_cm: Number(pxToCm(punto.y - margen).toFixed(2)),
        rotation: punto.rotation || 0,
      }));
  
      // Convertir ejes secundarios a formato requerido
      const ejesSecundariosFormateados = ejesSecundarios.map((eje) => ({
        orientacion: eje.orientacion,
        distancia_cm: Number(eje.distancia.toFixed(2)),
      }));
  
      // Construir el objeto plano para un nivel
      const planoNivel = {
        ancho_cm: ancho,
        largo_cm: largo,
        puntos: puntosEnCm,
        ejes_secundarios: ejesSecundariosFormateados,
      };
  
      // Construir el payload con el formato exacto requerido por la API
      const payload = {
        niveles: [
          {
            piso: tienePiso,
            resane: tieneResane,
            plano: planoNivel,
          },
        ],
      };
  
      return payload;
    };

  /* Enviar cotización a la API */
  const enviarCotizacion = async () => {
    const payload = prepararPayload();
    console.log("📤 Payload hidráulico:", payload);
    try {
      setIsSubmitting(true);
      const data = await request(apiUrls.cotizacion.cotizarHidraulico, {
        method: "POST",
        body: payload,
      });
      // almacenar respuesta y parámetros utilizados
      setCotizacion(data);
      setUltimoFormulario({
        puntos,
        ejesSecundarios,
        ancho,
        largo,
        payload,
      });
      alert("Cotización hidráulica recibida ✅");
    } catch (error) {
      console.error("❌ Error al cotizar hidráulico:", error);
      const message = error?.message || "Ocurrió un problema al enviar la cotización. Intenta nuevamente.";
      alert(`❌ Error:\n\n${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* Generar y descargar PDF con react-pdf */
  const descargarPDF = async () => {
    if (!cotizacion) {
      alert("No hay cotización disponible para descargar");
      return;
    }
    if (!ultimoFormulario) {
      alert("No se encontraron los parámetros utilizados para la cotización.");
      return;
    }
    try {
      const blob = await pdf(<CotizacionHidraulicaPDF cotizacion={cotizacion} params={ultimoFormulario} />).toBlob();
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = `cotizacion-hidraulica-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(enlace);
      enlace.click();
      document.body.removeChild(enlace);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("❌ Error al generar PDF:", error);
      alert("No se pudo generar el PDF de la cotización.");
    }
  };

  /* Reiniciar formulario / diseño */
  const resetFormulario = () => {
    setPuntos([]);
    setEjesSecundarios([]);
    setPlacingPoint(null);
    setSelectedPointId(null);
    setCotizacion(null);
    setUltimoFormulario(null);
  };

  /* Seleccionado actual */
  const selectedPoint = puntos.find((p) => p.id === selectedPointId) || null;

  /* Si ya llegó una cotización, mostrar la vista de resultados (igual que Cimientos) */
  if (cotizacion) {
    return (
      <div className="hidraulica-modal hidraulica-modal--results">
        <div className="hidraulica-card hidraulica-card--results">
          <header className="hidraulica-modal__header">
            <div>
              <p className="hidraulica-modal__eyebrow">Resumen de cotización</p>
              <h1>Cotización Hidráulica</h1>
              <p className="hidraulica-modal__hint">Descarga el detalle o reinicia con nuevos parámetros cuando lo necesites.</p>
            </div>
          </header>

          <div className="hidraulica-results">
            <pre className="hidraulica-results__log">{cotizacion.mano_obra}</pre>

            <div className="hidraulica-results__summary">
              <p>
                <span>Valor total mano de obra</span>
                <strong>${cotizacion.valor_total_mano_obra ?? "-"}</strong>
              </p>
              <p>
                <span>Valor total materiales</span>
                <strong>${cotizacion.Valor_total_Materiales ?? "-"}</strong>
              </p>
              <p>
                <span>Obra a todo costo</span>
                <strong>${cotizacion.Valor_total_obra_a_todo_costo ?? "-"}</strong>
              </p>
            </div>
          </div>

          <div className="hidraulica-actions">
            <button onClick={descargarPDF} className="hidraulica-button hidraulica-button--secondary" type="button">
              Descargar PDF
            </button>
            <button onClick={resetFormulario} className="hidraulica-button" type="button">
              Nueva cotización
            </button>
            <button onClick={onClose} className="hidraulica-button hidraulica-button--ghost" type="button">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* Render principal (dibujo + controles) */
  return (
    <div className="hidraulica-modal">
      <header className="hidraulica-header">
        <button className="btn-ghost" onClick={onVolver}>Volver</button>
        <h1>Cotización Hidráulica</h1>
        <div className="header-actions">
          <button className="btn" onClick={enviarCotizacion} disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Enviar cotización"}
          </button>
          <button className="btn-ghost" onClick={onClose}>Cerrar</button>
        </div>
      </header>

      <section className="hidraulica-stage-area">
        <Stage
          width={baseStageWidth}
          height={baseStageHeight}
          onWheel={handleWheel}
          ref={stageRef}
          onMouseMove={handleMouseMove}
          onClick={handleStageClick}
          style={{
            background: "#05060a",
            borderRadius: 8,
            cursor: placingPoint ? "crosshair" : "grab",
            userSelect: "none",
          }}
          draggable={!placingPoint}
          onDragStart={(e) => e.target.getStage().container().style.cursor = "grabbing"}
          onDragEnd={(e) => e.target.getStage().container().style.cursor = "grab"}
        >
          <Layer>
            <Rect x={0} y={0} width={baseStageWidth} height={baseStageHeight} fill="#05060a" />

            {/* Ejes principales */}
            {ejesPrincipales.map((e, i) => (
              <Line key={`p-${i}`} points={[e.x1, e.y1, e.x2, e.y2]} stroke="#1976d2" strokeWidth={4} />
            ))}

            {/* Ejes secundarios */}
            {ejesSecundarios.map((e, i) => {
              const vertical = e.orientacion === "V";
              const x = vertical ? margen + e.distancia * escalaBase : margen;
              const y = vertical ? margen : margen + e.distancia * escalaBase;
              const x2 = vertical ? x : margen + ancho * escalaBase;
              const y2 = vertical ? margen + largo * escalaBase : y;
              return <Line key={`s-${i}`} points={[x, y, x2, y2]} stroke="#43a047" strokeWidth={2} dash={[8, 8]} />;
            })}

            {/* Imagen guía opcional (no incluida por defecto) */}

            {/* Icono flotante mientras se coloca */}
            {placingPoint && (
              imagesMap[placingPoint.tipo] ? (
                <KonvaImage
                  image={imagesMap[placingPoint.tipo]}
                  x={placingPoint.x}
                  y={placingPoint.y}
                  width={getSizePx(placingPoint.tipo)[0]}
                  height={getSizePx(placingPoint.tipo)[1]}
                  rotation={placingPoint.rotation || 0}
                  offsetX={getSizePx(placingPoint.tipo)[0] / 2}
                  offsetY={getSizePx(placingPoint.tipo)[1] / 2}
                  opacity={0.8}
                  listening={false}
                />
              ) : (
                <Group x={placingPoint.x} y={placingPoint.y} offsetX={40} offsetY={14}>
                  <Rect width={80} height={28} fill="#666" cornerRadius={6} opacity={0.9} />
                  <Text text={`Cargando ${placingPoint.tipo}`} fontSize={12} fill="#fff" padding={6} />
                </Group>
              )
            )}

            {/* Puntos colocados */}
            {puntos.map((p) => (
              <Group
                key={p.id}
                id={`point-${p.id}`}
                x={p.x}
                y={p.y}
                rotation={p.rotation || 0}
                draggable
                onDragMove={(e) => moverPunto(p.id, e.target.x(), e.target.y())}
                onClick={(e) => {
                  e.cancelBubble = true;
                  seleccionarPunto(p.id);
                }}
              >
                {imagesMap[p.tipo] ? (
                  <KonvaImage
                    image={imagesMap[p.tipo]}
                    width={getSizePx(p.tipo)[0]}
                    height={getSizePx(p.tipo)[1]}
                    offsetX={getSizePx(p.tipo)[0] / 2}
                    offsetY={getSizePx(p.tipo)[1] / 2}
                  />
                ) : (
                  <Group offsetX={40} offsetY={14}>
                    <Rect width={80} height={28} fill="#444" cornerRadius={6} />
                    <Text text={p.tipo} fontSize={12} fill="#fff" padding={6} />
                  </Group>
                )}
              </Group>
            ))}

            {/* Botón on-canvas para rotar sobre el punto seleccionado */}
            {selectedPoint && (
              <Group
                x={selectedPoint.x}
                y={selectedPoint.y - (getSizePx(selectedPoint.tipo)[1] / 2) - 24}
                onClick={(e) => {
                  e.cancelBubble = true;
                  rotarPunto(selectedPoint.id);
                }}
                onMouseEnter={(e) => {
                  e.target.getStage().container().style.cursor = "pointer";
                }}
                onMouseLeave={(e) => {
                  e.target.getStage().container().style.cursor = placingPoint ? "crosshair" : "grab";
                }}
                listening={true}
              >
                <Circle radius={14} fill="#1976d2" stroke="#fff" strokeWidth={1.4} shadowColor="#000" shadowBlur={6} />
                <Text text="⤾" fontSize={14} fill="#fff" offsetX={6} offsetY={7} />
              </Group>
            )}

            <Transformer
              ref={trRef}
              rotateEnabled={false}
              enabledAnchors={[]}
              boundBoxFunc={(oldBox, newBox) => oldBox}
            />
          </Layer>
        </Stage>
      </section>

      <section className="hidraulica-controls">
        <div className="dimensiones">
          <label>
            Ancho (cm)
            <input type="number" min={50} max={5000} value={ancho} onChange={(e) => setAncho(Number(e.target.value))} />
          </label>
          <label>
            Largo (cm)
            <input type="number" min={50} max={5000} value={largo} onChange={(e) => setLargo(Number(e.target.value))} />
          </label>
        </div>
        
        {/* Controles de opciones adicionales */}
        <div className="opciones-adicionales">
          <label>
            <input 
              type="checkbox" 
              checked={tienePiso} 
              onChange={(e) => setTienePiso(e.target.checked)} 
            />
            Incluir piso
          </label>
          <label>
            <input 
              type="checkbox" 
              checked={tieneResane} 
              onChange={(e) => setTieneResane(e.target.checked)} 
            />
            Incluir resane
          </label>
        </div>

        <div className="zoom-controls">
          <button className="btn" onClick={zoomIn}>+</button>
          <button className="btn" onClick={zoomOut}>-</button>
          <span>Zoom: {zoomPct}%</span>
        </div>

        <div className="tipo-botones">
          {Object.keys(ICONS_PATHS).map((tipo) => (
            <button
              key={tipo}
              className={`tipo-btn ${placingPoint?.tipo === tipo ? "selected" : ""}`}
              onClick={() => {
                if (!imagesMap[tipo]) {
                  console.log(`Imagen "${tipo}" aun no lista; se mostrará placeholder hasta que cargue.`);
                }
                setPlacingPoint({ tipo, x: baseStageWidth / 2, y: baseStageHeight / 2, rotation: 0 });
                setSelectedPointId(null);
              }}
              title={tipo}
              type="button"
            >
              <img src={ICONS_PATHS[tipo]} alt={tipo} className="icono-img" />
              <span className="tipo-label">{tipo}</span>
            </button>
          ))}
        </div>

        {/* Controles de colocación */}
        {placingPoint && (
          <div className="placing-controls">
            <p>Colocando: {placingPoint.tipo}</p>
            <button className="btn" type="button" onClick={() => {
              const opciones = ROTATION_OPTIONS[placingPoint.tipo] || [0];
              const actualIndex = opciones.indexOf(placingPoint.rotation || 0);
              const siguienteIndex = (actualIndex + 1) % opciones.length;
              setPlacingPoint({ ...placingPoint, rotation: opciones[siguienteIndex] });
            }}>Rotar</button>
            <button className="btn" type="button" onClick={() => {
              if (placingPoint.x < margen || placingPoint.x > margen + ancho * escalaBase || placingPoint.y < margen || placingPoint.y > margen + largo * escalaBase) {
                alert("El punto debe quedar dentro del área de dibujo");
                return;
              }
              setPuntos((prev) => [...prev, { ...placingPoint, id: Date.now() }]);
              setPlacingPoint(null);
            }}>Aceptar</button>
            <button className="btn-ghost" type="button" onClick={() => setPlacingPoint(null)}>Cancelar</button>
          </div>
        )}

        <div className="ejes-controls">
          <label>
            Orientación
            <select value={nuevoEjeOrientacion} onChange={(e) => setNuevoEjeOrientacion(e.target.value)}>
              <option value="V">Vertical</option>
              <option value="H">Horizontal</option>
            </select>
          </label>
          <label>
            Distancia (cm)
            <input type="number" step="0.1" value={nuevoEjeDistancia} onChange={(e) => setNuevoEjeDistancia(e.target.value)} />
          </label>
          <button className="btn" onClick={agregarEje} type="button">Agregar eje</button>
          <button className="btn-ghost" onClick={() => setEjesSecundarios([])} type="button">Limpiar ejes</button>
        </div>

        <div className="lista-ejes">
          <h4>Ejes secundarios</h4>
          {ejesSecundarios.length === 0 ? (
            <p>No hay ejes agregados</p>
          ) : (
            <ul>
              {ejesSecundarios.map((e, i) => (
                <li key={i}>
                  {e.orientacion === "V" ? "Vertical" : "Horizontal"} — {e.distancia} cm
                  <button className="btn-small btn-ghost" type="button" onClick={() => eliminarEje(i)}>Quitar</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Panel de edición siempre visible en controles */}
        <div className="puntos-rotacion" style={{ marginTop: 8 }}>
          {selectedPointId ? (
            <>
              <div style={{ minWidth: 160 }}>
                <strong>Editar:</strong> {selectedPoint?.tipo} (id {selectedPointId})
              </div>
              <button className="btn" onClick={() => rotarPunto(selectedPointId)} type="button">Rotar</button>
              <button className="btn-ghost" onClick={() => setSelectedPointId(null)} type="button">Cerrar edición</button>
            </>
          ) : (
            <div>No hay punto seleccionado</div>
          )}
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button className="btn" onClick={resetFormulario} type="button">Limpiar diseño</button>
          <button className="btn-ghost" onClick={onVolver} type="button">Volver</button>
        </div>
      </section>
    </div>
  );
}