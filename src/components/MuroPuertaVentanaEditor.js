
import React, { useState, useEffect } from "react"; // Importar useEffect junto con useState
import { Stage, Layer, Rect, Text } from "react-konva"; // Importar componentes de react-konva

export default function MuroPuertaVentanaEditor({
  visible,
  onClose,
  onSave,
  nodoA,
  nodoB,
  desplazamiento,
  cimientoViga,
  longitudMuro,
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

 // Estados para los inputs
 const [anchoVentana, setAnchoVentana] = useState(45);
 const [altoVentana, setAltoVentana] = useState(110);
 const [anchoPuerta, setAnchoPuerta] = useState(1);
 const [muro1, setMuro1] = useState(60);
 const [muro2, setMuro2] = useState(80);
 const [posicionPuerta, setPosicionPuerta] = useState("izquierda"); // Puede ser "izquierda" o "derecha"

 // Cuando se abre el modal o cambia el muroInicial, actualiza los estados
 useEffect(() => {
  if (visible) {
    setAnchoVentana(muroInicial.anchoVentana ?? 45);
    setAltoVentana(muroInicial.altoVentana ?? 110);
    setAnchoPuerta(muroInicial.anchoPuerta ?? 1) // Reemplazar 'set' por 'setanchoPuerta'
    setMuro1(muroInicial.muro1 ?? 60);
    setMuro2(muroInicial.muro2 ?? 80);
    setPosicionPuerta(muroInicial.posicionPuerta ?? "izquierda");
  }
}, [visible, muroInicial?.id]);

  // Cálculo de suma total
  const sumaMuros = muro1 + muro2 + anchoPuerta;
  const sumaVentanas = anchoVentana ;
  const anchoTotal = sumaMuros + sumaVentanas;

  // Escala para que el muro siempre quepa en el canvas
  // const escala = Math.min(1.5, 600 / longitudMuro);
  // const margen = 40;

  // Dimensiones del canvas
  // Calcular la longitud del muro
  console.log("longitudMuro:", longitudMuro);
  const canvasWidth = Math.max(longitudMuro * escala + margen * 2, 1000);
  const canvasHeight = Math.max(altura * escala + margen * 2, 700);

  // Posiciones de los elementos
  let x = margen;
  const segmentos = [];
  // Puerta
if (posicionPuerta === "izquierda") {
    segmentos.push({
      x: margen, // Puerta a la izquierda
      w: anchoPuerta * escala,
      color: "#00f0ff",
      label: `${anchoPuerta}cm`
    });
    x += anchoPuerta * escala; // Actualizar x después de agregar la puerta
}
  // Muro1
  segmentos.push({
    x,
    w: muro1 * escala,
    color: "#00ff00",
    label: `${muro1} cm`
  });
  x += muro1 * escala;
  // Ventana
  segmentos.push({
    x,
    w: anchoVentana * escala,
    color: "#00f0ff",
    label: `${anchoVentana}cm`,
    isVentana: true
  });
  x += anchoVentana * escala;
  
    // Muro2
    segmentos.push({
        x,
        w: muro2 * escala,
        color: "#00ff00",
        label: `${muro2} cm`
    });
    x += muro2 * escala;

    if (posicionPuerta === "derecha") {
        segmentos.push({
          x, // Puerta a la izquierda
          w: anchoPuerta * escala,
          color: "#00f0ff",
          label: `${anchoPuerta}cm`
        });
        x += anchoPuerta * escala; // Actualizar x después de agregar la puerta
    }
  

  // Validación mínima
  const datosValidos =
    anchoVentana > 0 &&
    altoVentana > 0 &&
     anchoPuerta> 0 &&
    muro1 >= 0 &&
    muro2 >= 0 &&
    anchoTotal <= longitudMuro;

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
          <h2>Editor de Muro con Puerta y Ventana</h2>
          <div style={{ fontSize: 20, marginBottom: 8 }}>
            <label>ancho ventana <input type="number" value={anchoVentana} min={1} max={longitudMuro} onChange={e => setAnchoVentana(Number(e.target.value))} style={{ width: 60, fontSize: 20 }} /></label>
          </div>
          <div style={{ fontSize: 20, marginBottom: 8 }}>
            <label>alto ventana <input type="number" value={altoVentana} min={1} max={altura} onChange={e => setAltoVentana(Number(e.target.value))} style={{ width: 60, fontSize: 20 }} /></label>
          </div>
          <div style={{ fontSize: 20, marginBottom: 8 }}>
            <label>ancho Puerta <input type="number" value={anchoPuerta} min={1} max={altura} onChange={e => setAnchoPuerta(Number(e.target.value))} style={{ width: 60, fontSize: 20 }} /></label>
          </div>
          <div style={{ fontSize: 20, marginBottom: 8 }}>
            <label>
                Posición de la puerta:
                <select value={posicionPuerta} onChange={(e) => setPosicionPuerta(e.target.value)} style={{ fontSize: 20 }}>
                <option value="izquierda">Izquierda</option>
                <option value="derecha">Derecha</option>
                </select>
            </label>
          </div>
          <div style={{ fontSize: 20, marginBottom: 8 }}>
            <label>muro1 <input type="number" value={muro1} min={0} max={longitudMuro} onChange={e => setMuro1(Number(e.target.value))} style={{ width: 60, fontSize: 20 }} /></label>
          </div>
          <div style={{ fontSize: 20, marginBottom: 8 }}>
            <label>muro2 <input type="number" value={muro2} min={0} max={longitudMuro} onChange={e => setMuro2(Number(e.target.value))} style={{ width: 60, fontSize: 20 }} /></label>
          </div>
          <div style={{ color: anchoTotal > longitudMuro ? "red" : "#222", fontWeight: "bold", marginBottom: 12 }}>
            Total: {anchoTotal} cm / {longitudMuro} cm
          </div>
          <div>Altura actual: {altura}</div>
          <button
            style={{ fontSize: 28, padding: "8px 32px", marginTop: 12 }}
            onClick={() => {
              console.log("Botón aceptar presionado");
              const datos = {
                tipo: "puertaventana",
                anchoVentana,
                altoVentana,
                anchoPuerta,
                posicionPuerta,
                muro1,
                muro2,
                altura,
                nodoA,
                nodoB,
                desplazamiento,
                cimientoViga,
                longitudMuro,
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
            disabled={anchoTotal > longitudMuro}
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
                x={(canvasWidth - longitudMuro * escala) / 2} // Centrar horizontalmente
                y={(canvasHeight - altura * escala) / 2}  // Centrar verticalmente
                width={longitudMuro * escala}
                height={altura * escala}
                stroke="#00f"
                strokeWidth={3}
              />
              {/* Segmentos (muros, ventana y puerta) */}
              {segmentos.map((seg, i) => (
                <Rect
                  key={i}
                  x={(canvasWidth - longitudMuro * escala) / 2 + seg.x - margen} // Relativo al muro exterior
                  y={(canvasHeight - altura * escala) / 2 }
                  width={seg.w}
                  height={seg.isVentana ? altoVentana * escala : altura * escala} // Altura específica para ventanas
                  stroke={seg.color}
                  strokeWidth={3}
                  fill={seg.isVentana ? "#000" : "transparent"}
                />
              ))}
              {/* Etiquetas */}
              {segmentos.map((seg, i) => (
                <Text
                  key={i}
                  x={(canvasWidth - longitudMuro * escala) / 2 + seg.x -margen+seg.w / 2 - 30} // Relativo al muro exterior
                  y={(canvasHeight - altura * escala) / 2 + 10} // Relativo al muro exterior
                  text={seg.label}
                  fontSize={24}
                  fill={seg.color}
                  fontStyle="bold"
                />
              ))}
              {/* Altura */}
              <Text
                x={(canvasWidth - longitudMuro * escala) / 2 - 80} // Relativo al muro exterior
                y={(canvasHeight - altura * escala) / 2 + (altura * escala) / 2 - 20} // Relativo al muro exterior
                text={`${altura}cm`}
                fontSize={28}
                fill="#0f0"
                fontStyle="bold"
              />
              {/* Ancho total */}
              <Text
                x={(canvasWidth - longitudMuro * escala) / 2 + (longitudMuro * escala) / 2 - 60} // Relativo al muro exterior
                y={(canvasHeight - altura * escala) / 2 + altura * escala + 10} // Relativo al muro exterior
                text={`${longitudMuro} cm`}
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