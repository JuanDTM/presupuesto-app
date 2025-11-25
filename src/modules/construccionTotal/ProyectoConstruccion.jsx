import LienzoEjesNodos from "./LienzoEjesNodos";
import PanelMuros from "../../components/PanelMuros";
import React, { useReducer, useEffect, useCallback, useRef, useState } from "react";
import {
  generarNodosDesdeEjes,
  validarNodosDentroArea,
} from "../../utils/ejesNodos";

const EPS = 1.0; // 1 px tolerancia

// ICONS_PATHS definido aquí
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

function findNeighborRight(nodos, nodo) {
  const candidates = nodos.filter(n => Math.abs(n.y - nodo.y) <= EPS && n.x > nodo.x);
  if (candidates.length === 0) return null;
  return candidates.reduce((best, cur) => (cur.x < best.x ? cur : best));
}

function findNeighborBelow(nodos, nodo) {
  const candidates = nodos.filter(n => Math.abs(n.x - nodo.x) <= EPS && n.y > nodo.y);
  if (candidates.length === 0) return null;
  return candidates.reduce((best, cur) => (cur.y < best.y ? cur : best));
}

function generarMurosPorDefecto(nodos) {
  const muros = [];
  const seen = new Set();
  nodos.forEach((n) => {
    const right = findNeighborRight(nodos, n);
    if (right) {
      const key = [n.id, right.id].sort().join('_');
      if (!seen.has(key)) {
        seen.add(key);
        muros.push({
          id: `muro_${key}`,
          nodoA: n.id,
          nodoB: right.id,
          thickness: 15,
          tipo: 'sin muro',
        });
      }
    }
    const below = findNeighborBelow(nodos, n);
    if (below) {
      const key = [n.id, below.id].sort().join('_');
      if (!seen.has(key)) {
        seen.add(key);
        muros.push({
          id: `muro_${key}`,
          nodoA: n.id,
          nodoB: below.id,
          thickness: 15,
          tipo: 'sin muro',
        });
      }
    }
  });
  return muros;
}

/**
 * generarAreasPorDefecto: busca celdas rectangulares definidas por 4 nodos:
 * top-left (tl), top-right (tr), bottom-right (br), bottom-left (bl)
 *
 * nodos: array con coordenadas en px (tal como lo tienes en estado)
 * escalaPxPorCm: número de px que representan 1 cm (ej. escala = 3 px/cm o lo que uses)
 *
 * Devuelve: [{ id, nodos: [tl, tr, br, bl], ancho_cm, alto_cm, area_cm2 }]
 */
function generarAreasPorDefecto(nodos, escalaPxPorCm = 1) {
  const areas = [];
  const seen = new Set();

  nodos.forEach(tl => {
    // encontrar TR y BL y BR correspondiente
    const tr = findNeighborRight(nodos, tl);
    const bl = findNeighborBelow(nodos, tl);
    if (!tr || !bl) return;
    // buscar diagonal: nodo con x ~= tr.x y y ~= bl.y
    const br = nodos.find(n => Math.abs(n.x - tr.x) <= EPS && Math.abs(n.y - bl.y) <= EPS);
    if (!br) return;

    // crear id estable (ordena ids para evitar duplicados por recorrido)
    const areaId = `area_${tl.id}_${tr.id}_${br.id}_${bl.id}`;
    if (seen.has(areaId)) return;
    seen.add(areaId);

    // calcular dimensiones en cm (convertir px -> cm)
    const ancho_px = Math.abs(tr.x - tl.x);
    const alto_px = Math.abs(bl.y - tl.y);

    const ancho_cm = Math.round((ancho_px / escalaPxPorCm) * 100) / 100;
    const alto_cm = Math.round((alto_px / escalaPxPorCm) * 100) / 100;
    const area_cm2 = Math.round((ancho_cm * alto_cm) * 100) / 100;

    areas.push({
      id: areaId,
      nodos: [tl.id, tr.id, br.id, bl.id],
      ancho_cm,
      alto_cm,
      area_cm2,
    });
  });

  return areas;
}

/**
 * ProyectoConstruccion
 * - Componente padre que controla fases (ejes | muros | hidraulica | cubierta)
 * - Mantiene estado centralizado del proyecto (ejes secundarios, nodos, muros, etc.)
 * - Integra LienzoEjesNodos (presentacional) y provee callbacks/handlers
 *
 * NOTE:
 * - ejesSecundarios.coord => almacenado en centímetros (cm)
 * - nodos.x, nodos.y => almacenados en PÍXELES y ya incluyen el `margen` (coordenada usable por LienzoEjesNodos)
 *   Esto hace que Lienzo calcule la posición final con: displayedX = nodo.x + offsetX
 * - El motivo: simplificar la conversión y mantener consistencia con Lienzo actual.
 */

