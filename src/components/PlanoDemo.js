import React from 'react';
import { Stage, Layer, Rect } from 'react-konva';

export default function PlanoDemo() {
  return (
    <Stage width={500} height={400}>
      <Layer>
        <Rect
          x={50}
          y={60}
          width={200}
          height={100}
          fill="lightblue"
          stroke="navy"
          strokeWidth={4}
        />
      </Layer>
    </Stage>
  );
}