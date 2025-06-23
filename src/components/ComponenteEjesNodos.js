import React, { useRef, useEffect, useState } from "react";
import { Stage, Layer, Line, Rect, Text } from "react-konva";

const niveles = [
  { value: "1 de 1", ancho: 12, alto: 20 },
  { value: "1 de 2", ancho: 20, alto: 20 },
  { value: "2 de 2", ancho: 20, alto: 20 },
  { value: "1 de 3", ancho: 30, alto: 30 },
  { value: "2 de 3", ancho: 30, alto: 30 },
  { value: "3 de 3", ancho: 20, alto: 20 },
];

function Cota({ x1, y1, x2, y2, valor, offset = 30 }) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return null;
  const nx = -dy / len;
  const ny = dx / len;
  const px1 = x1 + nx * offset;
  const py1 = y1 + ny * offset;
  const px2 = x2 + nx * offset;
  const py2 = y2 + ny * offset;
  const mx = (px1 + px2) / 2;
  const my = (py1 + py2) / 2;

  return (
    <>
      <Line points={[px1, py1, px2, py2]} stroke="#e53935" strokeWidth={2} dash={[6, 4]} />
      <Line points={[x1, y1, px1, py1]} stroke="#e53935" strokeWidth={1} />
      <Line points={[x2, y2, px2, py2]} stroke="#e53935" strokeWidth={1} />
      <Text
        x={mx - 30}
        y={my - 12}
        width={60}
        align="center"
        text={valor + " cm"}
        fontSize={16}
        fill="#e53935"
        fontStyle="bold"
      />
    </>
  );
}

