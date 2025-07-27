// MuroEntero.js
import React from "react";
import { Line } from "react-konva";

export default function MuroEntero({
  x1,
  y1,
  x2,
  y2,
  seleccionado = false,
  onClick,
  ...props
}) {
  // El borde será 2px más grueso que el muro interior
  const color_relleno= "#D2B48C";     // color café claro
  const color_borde = "#222";         //color negro
  const grosor =20;
  const grosorBorde = grosor + 4;

  return (
    <>
      {/* Borde negro */}
      <Line
        points={[x1, y1, x2, y2]}
        stroke={color_borde}
        strokeWidth={grosorBorde}
        lineCap="butt"
        lineJoin="miter"
        shadowForStrokeEnabled={false}
        opacity={seleccionado ? 0.7 : 1}
        listening={false} // El borde no responde a eventos
      />
      {/* Interior café claro */}
      <Line
        points={[x1, y1, x2, y2]}
        stroke={color_relleno}
        strokeWidth={grosor}
        lineCap="butt"
        lineJoin="miter"
        shadowForStrokeEnabled={false}
        opacity={seleccionado ? 0.7 : 1}
        onClick={onClick}
        {...props}
      />
    </>
  );
}