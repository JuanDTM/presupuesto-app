// MuroEntero.js
import React from "react";
import { Line, Text } from "react-konva";

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
  const color_relleno= "#8B4513";     // color café claro D2B48C
  const color_borde = "#696969";         //color negro
  const grosor =20;
  const grosorBorde = grosor + 4;
  // Calcular la longitud del muro
  const longitud = (Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)).toFixed(2))/2;
  
    // Inicializar las variables para la posición del texto
    let textoX, textoY;

    // Calcular la posición del texto (centro del muro)
    if (x1 === x2) {
      // Muro vertical  
      textoY = (y1 + y2) / 2; // Promedio de las coordenadas Y
      textoX = x1 ; // A la derecha del muro
    } else {
      // Muro horizontal
      textoX = (x1 + x2) / 2; // Promedio de las coordenadas X
      textoY = y1 ; // Arriba del muro
    }
  
  const angulo = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI); // Convertir de radianes a grados
 
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
      <Text
        x={textoX } // Ajustar posición X según orientación
        y={textoY } // Ajustar posición Y según orientación
        text={`${longitud} cm`} // Mostrar la longitud del muro
        fontSize={16}
        fill="#FF0000" // Color del texto
        align="center"
        rotation={angulo} // Rotar el texto según el ángulo del muro
      />
    </>
  );
}