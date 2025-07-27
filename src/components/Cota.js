// Cota.js
import React from "react";
import { Line, Text } from "react-konva";

export default function Cota({ x1, y1, x2, y2, valor, offset = 30, color = "#e53935" }) {
  const distanciaX = x2 - x1;           // Diferencia en x entre los puntos,  ejemplo (100, 200) y (300, 400)
  const distanciaY = y2 - y1;           // Diferencia en y entre los puntos
  const longitud = Math.sqrt(distanciaX * distanciaX + distanciaY * distanciaY);   // Longitud del segmento,  ejemplo: sqrt((300-100)^2 + (400-200)^2) = sqrt(40000 + 40000) = sqrt(80000) = 282.84
  if (longitud === 0) return null;                 // Si los puntos son iguales, no dibujar nada
  const normalizacionVectorx = -distanciaY / longitud;                       // Normalizar el vector perpendicular,  ejemplo: -distanciaY/longitud = -200/282.84 = -0.7071
  const normalizaciony = distanciaX / longitud;                        // Normalizar el vector perpendicular,  ejemplo: distanciaX/longitud = 200/282.84 = 0.7071
  const perpendicularInicioX1 = x1 + normalizacionVectorx * offset;               // Punto perpendicular al inicio,  ejemplo: x1 + normalizacionVectorx * offset = 30 + (-0.7071 * 30) = 30 - 21.21 = 8.79
  const perpendicularInicioY1 = y1 + normalizaciony * offset;               // Punto perpendicular al inicio,  ejemplo: y1 + normalizaciony * offset = 50 + (0.7071 * 30) = 50 + 21.21 = 71.21
  const perpendicularFinalX2 = x2 + normalizacionVectorx * offset;               // Punto perpendicular al final,  ejemplo: x2 + normalizacionVectorx * offset = 130 + (-0.7071 * 30) = 130 - 21.21 = 108.79
  const perpendicularFinalY2 = y2 + normalizaciony * offset;               // Punto perpendicular al final,  ejemplo: y2 + normalizaciony * offset = 150 + (0.7071 * 30) = 150 + 21.21 = 171.21
  const puntoMediox = (perpendicularInicioX1 + perpendicularFinalX2) / 2;                 // Punto medio en x de los puntos perpendiculares,  ejemplo: (8.79 + 108.79) / 2 = 58.79
  const puntoMedioy = (perpendicularInicioY1 + perpendicularFinalY2) / 2;                 // Punto medio en y de los puntos perpendiculares,  ejemplo: (71.21 + 171.21) / 2 = 121.21

  return (
    <>
      <Line points={[perpendicularInicioX1, perpendicularInicioY1, perpendicularFinalX2, perpendicularFinalY2]} stroke={color} strokeWidth={2} dash={[6, 4]} />
      <Line points={[x1, y1, perpendicularInicioX1, perpendicularInicioY1]} stroke={color} strokeWidth={1} />
      <Line points={[x2, y2, perpendicularFinalX2, perpendicularFinalY2]} stroke={color} strokeWidth={1} />
      <Text
        x={puntoMediox - 30}
        y={puntoMedioy - 12}
        width={60}
        align="center"
        text={valor + " cm"}
        fontSize={16}
        fill={color}
        fontStyle="bold"
      />
    </>
  );
}