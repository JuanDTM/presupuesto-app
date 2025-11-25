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
  ancho = 200,
  largo = 100,
  nivel = "1 de 1",
  niveles = [],
  ejesSecundarios = [],
  orientacionesNodos = [],
  escala = 1,
  margen = 20,
  canvasWidth = 800,
  canvasHeight = 600,
  stageScale = 1,
  stageX = 0,
  stageY = 0,
  handleWheel = () => {},
  handleMouseDown = () => {},
  spacePressed = false,
  isPanning = false,
  nodos = [],
  cotas = [],
  muros = []
}) {
  // protecciones y saneamiento básico
  const safeNodos = Array.isArray(nodos) ? nodos : [];
  const safeCotas = Array.isArray(cotas) ? cotas : [];
  const safeMuros = Array.isArray(muros) ? muros : [];
  const safeEjesSec = Array.isArray(ejesSecundarios) ? ejesSecundarios : [];
  const safeOrientaciones = Array.isArray(orientacionesNodos) ? orientacionesNodos : [];

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

  const ejesV = safeEjesSec.filter(e => e && e.orientacion === "V");
  const ejesH = safeEjesSec.filter(e => e && e.orientacion === "H");

  // Nodos ajustados con offset - filtrar nodos inválidos primero
  const nodosOffset = safeNodos
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
          width={Math.max(0, ancho * escala)}
          height={Math.max(0, largo * escala)}
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
          const dist = Number(ev.distancia);
          if (!isFinite(dist)) return null;
          const x = margen + dist * escala + offsetX;
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
          const dist = Number(eh.distancia);
          if (!isFinite(dist)) return null;
          const y = margen + dist * escala + offsetY;
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
            const nivelObj = (Array.isArray(niveles) ? niveles : []).find(nv => nv && nv.value === nivel);
            if (nivelObj) {
              w = Number(nivelObj.ancho) || w;
              h = Number(nivelObj.alto) || h;
            }
          } else {
            const orient = safeOrientaciones[idx] || "horizontal";
            w = orient === "horizontal" ? 20 : 12;
            h = orient === "horizontal" ? 12 : 20;
          }
          w = Math.min(w, Math.max(1, ancho));
          h = Math.min(h, Math.max(1, largo));

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
        {safeCotas
          .filter(c => {
            if (!c) return false;
            const a = c.nodoA, b = c.nodoB;
            return Number.isInteger(a) && Number.isInteger(b) && a >= 0 && b >= 0 && a < nodosOffset.length && b < nodosOffset.length;
          })
          .map((c, i) => (
            <Cota
              key={i}
              x1={nodosOffset[c.nodoA].x}
              y1={nodosOffset[c.nodoA].y}
              x2={nodosOffset[c.nodoB].x}
              y2={nodosOffset[c.nodoB].y}
              valor={c.valor}
              offset={c.tipo === "libre" ? 40 : -40}
              color={c.tipo === "libre" ? "#e53935" : "#1976d2"}
            />
          ))
        }
        {/* Muros */}
        {safeMuros.map((muro, idx) => {
          if (!muro) return null;
          const baseProps = {
            x1: (typeof muro.x1 === 'number' ? muro.x1 : 0) + offsetX,
            y1: (typeof muro.y1 === 'number' ? muro.y1 : 0) + offsetY,
            x2: (typeof muro.x2 === 'number' ? muro.x2 : 0) + offsetX,
            y2: (typeof muro.y2 === 'number' ? muro.y2 : 0) + offsetY,
            seleccionado: false,
            key: idx
          };
          if (muro.tipo === "ventana") {
            return (
              <MuroVentana
                {...baseProps}
                muro1={muro.muro1}
                anchoVentana={muro.anchoVentana}
                numeroVentana={muro.numeroVentana}
                muro2={muro.muro2}
                muro3={muro.muro3}
                altoVentana={muro.altoVentana}
              />
            );
          } else if (muro.tipo === "puerta") {
            return (
              <MuroPuerta
                {...baseProps}
                anchoPuerta={muro.anchoPuerta}
                muro1={muro.muro1}
                muro2={muro.muro2}
              />
            );
          } else if (muro.tipo === "puertaventana") {
            return (
              <MuroPuertaVentana
                {...baseProps}
                anchoVentana={muro.anchoVentana}
                altoVentana={muro.altoVentana}
                anchoPuerta={muro.anchoPuerta}
                posicionPuerta={muro.posicionPuerta}
                muro1={muro.muro1}
                muro2={muro.muro2}
              />
            );
          } else {
            return <MuroEntero {...baseProps} />;
          }
        })}
      </Layer>
    </Stage>
  );
}