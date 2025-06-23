import React, { useState, useRef } from "react";
import { Stage, Layer, Line, Text, Rect, Circle } from "react-konva";

// Factor de conversión: 1 pixel = 1 cm (ajusta según tu escala)
const conversionFactor = 1; // 1 pixel = 1 cm

function distance(x1, y1, x2, y2) {
  // Calcula la distancia entre dos puntos (x1, y1) y (x2, y2) y la devuelve en cm
  return Math.round(
    Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2) * conversionFactor
  );
}

export default function PlanoMuros() {
  const [muros, setMuros] = useState([]); // Lista de muros
  const [dibujando, setDibujando] = useState(false); // Estado para saber si se está dibujando
  const [inicio, setInicio] = useState(null); // Punto de inicio del muro
  const [fin, setFin] = useState(null); // Punto final del muro
  const stageRef = useRef(); // Referencia al Stage de Konva

  //iniciar dibujo de muro
  const iniciarDibujo = (e) => {
    const stage = stageRef.current.getStage();
    const pos = stage.getPointerPosition();

    if (!dibujando) {
      setInicio(pos);
      setFin(pos);
      setDibujando(true);
    } else {
      //termina muro
      setMuros([...muros, { xi: inicio.x, yi: inicio.y, xf: pos.x, yf: pos.y }]);
      setDibujando(false);
      setInicio(null);
      setFin(null);
    }
  };

  // Actualiza la posición final del muro mientras se dibuja
  const actualizarFin = (e) => {
    if (!dibujando) return; // Solo actualiza si se está dibujando
    const stage = stageRef.current.getStage();
    const pos = stage.getPointerPosition();
    setFin(pos);
  };

  // Renderiza los muros en el plano
  return (
    <div>
      <h2>Plano de Muros</h2>
      <p>Haz clic para iniciar o terminar el dibujo de un muro.</p>
      <Stage
        ref={stageRef}
        width={800}
        height={600}
        onMouseDown={iniciarDibujo}
        onMouseMove={actualizarFin}
        style={{ border: "1px solid #aaa", background: "#f8f8f8" }}
      >
        <Layer>
          {/*muro ya dibujado*/}
          {muros.map((muro, index) => (
            <React.Fragment key={index}>
              <Line
                key={index}
                points={[muro.xi, muro.yi, muro.xf, muro.yf]}
                stroke="#1976d2"
                strokeWidth={6}
                lineCap="round" // Estilo de los extremos del muro
              />
              {/* Medida */}
              <Text
                x={(muro.xi + muro.xf) / 2}
                y={(muro.yi + muro.yf) / 2 - 20}
                text={`${distance(muro.xi, muro.yi, muro.xf, muro.yf)} cm`}
                fontSize={16}
                fill="#333"
              />
              {/* Nodos */}
              <Circle x={muro.xi} y={muro.yi} radius={5} fill="#1976d2" />
            </React.Fragment>
          ))}

          {/* muro en proceso de dibujo */}
          {dibujando && inicio && fin && (
            <>
              <Line
                points={[inicio.x, inicio.y, fin.x, fin.y]}
                stroke="tomato"
                strokeWidth={4}
                dash={[8, 8]}
              />
              <Circle x={inicio.x} y={inicio.y} radius={5} fill="tomato" />
              <Circle x={fin.x} y={fin.y} radius={5} fill="tomato" />
              <Text
                x={(inicio.x + fin.x) / 2}
                y={(inicio.y + fin.y) / 2 - 20}
                text={`${distance(inicio.x, inicio.y, fin.x, fin.y)} cm`}
                fontSize={16}
                fill="tomato"
              />
            </>
          )}
        </Layer>
      </Stage>
      <div style={{ marginTop: 20 }}>
        <h3>Json de muros</h3>
        <pre style={{ background: "#eee", padding: 10 }}>
          {JSON.stringify(muros, null, 2)}
        </pre>
      </div>
    </div>
  );
}