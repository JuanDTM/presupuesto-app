import React, { useState, useRef } from "react";
import { Stage, Layer, Line, Text, Circle } from "react-konva";

// Tipos de muro
const tiposMuro = [
  { value: "muroEntero", label: "Muro entero" },
  { value: "muroVentana", label: "Muro con ventana" },
  { value: "muroPuerta", label: "Muro con puerta" },
  { value: "muroPuertaVentana", label: "Muro con puerta y ventana" },
];

// Niveles de ejemplo
const niveles = ["1 de 3", "2 de 3", "3 de 3"];

export default function PlanoInteractivo() {
  const [herramienta, setHerramienta] = useState("eje"); // 'eje' o 'muro'
  const [tipoMuro, setTipoMuro] = useState("muroEntero");
  const [nivel, setNivel] = useState(niveles[0]);
  const [ejes, setEjes] = useState([]); // [{x1, y1, x2, y2}]
  const [muros, setMuros] = useState([]); // [{x1, y1, x2, y2, tipo, nivel}]
  const [dibujando, setDibujando] = useState(false);
  const [inicio, setInicio] = useState(null);
  const [fin, setFin] = useState(null);
  const stageRef = useRef();

  // Dibujo de ejes o muros
  const handleStageMouseDown = (e) => {
    const stage = stageRef.current.getStage();
    const pos = stage.getPointerPosition();
    if (!dibujando) {
      setInicio(pos);
      setFin(pos);
      setDibujando(true);
    } else {
      if (herramienta === "eje") {
        setEjes([...ejes, { x1: inicio.x, y1: inicio.y, x2: pos.x, y2: pos.y }]);
      } else if (herramienta === "muro") {
        setMuros([
          ...muros,
          {
            x1: inicio.x,
            y1: inicio.y,
            x2: pos.x,
            y2: pos.y,
            tipo: tipoMuro,
            nivel: nivel,
          },
        ]);
      }
      setDibujando(false);
      setInicio(null);
      setFin(null);
    }
  };

  const handleStageMouseMove = (e) => {
    if (!dibujando) return;
    const stage = stageRef.current.getStage();
    const pos = stage.getPointerPosition();
    setFin(pos);
  };

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: "flex", gap: 16, marginBottom: 10 }}>
        <button
          onClick={() => setHerramienta("eje")}
          style={{ background: herramienta === "eje" ? "#1976d2" : "#eee", color: herramienta === "eje" ? "#fff" : "#000" }}
        >
          Dibujar eje
        </button>
        <button
          onClick={() => setHerramienta("muro")}
          style={{ background: herramienta === "muro" ? "#1976d2" : "#eee", color: herramienta === "muro" ? "#fff" : "#000" }}
        >
          Dibujar muro
        </button>
        <select value={tipoMuro} onChange={e => setTipoMuro(e.target.value)} disabled={herramienta !== "muro"}>
          {tiposMuro.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <select value={nivel} onChange={e => setNivel(e.target.value)}>
          {niveles.map(n => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>

      {/* Canvas */}
      <Stage
        ref={stageRef}
        width={900}
        height={600}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        style={{ border: "1px solid #aaa", background: "#f8f8f8" }}
      >
        <Layer>
          {/* Ejes */}
          {ejes.map((eje, idx) => (
            <Line
              key={`eje-${idx}`}
              points={[eje.x1, eje.y1, eje.x2, eje.y2]}
              stroke="#888"
              strokeWidth={2}
              dash={[10, 10]}
            />
          ))}
          {/* Muros */}
          {muros
            .filter(m => m.nivel === nivel)
            .map((muro, idx) => (
              <React.Fragment key={`muro-${idx}`}>
                <Line
                  points={[muro.x1, muro.y1, muro.x2, muro.y2]}
                  stroke={
                    muro.tipo === "muroEntero"
                      ? "#1976d2"
                      : muro.tipo === "muroVentana"
                      ? "#43a047"
                      : muro.tipo === "muroPuerta"
                      ? "#fbc02d"
                      : "#d32f2f"
                  }
                  strokeWidth={6}
                  lineCap="round"
                />
                <Text
                  x={(muro.x1 + muro.x2) / 2}
                  y={(muro.y1 + muro.y2) / 2 - 20}
                  text={muro.tipo}
                  fontSize={14}
                  fill="#333"
                />
                <Circle x={muro.x1} y={muro.y1} radius={5} fill="#1976d2" />
                <Circle x={muro.x2} y={muro.y2} radius={5} fill="#1976d2" />
              </React.Fragment>
            ))}
          {/* Línea temporal */}
          {dibujando && inicio && fin && (
            <Line
              points={[inicio.x, inicio.y, fin.x, fin.y]}
              stroke={herramienta === "eje" ? "#888" : "#1976d2"}
              strokeWidth={herramienta === "eje" ? 2 : 6}
              dash={herramienta === "eje" ? [10, 10] : undefined}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
}