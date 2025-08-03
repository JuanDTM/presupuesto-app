// MuroVentana.js
import React from "react";
import { Line, Text } from "react-konva";

/**
 * Dibuja un muro con ventana entre dos puntos (x1, y1) y (x2, y2)
 * Recibe las dimensiones de los muros laterales y la ventana.
 */
export default function MuroVentana({
  anchoVentana,
  altoVentana,
  numeroVentana,
  muro1 = 0,
  muro2 = 0,
  muro3 = 0,
  x1,
  y1,
  x2,
  y2,
  seleccionado = false,
  onClick,
  ...props
}) {

 
  // Calcular ángulo y orientación
  const dx = x2 - x1;
  const dy = y2 - y1;
  const angulo = Math.atan2(dy, dx) * (180 / Math.PI);
  const esHorizontal = y1 === y2;

 // Constantes de diseño
  const grosor = 20;
  const grosorBorde = grosor + 4;
  const colorMuro = "#8B4513";
  const colorVentana = "#808080";
  const colorBorde = "#696969";
  const colorVentanaBorde = "#FFFFFF";

  // Función para calcular posiciones
  const calcularPosiciones = () => {
    let posiciones = [];
    let actualX = x1;
    let actualY = y1;

    if (muro1) {
      posiciones.push({
        tipo: "muro",
        xInicio: actualX,
        yInicio: actualY,
        xFin: esHorizontal ? actualX + muro1* 2 : actualX,
        yFin: esHorizontal ? actualY : actualY + muro1* 2,
        texto: `${muro1} cm`,
      });
      actualX = esHorizontal ? actualX + muro1* 2 : actualX;
      actualY = esHorizontal ? actualY : actualY + muro1* 2;
    }

    if (numeroVentana >= 1) {
      posiciones.push({
        tipo: "ventana",
        xInicio: actualX,
        yInicio: actualY,
        xFin: esHorizontal ? actualX + anchoVentana* 2 : actualX,
        yFin: esHorizontal ? actualY : actualY + anchoVentana* 2,
        texto: `${anchoVentana} cm`,
      });
      actualX = esHorizontal ? actualX + anchoVentana* 2 : actualX;
      actualY = esHorizontal ? actualY : actualY + anchoVentana* 2;
    }

    if (muro2) {
      posiciones.push({
        tipo: "muro",
        xInicio: actualX,
        yInicio: actualY,
        xFin: esHorizontal ? actualX + muro2*2 : actualX,
        yFin: esHorizontal ? actualY : actualY + muro2*2,
        texto: `${muro2} cm`,
      });
      actualX = esHorizontal ? actualX + muro2*2 : actualX;
      actualY = esHorizontal ? actualY : actualY + muro2*2;
    }

    if (numeroVentana === 2) {
      posiciones.push({
        tipo: "ventana",
        xInicio: actualX,
        yInicio: actualY,
        xFin: esHorizontal ? actualX + anchoVentana*2 : actualX,
        yFin: esHorizontal ? actualY : actualY + anchoVentana*2,
        texto: `${anchoVentana} cm`,
      });
      actualX = esHorizontal ? actualX + anchoVentana*2 : actualX;
      actualY = esHorizontal ? actualY : actualY + anchoVentana*2;
    }

    if (muro3) {
      posiciones.push({
        tipo: "muro",
        xInicio: actualX,
        yInicio: actualY,
        xFin: esHorizontal ? actualX + muro3*2 : actualX,
        yFin: esHorizontal ? actualY : actualY + muro3*2,
        texto: `${muro3} cm`,
      });
    }

    return posiciones;
  };

  const posiciones = calcularPosiciones();
  
   // Renderizar elementos
   return (
    <>
      {posiciones.map((pos, index) => (
        <React.Fragment key={index}>
          {/* Borde */}
          <Line
            points={[pos.xInicio, pos.yInicio, pos.xFin, pos.yFin]}
            stroke={pos.tipo === "muro" ? colorBorde : colorVentanaBorde}
            strokeWidth={grosorBorde}
            lineCap="butt"
            lineJoin="miter"
            shadowForStrokeEnabled={false}
            opacity={seleccionado ? 0.7 : 1}
            listening={false}
          />
          {/* Elemento principal */}
          <Line
            points={[pos.xInicio, pos.yInicio, pos.xFin, pos.yFin]}
            stroke={pos.tipo === "muro" ? colorMuro : colorVentana}
            strokeWidth={grosor}
            lineCap="butt"
            lineJoin="miter"
            shadowForStrokeEnabled={false}
            opacity={seleccionado ? 0.7 : 1}
            onClick={onClick}
            {...props}
          />
          {/* Texto */}
          <Text
            x={(pos.xInicio + pos.xFin) / 2}
            y={(pos.yInicio + pos.yFin) / 2}
            text={pos.texto}
            fontSize={16}
            fill={"#ff0000"}
            align="center"
            rotation={angulo}
          />
        </React.Fragment>
      ))}
    </>
  );
}