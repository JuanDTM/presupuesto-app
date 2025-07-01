// ComponenteEjesNodos.js
import React, { useRef, useEffect, useState } from "react";
import LienzoEjesNodos from "./LienzoEjesNodos";
import PanelCotas from "./PanelCotas";

const niveles = [
  { value: "1 de 1", ancho: 12, alto: 20 },
  { value: "1 de 2", ancho: 20, alto: 20 },
  { value: "2 de 2", ancho: 20, alto: 20 },
  { value: "1 de 3", ancho: 30, alto: 30 },
  { value: "2 de 3", ancho: 30, alto: 30 },
  { value: "3 de 3", ancho: 20, alto: 20 },
];

export default function ComponenteEjesNodos() {
  // Estados principales
  const [ancho, setAncho] = useState(200); // en cm
  const [alto, setAlto] = useState(150);   // en cm
  const [nivel, setNivel] = useState(niveles[0].value);
  const [ejesSecundarios, setEjesSecundarios] = useState([]);
  const [orientacionesNodos, setOrientacionesNodos] = useState({});
  const [cotas, setCotas] = useState([]);

  // Zoom y pan
  const [stageScale, setStageScale] = useState(1);
  const [stageX, setStageX] = useState(0);
  const [stageY, setStageY] = useState(0);

  // Pan con mouse y barra espaciadora
  const [isPanning, setIsPanning] = useState(false);
  const [spacePressed, setSpacePressed] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const stageStart = useRef({ x: 0, y: 0 });

  // --- VARIABLES DE DIBUJO Y MÁRGENES (ORDEN CORRECTO) ---
  const escala = 2;
  const margen = 50;
  const canvasWidth = margen + ancho * escala + margen;
  const canvasHeight = margen + alto * escala + margen;
  const extraMargin = Math.max(500, Math.max(canvasWidth, canvasHeight) * 0.5);
  const stageWidth = canvasWidth + extraMargin * 2;
  const stageHeight = canvasHeight + extraMargin * 2;
  const offsetX = extraMargin;
  const offsetY = extraMargin;

  // Ejes principales y secundarios
  const eje0 = { x1: margen, y1: margen, x2: margen + ancho * escala, y2: margen };
  const eje1 = { x1: margen + ancho * escala, y1: margen, x2: margen + ancho * escala, y2: margen + alto * escala };
  const eje2 = { x1: margen + ancho * escala, y1: margen + alto * escala, x2: margen, y2: margen + alto * escala };
  const eje3 = { x1: margen, y1: margen + alto * escala, x2: margen, y2: margen };

  const ejesV = ejesSecundarios.filter(e => e.orientacion === "V");
  const ejesH = ejesSecundarios.filter(e => e.orientacion === "H");

  // Nodos
  let nodos = [
    { x: eje0.x1, y: eje0.y1 },
    { x: eje1.x1, y: eje1.y1 },
    { x: eje2.x1, y: eje2.y1 },
    { x: eje3.x1, y: eje3.y1 },
  ];
 
  // Agregar ejes secundarios
  ejesV.forEach((ev) => {
    const x = eje0.x1 + ev.distancia * escala;
    nodos.push({ x, y: eje0.y1 });
    nodos.push({ x, y: eje2.y1 });
    ejesH.forEach((eh) => {
      const y = eje0.y1 + eh.distancia * escala;
      nodos.push({ x, y });
    });
  });
  ejesH.forEach((eh) => {
    const y = eje0.y1 + eh.distancia * escala;
    nodos.push({ x: eje0.x1, y });
    nodos.push({ x: eje1.x1, y });
  });
  nodos = nodos.filter(
    (n, idx, arr) =>
      arr.findIndex(m => Math.abs(m.x - n.x) < 1 && Math.abs(m.y - n.y) < 1) === idx
  );

  // Handlers para agregar ejes secundarios
  const [orientacion, setOrientacion] = useState("V");
  const [distancia, setDistancia] = useState(0);

  const agregarEje = () => {
    if (
      (orientacion === "V" && distancia > 0 && distancia < ancho) ||
      (orientacion === "H" && distancia > 0 && distancia < alto)
    ) {
      setEjesSecundarios([...ejesSecundarios, { orientacion, distancia }]);
      setDistancia(0);
    }
  };

  const deshacerEje = () => {
    setEjesSecundarios(ejesSecundarios.slice(0, -1));
  };

  // Selector de orientación solo para 1 de 1
  const handleOrientacionNodo = (idx, value) => {
    setOrientacionesNodos({ ...orientacionesNodos, [idx]: value });
  };

  // --- ZOOM CON LA RUEDA DEL MOUSE ---
  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const oldScale = stageScale;
    const pointer = e.target.getStage().getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - stageX) / oldScale,
      y: (pointer.y - stageY) / oldScale,
    };
    let newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    newScale = Math.max(0.05, Math.min(10, newScale));
    // Nuevo stageX y stageY para centrar el zoom en el mouse
    setStageScale(newScale);
    setStageX(pointer.x - mousePointTo.x * newScale);
    setStageY(pointer.y - mousePointTo.y * newScale);
  };

  // Botones de zoom
  const zoomIn = () => {
    const scaleBy = 1.1;
    let newScale = Math.min(stageScale * scaleBy, 10);
    setStageScale(newScale);
    setStageX((900 - stageWidth * newScale) / 2 + offsetX * newScale);
    setStageY((600 - stageHeight * newScale) / 2 + offsetY * newScale);
  };

  const zoomOut = () => {
    const scaleBy = 1.1;
    let newScale = Math.max(stageScale / scaleBy, 0.05);
    setStageScale(newScale);
    setStageX((900 - stageWidth * newScale) / 2 + offsetX * newScale);
    setStageY((600 - stageHeight * newScale) / 2 + offsetY * newScale);
  };

  // Botón de centrar vista
  const centrarVista = () => {
    setStageX((900 - stageWidth * stageScale) / 2 + offsetX * stageScale);
    setStageY((600 - stageHeight * stageScale) / 2 + offsetY * stageScale);
  };

  // --- PAN CON CLIC Y BARRA ESPACIADORA ---
  const handleMouseDown = (e) => {
    if (!spacePressed) return;
    setIsPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY };
    stageStart.current = { x: stageX, y: stageY };
  };

  const handleMouseMove = (e) => {
    if (!isPanning) return;
    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;
    setStageX(stageStart.current.x + dx);
    setStageY(stageStart.current.y + dy);
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Detectar barra espaciadora
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space") setSpacePressed(true);
    };
    const handleKeyUp = (e) => {
      if (e.code === "Space") setSpacePressed(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (isPanning) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isPanning]);

  // Centrar vista al cargar o cambiar tamaño/zoom
  useEffect(() => {
    centrarVista();
    // eslint-disable-next-line
  }, [canvasWidth, canvasHeight, stageScale]);

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        background: "#f5f5f5",
        padding: 24
      }}
    >
      {/* Controles arriba */}
      <div style={{ display: "flex", gap: 24, marginBottom: 16, flexWrap: "wrap" }}>
        <label>
          Ancho (cm):{" "}
          <input
            type="number"
            value={ancho}
            min={100}
            max={1000}
            onChange={e => setAncho(Number(e.target.value))}
            style={{ width: 80 }}
          />
        </label>
        <label>
          Alto (cm):{" "}
          <input
            type="number"
            value={alto}
            min={100}
            max={1000}
            onChange={e => setAlto(Number(e.target.value))}
            style={{ width: 80 }}
          />
        </label>
        <label>
          Nivel:{" "}
          <select value={nivel} onChange={e => { setNivel(e.target.value); setOrientacionesNodos({}); }}>
            {niveles.map(n => (
              <option key={n.value} value={n.value}>
                {n.value}
              </option>
            ))}
          </select>
        </label>
        <label>
          Eje secundario:{" "}
          <select value={orientacion} onChange={e => setOrientacion(e.target.value)}>
            <option value="V">Vertical</option>
            <option value="H">Horizontal</option>
          </select>
        </label>
        <label>
          Distancia (cm):{" "}
          <input
            type="number"
            value={distancia}
            min={1}
            max={orientacion === "V" ? ancho - 1 : alto - 1}
            onChange={e => setDistancia(Number(e.target.value))}
            style={{ width: 80 }}
          />
        </label>
        <button onClick={agregarEje}>Agregar eje</button>
        <button onClick={deshacerEje} disabled={ejesSecundarios.length === 0}>
          Deshacer último eje
        </button>
        <button onClick={zoomIn}>Zoom +</button>
        <button onClick={zoomOut}>Zoom -</button>
        <button onClick={centrarVista}>Centrar vista</button>
        <span style={{ color: "#888" }}>
          <b>Zoom:</b> rueda del mouse &nbsp;|&nbsp; <b>Pan:</b> barra espaciadora + clic
        </span>
      </div>

      {/* Lienzo */}
      <LienzoEjesNodos
        ancho={ancho}
        alto={alto}
        nivel={nivel}
        niveles={niveles}
        ejesSecundarios={ejesSecundarios}
        orientacionesNodos={orientacionesNodos}
        escala={escala}
        margen={margen}
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
        stageScale={stageScale}
        stageX={stageX}
        stageY={stageY}
        handleWheel={handleWheel}
        handleMouseDown={handleMouseDown}
        spacePressed={spacePressed}
        isPanning={isPanning}
        nodos={nodos}
        cotas={cotas}
      />

      {/* Panel de cotas */}
      <PanelCotas
        nodos={nodos}
        cotas={cotas}
        setCotas={setCotas}
        escala={escala}
        orientacionesNodos={orientacionesNodos}
        nivel={nivel}
        niveles={niveles}
        margen={margen}
        ancho={ancho}
        alto={alto}
        ejesV={ejesV}
        ejesH={ejesH}
      />

      {/* Selector de orientación de nodos SOLO para 1 de 1 */}
      {nivel === "1 de 1" && (
        <div style={{ marginBottom: 16 }}>
          <b>Orientación de nodos:</b>
          <ul>
            {nodos.map((n, idx) => (
              <li key={idx}>
                Nodo {idx + 1}:{" "}
                <select
                  value={orientacionesNodos[idx] || "horizontal"}
                  onChange={e => handleOrientacionNodo(idx, e.target.value)}
                >
                  <option value="horizontal">Horizontal (20x12)</option>
                  <option value="vertical">Vertical (12x20)</option>
                </select>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Lista de ejes secundarios */}
      <div style={{ width: 900, marginBottom: 16 }}>
        <b>Ejes secundarios:</b>
        <ul>
          {ejesSecundarios.map((e, i) => (
            <li key={i}>
              {e.orientacion === "V" ? "Vertical" : "Horizontal"} a {e.distancia} cm
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}