
import React, { useState, useEffect } from "react"; // Importar useEffect junto con useState
import { Stage, Layer, Rect, Text } from "react-konva"; // Importar componentes de react-konva

export default function MuroPuertaEditor({
  visible,
  onClose,
  onSave,
  nodoA,
  nodoB,
  desplazamiento,
  escala,
  margen,
  altura,
  x1,
  y1,
  x2,
  y2,
  muroInicial = {},
  handleWheel, // Recibir handleWheel como prop
  spacePressed, // Recibir spacePressed como prop
  isPanning, // Recibir isPanning como prop
  stageScale, // Recibir stageScale como prop
  ...props
}) {

  //necesito ver en cosola todo lo que llega desde // el padre para ver si hay algo que no estoy usando
  console.log("parametro visible:", visible);
  console.log("parametro onClose:", onClose);
  console.log("parametro onSave:", onSave);
  console.log("parametro nodoA:", nodoA);
  console.log("parametro nodoB:", nodoB);
  console.log("parametro desplazamiento:", desplazamiento);
  console.log("parametro escala:", escala);
  console.log("parametro margen:", margen);
  console.log("parametro altura:", altura);
  console.log("parametro x1:", x1);
  console.log("parametro y1:", y1);
  console.log("parametro x2:", x2);
  console.log("parametro y2:", y2);

 // Estados para los inputs
 const [anchoPuerta, setAnchoPuerta] = useState(45);
 const [muro1, setMuro1] = useState(60);
 const [muro2, setMuro2] = useState(80);

 // Cuando se abre el modal o cambia el muroInicial, actualiza los estados
 useEffect(() => {
  if (visible) {
    setAnchoPuerta(muroInicial.anchoPuerta ?? 45);
    setMuro1(muroInicial.muro1 ?? 60);
    setMuro2(muroInicial.muro2 ?? 80);
  }
}, [visible, muroInicial?.id]);

  // Cálculo de suma total
  const sumaMuros = muro1 + muro2;
  
  const anchoTotal = sumaMuros + anchoPuerta;

  // Escala para que el muro siempre quepa en el canvas
  // const escala = Math.min(1.5, 600 / cotaLibre);
  // const margen = 40;

  // Dimensiones del canvas
  // Calcular la longitud del muro
  const cotaLibre = (Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)).toFixed(2))/2;
  console.log("cotaLibre:", cotaLibre);
  const canvasWidth = Math.max(cotaLibre * escala + margen * 2, 1000);
  const canvasHeight = Math.max(altura * escala + margen * 2, 700);

  // Posiciones de los elementos
  let x = margen;
  const segmentos = [];
  // Muro1
  segmentos.push({
    x,
    w: muro1 * escala,
    color: "#00ff00",
    label: `${muro1} cm`
  });
  x += muro1 * escala;
  // puerta
  segmentos.push({
    x,
    w: anchoPuerta * escala,
    color: "#00f0ff",
    label: `${anchoPuerta}cm`,
    isVentana: true
  });
  x += anchoPuerta * escala;
  // Si hay dos ventanas

    // Muro2
    segmentos.push({
      x,
      w: muro2 * escala,
      color: "#00ff00",
      label: `${muro2} cm`
    });
    x += muro2 * escala;
  

  // Validación mínima
  const datosValidos =
    anchoPuerta > 0 &&
    muro1 >= 0 &&
    muro2 >= 0 &&
    anchoTotal <= cotaLibre;

  return visible ? (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
      background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
    }}>
      <div style={{
        background: "#fff", borderRadius: 8, display: "flex", flexDirection: "row",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)", padding: 70, minWidth: 1000, minHeight: 500
      }}>
        {/* Inputs */}
        <div style={{  minWidth: 320, marginRight: 48}}>
          <h2>Editor de Muro con Puerta</h2>
          <div style={{ fontSize: 20, marginBottom: 8 }}>
            <label>ancho Puerta <input type="number" value={anchoPuerta} min={1} max={cotaLibre} onChange={e => setAnchoPuerta(Number(e.target.value))} style={{ width: 60, fontSize: 20 }} /></label>
          </div>
          <div style={{ fontSize: 20, marginBottom: 8 }}>
            <label>muro1 <input type="number" value={muro1} min={0} max={cotaLibre} onChange={e => setMuro1(Number(e.target.value))} style={{ width: 60, fontSize: 20 }} /></label>
          </div>
          <div style={{ fontSize: 20, marginBottom: 8 }}>
            <label>muro2 <input type="number" value={muro2} min={0} max={cotaLibre} onChange={e => setMuro2(Number(e.target.value))} style={{ width: 60, fontSize: 20 }} /></label>
            </div>
          <div style={{ color: anchoTotal > cotaLibre ? "red" : "#222", fontWeight: "bold", marginBottom: 12 }}>
            Total: {anchoTotal} cm / {cotaLibre} cm
          </div>
          <div>Altura actual: {altura}</div>
          <button
            style={{ fontSize: 28, padding: "8px 32px", marginTop: 12 }}
            onClick={() => {
              console.log("Botón aceptar presionado");
              const datos = {
                tipo: "puerta",
                anchoPuerta,
                muro1,
                muro2,
                altura,
                nodoA,
                nodoB,
                desplazamiento,
                escala,
                margen,
                x1,
                y1,
                x2,
                y2,
                id: muroInicial.id // si existe, para actualizar
              };
              console.log("Datos enviados:", datos);
              onSave(datos);
            }}
            disabled={anchoTotal > cotaLibre}
          >aceptar</button>
          <button onClick={onClose} style={{ marginLeft: 16, fontSize: 20 }}>Cancelar</button>
        </div>
        {/* Canvas de diseño */}
        <div style={{ background: "#111", borderRadius: 8, padding: 16, minWidth: 1000, minHeight: 500 }}>
          <Stage 
            width={canvasWidth}
            height={canvasHeight}
            scaleX={stageScale} // Aplicar escala horizontal
            scaleY={stageScale} // Aplicar escala vertical
            onWheel={handleWheel} // Vincular handleWheel al evento de rueda
          >
            <Layer>
              {/* Muro exterior */}
              <Rect
                x={(canvasWidth - cotaLibre * escala) / 2} // Centrar horizontalmente
                y={(canvasHeight - altura * escala) / 2}  // Centrar verticalmente
                width={cotaLibre * escala}
                height={altura * escala}
                stroke="#00f"
                strokeWidth={3}
              />
              {/* Segmentos (muros y ventanas) */}
              {segmentos.map((seg, i) => (
                <Rect
                  key={i}
                  x={(canvasWidth - cotaLibre * escala) / 2 + seg.x - margen} // Relativo al muro exterior
                  y={(canvasHeight - altura * escala) / 2 }
                  width={seg.w}
                  height={ altura * escala} // Altura específica para ventanas
                  stroke={seg.color}
                  strokeWidth={3}
                  fill={seg.isVentana ? "#000" : "transparent"}
                />
              ))}
              {/* Etiquetas */}
              {segmentos.map((seg, i) => (
                <Text
                  key={i}
                  x={(canvasWidth - cotaLibre * escala) / 2 + seg.x -margen+seg.w / 2 - 30} // Relativo al muro exterior
                  y={(canvasHeight - altura * escala) / 2 + 10} // Relativo al muro exterior
                  text={seg.label}
                  fontSize={24}
                  fill={seg.color}
                  fontStyle="bold"
                />
              ))}
              {/* Altura */}
              <Text
                x={(canvasWidth - cotaLibre * escala) / 2 - 80} // Relativo al muro exterior
                y={(canvasHeight - altura * escala) / 2 + (altura * escala) / 2 - 20} // Relativo al muro exterior
                text={`${altura}cm`}
                fontSize={28}
                fill="#0f0"
                fontStyle="bold"
              />
              {/* Ancho total */}
              <Text
                x={(canvasWidth - cotaLibre * escala) / 2 + (cotaLibre * escala) / 2 - 60} // Relativo al muro exterior
                y={(canvasHeight - altura * escala) / 2 + altura * escala + 10} // Relativo al muro exterior
                text={`${cotaLibre} cm`}
                fontSize={32}
                fill="#0f0"
                fontStyle="bold"
              />
            </Layer>
          </Stage>
        </div>
      </div>
    </div>
  ) : null;
}