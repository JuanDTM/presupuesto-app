// LienzoEjesNodos.js
import React from "react";
import { Stage, Layer, Line, Rect, Text } from "react-konva";
import Cota from "./Cota";
import MuroEntero from "./MuroEntero";
import MuroVentana from "./MuroVentana";
import MuroPuerta from "./MuroPuerta";
import MuroPuertaVentana from "./MuroPuertaVentana";

export default function LienzoEjesNodos({
  ancho,
  largo,
  nivel,
  niveles,
  ejesSecundarios,
  orientacionesNodos,
  escala,
  margen,
  canvasWidth,
  canvasHeight,
  stageScale,
  stageX,
  stageY,
  handleWheel,
  handleMouseDown,
  spacePressed,
  isPanning,
  nodos = [],
  cotas = [],
  muros = [],
  ejesTerciarios = [],
  stageWidth,
  stageHeight,
  offsetX,
  offsetY,
}) {
  

  // Ejes principales (ajustados al margen y offset)
  const ejeSuperior = { x1: margen + offsetX, y1: margen + offsetY, x2: margen + ancho * escala + offsetX, y2: margen + offsetY };
  const ejeDerecho  = { x1: margen + ancho * escala + offsetX, y1: margen + offsetY, x2: margen + ancho * escala + offsetX, y2: margen + largo * escala + offsetY };
  const ejeInferior = { x1: margen + ancho * escala + offsetX, y1: margen + largo * escala + offsetY, x2: margen + offsetX, y2: margen + largo * escala + offsetY };
  const ejeIquierdo = { x1: margen + offsetX, y1: margen + largo * escala + offsetY, x2: margen + offsetX, y2: margen + offsetY };

  const ejesVerticales = ejesSecundarios.filter(e => e.orientacion === "V");
  const ejesHorizontales = ejesSecundarios.filter(e => e.orientacion === "H");

  // Nodos ajustados con desplazamiento
  const nodosDesplazados = nodos.map(nodo => ({
    x: nodo.x + offsetX,
    y: nodo.y + offsetY
  }));

  // --- CONTENEDOR FIJO ---
  // El contenedor siempre mide 900x600, el usuario navega con scroll y zoom
  return (
    <div
      style={{
        width: 1000,
        height: 600,
        overflow: "auto",
        border: "1px solid #aaa",
        background: "#fff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        marginBottom: 16,
        position: "relative",
        userSelect: "none",
        cursor: isPanning ? "grabbing" : "grab"
      }}
      onMouseDown={handleMouseDown}
    >
      <Stage
        width={stageWidth}
        height={stageHeight}
        scaleX={stageScale}
        scaleY={stageScale}
        x={stageX}
        y={stageY}
        onWheel={handleWheel}
        style={{ background: "#000", position: "absolute", left: 0, top: 0 }}
      >
        <Layer>
          {/* Borde del área útil */}
          <Rect
            x={margen + offsetX}
            y={margen + offsetY}
            width={ancho * escala}
            height={largo * escala}
            stroke="#000"
            strokeWidth={2}
            dash={[6, 4]}
            listening={false}
          />
          {/* Ejes principales */}
          {[ejeSuperior, ejeDerecho, ejeInferior, ejeIquierdo].map((eje, i) => (
            <Line
              key={`ejeP-${i}`}
              points={[eje.x1, eje.y1, eje.x2, eje.y2]}
              stroke="#1976d2"
              strokeWidth={4}
            />
          ))}
          {/* Ejes secundarios */}
          {ejesVerticales.map((ev, i) => {
            const x = margen + ev.distancia * escala + offsetX;
            return (
              <Line
                key={`ejeV-${i}`}
                points={[x, ejeSuperior.y1, x, ejeInferior.y1]}
                stroke="#43a047"
                strokeWidth={2}
                dash={[8, 8]}
              />
            );
          })}
          {ejesHorizontales.map((eh, i) => {
            const y = margen + eh.distancia * escala + offsetY;
            return (
              <Line
                key={`ejeH-${i}`}
                points={[ejeSuperior.x1, y, ejeDerecho.x1, y]}
                stroke="#fbc02d"
                strokeWidth={2}
                dash={[8, 8]}
              />
            );
          })}
          {/*ejes terciarios */}
          {ejesTerciarios.map((et, idx) => {
            const x1 = et.x1 + offsetX;
            const y1 = et.y1 + offsetY;
            const x2 = et.x2 + offsetX;
            const y2 = et.y2 + offsetY;
            return (
              <Line
                key={`ejeT-${idx}`}
                points={[x1, y1, x2, y2]}
                stroke="#8E24AA"
                strokeWidth={2}
                dash={[4, 4]}
              />
            );
          })}
          {/* Nodos */}
          {nodosDesplazados.map((n, idx) => {
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
            h = Math.min(h, largo);
  
            let rectX = n.x - (w * escala) / 2;
            let rectY = n.y - (h * escala) / 2;
            rectX = Math.max(ejeSuperior.x1, Math.min(rectX, ejeDerecho.x1 - w * escala));
            rectY = Math.max(ejeSuperior.y1, Math.min(rectY, ejeInferior.y1 - h * escala));
            return (
              <React.Fragment key={`nodo-${idx}`}>
                <Rect
                  x={rectX}
                  y={rectY}
                  width={w * escala}
                  height={h * escala}
                  fill="#6E6E6E"
                  stroke="#1976d2"
                  strokeWidth={2}
                />
                <Text
                  x={rectX + 5}
                  y={rectY + 5}
                  text={`N${idx + 1}`}
                  fontSize={14}
                  fill="#FF5722"
                />
              </React.Fragment>
            );
          })}
          {/* Cotas horizontales (arriba y abajo) */}
          <Cota
            x1={ejeSuperior.x1}
            y1={ejeSuperior.y1}
            x2={ejeSuperior.x2}
            y2={ejeSuperior.y2}
            valor={ancho}
            offset={-20}
            color="#F57C00"
          />
          {/* Cotas verticales (izquierda y derecha) */}
          <Cota
            x1={ejeIquierdo.x1}
            y1={ejeIquierdo.y1}
            x2={ejeIquierdo.x2}
            y2={ejeIquierdo.y2}
            valor={largo}
            offset={-20}
            color="#F57C00"
          />
          {/* Cotas de usuario */}
          {cotas.map((c, i) => (
            <Cota
              key={i}
              x1={nodosDesplazados[c.nodoA].x}
              y1={nodosDesplazados[c.nodoA].y}
              x2={nodosDesplazados[c.nodoB].x}
              y2={nodosDesplazados[c.nodoB].y}
              valor={c.valor}
              offset={c.tipo === "libre" ? 40 :-40}
              color={c.tipo === "libre" ? "#e53935" : "#1976d2"}
            />
          ))}
          {/* Muros */} 
          {muros && muros.map((muro, idx) => {
            if (muro.tipo === "ventana") {
              return (
                <MuroVentana
                  key={idx}
                  x1={muro.x1 + offsetX}
                  y1={muro.y1 + offsetY}
                  x2={muro.x2 + offsetX}
                  y2={muro.y2 + offsetY}
                  muro1={muro.muro1}
                  anchoVentana={muro.anchoVentana}
                  numeroVentana={muro.numeroVentana}
                  muro2={muro.muro2}
                  muro3={muro.muro3}
                  altoVentana={muro.altoVentana}
                  seleccionado={false}
                />
              );
            }else if (muro.tipo === "puerta"){
              return (
                <MuroPuerta
                  key={idx}
                  x1={muro.x1 + offsetX}
                  y1={muro.y1 + offsetY}
                  x2={muro.x2 + offsetX}
                  y2={muro.y2 + offsetY}
                  anchoPuerta={muro.anchoPuerta}
                  muro1={muro.muro1}
                  muro2={muro.muro2}
                  seleccionado={false}
                />
              );
            }else if (muro.tipo === "puertaventana"){
              return (
                <MuroPuertaVentana
                  key={idx}
                  x1={muro.x1 + offsetX}
                  y1={muro.y1 + offsetY}
                  x2={muro.x2 + offsetX}
                  y2={muro.y2 + offsetY}
                  anchoVentana={muro.anchoVentana}
                  altoVentana={muro.altoVentana}
                  anchoPuerta={muro.anchoPuerta}
                  posicionPuerta={muro.posicionPuerta}
                  muro1={muro.muro1}
                  muro2={muro.muro2}
                  seleccionado={false}
                />
              )
            }else {
              return (
                <MuroEntero
                  key={idx}
                  x1={muro.x1 + offsetX}
                  y1={muro.y1 + offsetY}
                  x2={muro.x2 + offsetX}
                  y2={muro.y2 + offsetY}
                  longitudMuro={muro.longitudMuro}
                  seleccionado={false}
                />
              );
            }
          })}
        </Layer>
      </Stage>
    </div>
  );
}