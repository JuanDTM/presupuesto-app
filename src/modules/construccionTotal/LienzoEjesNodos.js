/* @jsxRuntime classic */
/* @jsx React.createElement */
// LienzoEjesNodos.js
import React from "react";
import { Stage, Layer, Line, Rect, Text } from "react-konva";
import Cota from "../../components/Cota";
import MuroEntero from "../../components/MuroEntero";
import MuroVentana from "../../components/MuroVentana";
import MuroPuerta from "../../components/MuroPuerta";
import MuroPuertaVentana from "../../components/MuroPuertaVentana";

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
  nodos,
  cotas,
  muros
}) {
  const extraMargin = Math.max(420, Math.max(canvasWidth, canvasHeight) * 0.6);
  const stageWidth = canvasWidth + extraMargin * 2;
  const stageHeight = canvasHeight + extraMargin * 2;
  const offsetX = extraMargin;
  const offsetY = extraMargin;

  // Ejes principales (ajustados al margen y offset)
  const eje0 = { x1: margen + offsetX, y1: margen + offsetY, x2: margen + ancho * escala + offsetX, y2: margen + offsetY };
  const eje1 = { x1: margen + ancho * escala + offsetX, y1: margen + offsetY, x2: margen + ancho * escala + offsetX, y2: margen + largo * escala + offsetY };
  const eje2 = { x1: margen + ancho * escala + offsetX, y1: margen + largo * escala + offsetY, x2: margen + offsetX, y2: margen + largo * escala + offsetY };
  const eje3 = { x1: margen + offsetX, y1: margen + largo * escala + offsetY, x2: margen + offsetX, y2: margen + offsetY };

  const ejesV = ejesSecundarios.filter(e => e.orientacion === "V");
  const ejesH = ejesSecundarios.filter(e => e.orientacion === "H");

  /// Nodos ajustados con offset - filtrar nodos inválidos primero
  const nodosOffset = (nodos || [])
  .filter(n => n && typeof n.x === 'number' && typeof n.y === 'number')
  .map(n => ({
    x: n.x + offsetX,
    y: n.y + offsetY
  }));
  return (
    <Stage
      width={stageWidth}
      height={stageHeight}
      scaleX={stageScale}
      scaleY={stageScale}
      x={stageX}
      y={stageY}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      style={{ position: "absolute", left: 0, top: 0 }}
    >
      <Layer>
        <Rect
          x={0}
          y={0}
          width={stageWidth}
          height={stageHeight}
          fill="#050b18"
          listening={false}
        />
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
            const x = margen + ev.distancia * escala + offsetX;
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
            const y = margen + eh.distancia * escala + offsetY;
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
          {nodosOffset.map((n, idx) => {
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
            rectX = Math.max(eje0.x1, Math.min(rectX, eje1.x1 - w * escala));
            rectY = Math.max(eje0.y1, Math.min(rectY, eje2.y1 - h * escala));
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
            x1={eje0.x1}
            y1={eje0.y1}
            x2={eje0.x2}
            y2={eje0.y2}
            valor={ancho}
            offset={-20}
            color="#F57C00"
          />
          {/* Cotas verticales (izquierda y derecha) */}
          <Cota
            x1={eje3.x1}
            y1={eje3.y1}
            x2={eje3.x2}
            y2={eje3.y2}
            valor={largo}
            offset={-20}
            color="#F57C00"
          />
          {/* Cotas de usuario */}
          {cotas.map((c, i) => (
            <Cota
              key={i}
              x1={nodosOffset[c.nodoA].x}
              y1={nodosOffset[c.nodoA].y}
              x2={nodosOffset[c.nodoB].x}
              y2={nodosOffset[c.nodoB].y}
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
                  muro1={muro.muro1} // Ajustar para que coincida con lo que espera MuroVentana
                  anchoVentana={muro.anchoVentana}
                  numeroVentana={muro.numeroVentana}
                  muro2={muro.muro2} // Ajustar para que coincida con lo que espera MuroVentana
                  muro3={muro.muro3} // Ajustar para que coincida con lo que espera MuroVentana
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
                  muro1={muro.muro1} // Ajustar para que coincida con lo que espera MuroPuerta
                  muro2={muro.muro2} // Ajustar para que coincida con lo que espera MuroPuerta
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
                  muro1={muro.muro1} // Ajustar para que coincida con lo que espera MuroPuertaVentana
                  muro2={muro.muro2} // Ajustar para que coincida con lo que espera MuroPuertaVentana
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
                  seleccionado={false}
                />
              );
            }
          })}
                                                             
        </Layer>
      </Stage>
  );
}