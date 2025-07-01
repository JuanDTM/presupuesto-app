// Cota.js
import React from "react";
import { Line, Text } from "react-konva";

export default function Cota({ x1, y1, x2, y2, valor, offset = 30, color = "#e53935" }) {
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
      <Line points={[px1, py1, px2, py2]} stroke={color} strokeWidth={2} dash={[6, 4]} />
      <Line points={[x1, y1, px1, py1]} stroke={color} strokeWidth={1} />
      <Line points={[x2, y2, px2, py2]} stroke={color} strokeWidth={1} />
      <Text
        x={mx - 30}
        y={my - 12}
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