export default function ComponenteEjesNodos() {
  // Estados principales
  const [ancho, setAncho] = useState(200); // en cm
  const [alto, setAlto] = useState(150);   // en cm
  const [nivel, setNivel] = useState(niveles[0].value);
  const [ejesSecundarios, setEjesSecundarios] = useState([]);
  const [orientacionesNodos, setOrientacionesNodos] = useState({});

  // Zoom
  const [stageScale, setStageScale] = useState(1);

  // Pan con mouse y barra espaciadora
  const [isPanning, setIsPanning] = useState(false);
  const [spacePressed, setSpacePressed] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const scrollStart = useRef({ left: 0, top: 0 });

  const escala = 2;
  const minWidth = 900;
  const minHeight = 600;
  const margen = 50; // margen alrededor del diseño

  // El canvas se ajusta al tamaño del diseño + margen
  const canvasWidth = margen + ancho * escala + margen;
  const canvasHeight = margen + alto * escala + margen;

  const containerRef = useRef();
  const stageRef = useRef();

  // Centrar el scroll al cargar o cambiar tamaño/zoom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = (canvasWidth * stageScale - minWidth) / 2;
      containerRef.current.scrollTop = (canvasHeight * stageScale - minHeight) / 2;
    }
  }, [canvasWidth, canvasHeight, stageScale]);

  // Ejes principales (ajustados al margen)
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
    let newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    newScale = Math.max(0.05, Math.min(10, newScale)); // Zoom muy amplio
    setStageScale(newScale);
  };

  // Botones de zoom
  const zoomIn = () => {
    const scaleBy = 1.1;
    let newScale = Math.min(stageScale * scaleBy, 10);
    setStageScale(newScale);
  };

  const zoomOut = () => {
    const scaleBy = 1.1;
    let newScale = Math.max(stageScale / scaleBy, 0.05);
    setStageScale(newScale);
  };

  // Resetear zoom y centrar
  const resetZoom = () => {
    setStageScale(1);
    if (containerRef.current) {
      containerRef.current.scrollLeft = (canvasWidth - minWidth) / 2;
      containerRef.current.scrollTop = (canvasHeight - minHeight) / 2;
    }
  };

  // --- PAN CON CLIC Y BARRA ESPACIADORA ---
  const handleMouseDown = (e) => {
    if (!spacePressed) return;
    setIsPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY };
    if (containerRef.current) {
      scrollStart.current = {
        left: containerRef.current.scrollLeft,
        top: containerRef.current.scrollTop,
      };
    }
  };

  const handleMouseMove = (e) => {
    if (!isPanning) return;
    if (containerRef.current) {
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      containerRef.current.scrollLeft = scrollStart.current.left - dx;
      containerRef.current.scrollTop = scrollStart.current.top - dy;
    }
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
    // eslint-disable-next-line
  }, [isPanning]);

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
        <button onClick={resetZoom}>Resetear zoom</button>
        <span style={{ color: "#888" }}>
          <b>Zoom:</b> rueda del mouse &nbsp;|&nbsp; <b>Pan:</b> barra espaciadora + clic
        </span>
      </div>

      {/* Lienzo centrado y scrollable */}
      <div
        ref={containerRef}
        style={{
          width: minWidth,
          height: minHeight,
          overflow: "auto",
          border: "1px solid #aaa",
          background: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          marginBottom: 16,
          position: "relative",
          cursor: spacePressed ? (isPanning ? "grabbing" : "grab") : "default"
        }}
        onMouseDown={handleMouseDown}
      >
        <div
          style={{
            width: canvasWidth * stageScale,
            height: canvasHeight * stageScale,
            position: "relative"
          }}
        >
          <Stage
            ref={stageRef}
            width={canvasWidth}
            height={canvasHeight}
            scaleX={stageScale}
            scaleY={stageScale}
            onWheel={handleWheel}
            style={{ background: "#fff", position: "absolute", left: 0, top: 0 }}
          >
            <Layer>
              {/* Borde del área útil */}
              <Rect
                x={margen}
                y={margen}
                width={ancho * escala}
                height={alto * escala}
                stroke="#000"
                strokeWidth={2}
                dash={[6, 4]}
                listening={false}
              />
              {/* Ejes principales */}
              {[eje0, eje1, eje2, eje3].map((eje, i) => (
                <Line
                  key={`ejeP-${i}`}
                  points={[eje.x1, eje.y1, eje.x2, eje.y2]}
                  stroke="#1976d2"
                  strokeWidth={4}
                />
              ))}
              {/* Ejes secundarios */}
              {ejesV.map((ev, i) => {
                const x = eje0.x1 + ev.distancia * escala;
                return (
                  <Line
                    key={`ejeV-${i}`}
                    points={[x, eje0.y1, x, eje2.y1]}
                    stroke="#43a047"
                    strokeWidth={2}
                    dash={[8, 8]}
                  />
                );
              })}
              {ejesH.map((eh, i) => {
                const y = eje0.y1 + eh.distancia * escala;
                return (
                  <Line
                    key={`ejeH-${i}`}
                    points={[eje0.x1, y, eje1.x1, y]}
                    stroke="#fbc02d"
                    strokeWidth={2}
                    dash={[8, 8]}
                  />
                );
              })}
              {/* Nodos */}
              {nodos.map((n, idx) => {
                let w = 20, h = 12;
                if (nivel !== "1 de 1") {
                  const nivelObj = niveles.find(nv => nv.value === nivel);
                  w = nivelObj.ancho;
                  h = nivelObj.alto;
                } else {
                  const orient = orientacionesNodos[idx] || "horizontal";
                  w = orient === "horizontal" ? 20 : 12;
                  h = orient === "horizontal" ? 12 : 20;
                }
                w = Math.min(w, ancho);
                h = Math.min(h, alto);

                let rectX = n.x - (w * escala) / 2;
                let rectY = n.y - (h * escala) / 2;
                rectX = Math.max(eje0.x1, Math.min(rectX, eje1.x1 - w * escala));
                rectY = Math.max(eje0.y1, Math.min(rectY, eje2.y1 - h * escala));
                return (
                  <React.Fragment key={`nodo-${idx}`}>
                    <Rect
                      x={rectX}
                      y={rectY}
                      width={w * escala}
                      height={h * escala}
                      fill="rgba(30,144,255,0.2)"
                      stroke="#1976d2"
                      strokeWidth={2}
                    />
                    <Text
                      x={rectX + 5}
                      y={rectY + 5}
                      text={`N${idx + 1}`}
                      fontSize={14}
                      fill="#1976d2"
                    />
                  </React.Fragment>
                );
              })}
              {/* Cotas horizontales (arriba y abajo) */}
              <Cota
                x1={eje0.x1}
                y1={eje0.y1}
                x2={eje0.x2}
                y2={eje0.y2}
                valor={ancho}
                offset={-20}
              />
              
              {/* Cotas verticales (izquierda y derecha) */}
              <Cota
                x1={eje3.x1}
                y1={eje3.y1}
                x2={eje3.x2}
                y2={eje3.y2}
                valor={alto}
                offset={-20}
              />
              
            </Layer>
          </Stage>
        </div>
      </div>

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
      <div style={{ width: minWidth, marginBottom: 16 }}>
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