// Estado inicial (puedes ajustar valores por defecto)
const initialState = {
  fase: "ejes",
  ejesPrincipales: [], // si los necesitas explícitos
  ejesSecundarios: [], // { id, orientacion: 'H'|'V', coord (cm) }
  nodos: [], // { id, x (px, incluye margen), y (px, incluye margen), ancho, alto, nivel, orientacion }
  muros: [],
  areas: [],
  totalNodos: 0,
  hidraulica: [], // [{ id, tipo, x (px), y (px), rotation }]
  niveles: [],
  orientacionesNodos: {},
  // Parámetros de área
  ancho: 200, // cm
  largo: 100, // cm
  nivel: "1 de 1",
  escala: 3, // px por cm (ejemplo) — ajusta a tu escala real
  margen: 40, // px
  // Estado del stage (transform)
  stageScale: 1,
  stageX: 0,
  stageY: 0,
  // Panning control
  isPanning: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_FASE":
      return { ...state, fase: action.payload };
    case "SET_EJES_SECUNDARIOS":
      return { ...state, ejesSecundarios: action.payload };
    case "SET_NODOS":
      return { ...state, nodos: action.payload };
    case "SET_MUROS":
      return { ...state, muros: action.payload };
    case "SET_AREAS":
      return { ...state, areas: action.payload };
    case "SET_HIDRAULICA":
      return { ...state, hidraulica: action.payload };
    case "SET_NIVEL":
      return { ...state, nivel: action.payload };
    case "SET_TOTAL_NODOS":
      return { ...state, totalNodos: action.payload };
    case "SET_ORIENTACIONES_NODOS":
      return { ...state, orientacionesNodos: action.payload };
    case "SET_STAGE_TRANSFORM":
      return {
        ...state,
        stageScale: action.payload.stageScale,
        stageX: action.payload.stageX,
        stageY: action.payload.stageY,
      };
    case "SET_IS_PANNING":
      return { ...state, isPanning: action.payload };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

export default function ProyectoConstruccion(props) {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    // permite sobrescribir por props si quieres
    ...(props.initialState || {}),
  });
  
  // Estado para selección / colocación de elementos hidráulicos
  const [selectedHidraulicaId, setSelectedHidraulicaId] = useState(null);
  const [placingHidraulicaType, setPlacingHidraulicaType] = useState(null);

  // Punto seleccionado (para mostrar controles externos si los necesitas)
  const selectedHidraulicaPoint = state.hidraulica.find((p) => p.id === selectedHidraulicaId) || null;
  
  // ref para el handler de mouseUp global (para detener panning)
  const mouseUpListenerRef = useRef(null);

  // Opciones de rotación (puedes extraer a un archivo común si quieres)
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

  // ---------------------------
  // UTIL: regenerar nodos y guardarlos en estado
  // ---------------------------
  const regenerarNodos = useCallback(
    (ejesSecundarios) => {
      // Genera nodos usando la util que definimos en utils/ejesNodos.js
      // GenerarNodos recibe: ejesSecundarios, nivel, niveles, orientacionesNodos, escala, margen, ancho, largo
      const nodosGenerados = generarNodosDesdeEjes(
        ejesSecundarios,
        state.nivel,
        state.niveles,
        state.orientacionesNodos,
        state.escala,
        state.margen,
        state.ancho,
        state.largo,
        state.altura
      );

      // Validación (opcional)
      const validacion = validarNodosDentroArea(
        nodosGenerados,
        state.margen,
        state.ancho,
        state.largo,
        state.escala
      );

      if (!validacion.todosValidos) {
        console.warn("Algunos nodos están fuera del área:", validacion.invalidos);
        // Puedes lanzar notificación al usuario aquí si deseas
      }

      dispatch({ type: "SET_NODOS", payload: nodosGenerados });
      return nodosGenerados;
    },
    [
      state.nivel,
      state.niveles,
      state.orientacionesNodos,
      state.escala,
      state.margen,
      state.ancho,
      state.largo,
    ]
  );

  // Agregar nuevo punto hidráulico (llamar desde Lienzo o toolbar)
  const handleAddHidraulicaPoint = (point) => {
    dispatch({ type: "SET_HIDRAULICA", payload: [...state.hidraulica, point] });
  };

  // Mover punto hidráulico (drag)
  const handleHidraulicaMove = (id, x, y) => {
    const updated = state.hidraulica.map((p) => (p.id === id ? { ...p, x, y } : p));
    dispatch({ type: "SET_HIDRAULICA", payload: updated });
  };

  // Seleccionar punto hidráulico
  const handleSelectHidraulica = (id) => {
    setSelectedHidraulicaId(id);
  };

  // Rotar punto hidráulico (cicla según ROTATION_OPTIONS)
  const handleRotateHidraulica = (id) => {
    const updated = state.hidraulica.map((p) => {
      if (p.id !== id) return p;
      const opciones = ROTATION_OPTIONS[p.tipo] || [0];
      const actualIndex = opciones.indexOf(p.rotation || 0);
      const siguienteIndex = (actualIndex + 1) % opciones.length;
      return { ...p, rotation: opciones[siguienteIndex] };
    });
    dispatch({ type: "SET_HIDRAULICA", payload: updated });
  };

  // Eliminar punto hidráulico
  const handleDeleteHidraulica = (id) => {
    if (!window.confirm("¿Eliminar elemento hidráulico?")) return;
    const updated = state.hidraulica.filter((p) => p.id !== id);
    dispatch({ type: "SET_HIDRAULICA", payload: updated });
    setSelectedHidraulicaId(null);
  };

  // ---------------------------
  // Handlers: zoom con rueda (centrado en puntero)
  // ---------------------------
  const handleWheel = (e) => {
    // e es el evento que viene desde react-konva (con e.evt)   
    e.evt.preventDefault();
    const stage = e.target.getStage();
    if (!stage) return;

    const oldScale = state.stageScale;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    // Punto del mouse relativo al stage en coordenadas sin escala
    const mousePointTo = {
      x: (pointer.x - state.stageX) / oldScale,
      y: (pointer.y - state.stageY) / oldScale,
    };

    const scaleBy = 1.08;
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

    // Limitar escala mínima y máxima
    const minScale = 0.2;
    const maxScale = 5;
    const boundedScale = Math.max(minScale, Math.min(maxScale, newScale));

    const newStageX = pointer.x - mousePointTo.x * boundedScale;
    const newStageY = pointer.y - mousePointTo.y * boundedScale;

    dispatch({
      type: "SET_STAGE_TRANSFORM",
      payload: { stageScale: boundedScale, stageX: newStageX, stageY: newStageY },
    });
  };

  // ---------------------------
  // Handlers: panning (clic + arrastre en stage)
  // ---------------------------
  // El Lienzo invoca handleMouseDown cuando hay mousedown en el Stage.
  // Si el usuario hace clic en un área vacía del Stage iniciamos panning.
  const handleStageMouseDown = (e) => {
    const stage = e.target.getStage();
    if (!stage) return;

    // Determinar si el clic es sobre el fondo / stage (no sobre una forma)
    const clickedOnEmpty = e.target === stage || e.target.getClassName() === "Layer";
    if (clickedOnEmpty) {
      // Activar panning
      dispatch({ type: "SET_IS_PANNING", payload: true });

      // Registrar listener global mouseup para detener panning
      const onMouseUp = () => {
        dispatch({ type: "SET_IS_PANNING", payload: false });
        window.removeEventListener("mouseup", onMouseUp);
        mouseUpListenerRef.current = null;
      };
      mouseUpListenerRef.current = onMouseUp;
      window.addEventListener("mouseup", onMouseUp);
    }
  };

  // ---------------------------
  // Handler: actualizar transform del stage (cuando el stage cambia por drag)
  // ---------------------------
  const handleStageTransform = ({ stageScale, x, y }) => {
    dispatch({ type: "SET_STAGE_TRANSFORM", payload: { stageScale, stageX: x, stageY: y } });
  };

  // ---------------------------
  // Callback: mover nodo (drag)
  // - Lienzo envía coordenadas en píxeles SIN offset (es decir: nodo.x tal cual como lo usamos en estado)
  // ---------------------------
  const handleNodeMove = (nodeId, newX_px, newY_px) => {
    // actualizamos nodos en estado
    const nodosActualizados = (state.nodos || []).map((n) =>
      n.id === nodeId ? { ...n, x: newX_px, y: newY_px } : n
    );
    dispatch({ type: "SET_NODOS", payload: nodosActualizados });
  };

  // ---------------------------
  // Callback: agregar eje secundario (coord en cm)
  // ---------------------------
  const handleAddSecondaryAxis = (axis) => {
    // axis: { id, orientacion: 'V'|'H', coord (cm), ... }
    // validar límites: coord debe estar dentro de [0, ancho] o [0, largo] según orientación
    const coordCm = Number(axis.coord);
    if (Number.isNaN(coordCm)) return;

    if (axis.orientacion === "V") {
      if (coordCm < 0 || coordCm > state.ancho) {
        console.warn("Eje vertical fuera del rango de ancho:", coordCm);
        return;
      }
    } else {
      if (coordCm < 0 || coordCm > state.largo) {
        console.warn("Eje horizontal fuera del rango de largo:", coordCm);
        return;
      }
    }

    const nuevosEjes = [...state.ejesSecundarios, { ...axis, coord: coordCm }];
    dispatch({ type: "SET_EJES_SECUNDARIOS", payload: nuevosEjes });

    // regenerar nodos con los nuevos ejes
    regenerarNodos(nuevosEjes);
  };

  // ---------------------------
  // Callback: eliminar eje secundario
  // ---------------------------
  const handleDeleteSecondaryAxis = (axisId) => {
    const nuevosEjes = (state.ejesSecundarios || []).filter((e) => e.id !== axisId);
    dispatch({ type: "SET_EJES_SECUNDARIOS", payload: nuevosEjes });
    regenerarNodos(nuevosEjes);
  };

  // ---------------------------
  // Navegación entre fases
  // ---------------------------
  const avanzarFase = () => {
    if (state.fase === "ejes") {
      // Generar nodos si no están
      const nodosGenerados = state.nodos && state.nodos.length ? state.nodos : regenerarNodos(state.ejesSecundarios);
      dispatch({ type: "SET_NODOS", payload: nodosGenerados });
  
      // Total nodos
      dispatch({ type: "SET_TOTAL_NODOS", payload: nodosGenerados.length });
      
      // Generar muros por defecto a partir de los nodos
      const murosPorDefecto = generarMurosPorDefecto(nodosGenerados);
      dispatch({ type: "SET_MUROS", payload: murosPorDefecto });
      
      // Generar áreas por defecto
      const areasPorDefecto = generarAreasPorDefecto(nodosGenerados, state.escala || 1);
      dispatch({ type: "SET_AREAS", payload: areasPorDefecto });  
  
      dispatch({ type: "SET_FASE", payload: "muros" });
    } else if (state.fase === "muros") {
      dispatch({ type: "SET_FASE", payload: "hidraulica" });
    } else if (state.fase === "hidraulica") {
      dispatch({ type: "SET_FASE", payload: "cubierta" });
    }
  };

  const retrocederFase = () => {
    if (state.fase === "muros") dispatch({ type: "SET_FASE", payload: "ejes" });
    else if (state.fase === "hidraulica") dispatch({ type: "SET_FASE", payload: "muros" });
    else if (state.fase === "cubierta") dispatch({ type: "SET_FASE", payload: "hidraulica" });
  };

  // ---------------------------
  // Efecto: limpiar listener en unmount
  // ---------------------------
  useEffect(() => {
    return () => {
      if (mouseUpListenerRef.current) {
        window.removeEventListener("mouseup", mouseUpListenerRef.current);
        mouseUpListenerRef.current = null;
      }
    };
  }, []);

  // ---------------------------
  // Render
  // ---------------------------
  return (
    <div style={{ padding: 12 }}>
      <h2>Proyecto de Construcción</h2>

      {/* Barra de fases */}
      <div style={{ marginBottom: 10 }}>
        <button onClick={() => dispatch({ type: "SET_FASE", payload: "ejes" })} disabled={state.fase === "ejes"}>
          Ejes
        </button>
        <button onClick={() => dispatch({ type: "SET_FASE", payload: "muros" })} disabled={state.fase === "muros"}>
          Muros
        </button>
        <button
          onClick={() => dispatch({ type: "SET_FASE", payload: "hidraulica" })}
          disabled={state.fase === "hidraulica"}
        >
          Hidráulica
        </button>
        <button onClick={() => dispatch({ type: "SET_FASE", payload: "cubierta" })} disabled={state.fase === "cubierta"}>
          Cubierta
        </button>
      </div>

      {/* Lienzo (SOLO UNA VEZ) */}
      <div style={{ border: "1px solid #ccc", height: 600 }}>
        <LienzoEjesNodos
          ancho={state.ancho}
          largo={state.largo}
          nivel={state.nivel}
          niveles={state.niveles}
          ejesSecundarios={state.ejesSecundarios}
          orientacionesNodos={state.orientacionesNodos}
          escala={state.escala}
          margen={state.margen}
          canvasWidth={800}
          canvasHeight={500}
          stageScale={state.stageScale}
          stageX={state.stageX}
          stageY={state.stageY}
          handleWheel={handleWheel}
          handleMouseDown={handleStageMouseDown}
          spacePressed={false}
          isPanning={state.isPanning}
          nodos={state.nodos}
          cotas={[]}
          muros={state.muros}
          hidraulicaPoints={state.hidraulica}
          editable={state.fase === "ejes"}
          onUpdateEjes={(ejes) => {
            dispatch({ type: "SET_EJES_SECUNDARIOS", payload: ejes });
          }}
          onNodeMove={handleNodeMove}
          onAddSecondaryAxis={handleAddSecondaryAxis}
          onDeleteSecondaryAxis={handleDeleteSecondaryAxis}
          onAddMuro={(muro) => {
            dispatch({ type: "SET_MUROS", payload: [...state.muros, muro] });
          }}
          onSelect={(item) => {
            console.log("Seleccionado:", item);
          }}
          onStageTransform={({ scale, x, y }) => {
            handleStageTransform({ stageScale: scale, x, y });
          }}
          // Props para hidráulica
          onAddHidraulicaPoint={handleAddHidraulicaPoint}
          onHidraulicaMove={handleHidraulicaMove}
          onSelectHidraulica={handleSelectHidraulica}
          onRotateHidraulica={handleRotateHidraulica}
          onDeleteHidraulica={handleDeleteHidraulica}
          selectedHidraulicaId={selectedHidraulicaId}
          selectedHidraulicaPoint={selectedHidraulicaPoint}
          placingHidraulicaType={placingHidraulicaType}
          setPlacingHidraulicaType={setPlacingHidraulicaType}
        />
      </div>
      
      {/* Panel de muros */}
      {state.fase === "muros" && (
        <PanelMuros
          nodos={state.nodos}
          muros={state.muros}
          setMuros={(murosActualizados) => dispatch({ type: "SET_MUROS", payload: murosActualizados })}
          escala={state.escala}
          orientacionesNodos={state.orientacionesNodos}
          nivel={state.nivel}
          niveles={state.niveles}
          margen={state.margen}
          ancho={state.ancho}
          largo={state.largo}
          ejesV={state.ejesSecundarios.filter(e => e.orientacion === "V")}
          ejesH={state.ejesSecundarios.filter(e => e.orientacion === "H")}
          altura={state.altura}
        />
      )}

      {/* Toolbar de iconos hidráulicos */}
      {state.fase === "hidraulica" && (
        <div style={{ marginTop: 12 }}>
          <h3>Iconos Hidráulicos</h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {Object.keys(ICONS_PATHS).map((tipo) => (
              <button
                key={tipo}
                onClick={() => {
                  setPlacingHidraulicaType(tipo);
                }}
                style={{
                  padding: 8,
                  border: placingHidraulicaType === tipo ? "2px solid blue" : "1px solid gray",
                }}
              >
                <img src={ICONS_PATHS[tipo]} alt={tipo} width="30" />
                <br />
                <small>{tipo}</small>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Controles de fase */}
      <div style={{ marginTop: 12 }}>
        {state.fase === "ejes" && (
          <button onClick={avanzarFase} style={{ marginRight: 8 }}>
            Guardar Ejes y Continuar →
          </button>
        )}
        {state.fase !== "ejes" && (
          <button onClick={retrocederFase} style={{ marginRight: 8 }}>
            ← Volver
          </button>
        )}
      </div>

      {/* Información de estado */}
      <div style={{ marginTop: 12, padding: 8, background: "#fafafa", borderRadius: 4 }}>
        <div>
          <strong>Fase:</strong> {state.fase}
        </div>
        <div>
          <strong>Dimensiones:</strong> {state.ancho} cm x {state.largo} cm
        </div>
        <div>
          <strong>Ejes secundarios:</strong> {state.ejesSecundarios.length}
        </div>
        <div>
          <strong>Nodos:</strong> {state.nodos.length}
        </div>
        <div>
          <strong>Stage:</strong> scale={state.stageScale.toFixed(2)}, x={Math.round(state.stageX)}, y={Math.round(state.stageY)}
        </div>
      </div>
    </div> 
  );
} 