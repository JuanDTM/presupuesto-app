
import React, { useState, useEffect } from "react";
import { Stage, Layer, Rect, Text } from "react-konva";
import "./MuroEditorModal.css";

export default function MuroPuertaVentanaEditor({
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
    anchoPuerta > 0 &&
    muro1 >= 0 &&
    muro2 >= 0 &&
    anchoTotal <= cotaLibre;

  if (!visible) return null;

  return (
    <div className="muro-editor-overlay">
      <div className="muro-editor">
        <div className="muro-editor__panel">
          <div className="muro-editor__title">
            <h2>Pared con puerta y ventana</h2>
            <p>Ajusta de forma visual la ubicación de la puerta y la ventana para construir tu cotización.</p>
          </div>

          <div className="muro-editor__fields">
            <div className="muro-editor__field">
              <label className="muro-editor__label" htmlFor="editor-pv-ventana-ancho">
                Ancho de la ventana (cm)
              </label>
              <input
                id="editor-pv-ventana-ancho"
                type="number"
                min={1}
                max={Math.floor(cotaLibre)}
                value={anchoVentana}
                onChange={(e) => setAnchoVentana(Number(e.target.value))}
                className="muro-editor__input muro-editor__input--compact"
              />
            </div>

            <div className="muro-editor__field">
              <label className="muro-editor__label" htmlFor="editor-pv-ventana-alto">
                Alto de la ventana (cm)
              </label>
              <input
                id="editor-pv-ventana-alto"
                type="number"
                min={1}
                max={Math.floor(altura)}
                value={altoVentana}
                onChange={(e) => setAltoVentana(Number(e.target.value))}
                className="muro-editor__input muro-editor__input--compact"
              />
            </div>

            <div className="muro-editor__field">
              <label className="muro-editor__label" htmlFor="editor-pv-puerta-ancho">
                Ancho de la puerta (cm)
              </label>
              <input
                id="editor-pv-puerta-ancho"
                type="number"
                min={1}
                max={Math.floor(cotaLibre)}
                value={anchoPuerta}
                onChange={(e) => setAnchoPuerta(Number(e.target.value))}
                className="muro-editor__input muro-editor__input--compact"
              />
            </div>

            <div className="muro-editor__field">
              <span className="muro-editor__label">Posición de la puerta</span>
              <div className="muro-editor__radio-group">
                <label>
                  <input
                    type="radio"
                    name="posicion-puerta"
                    value="izquierda"
                    checked={posicionPuerta === "izquierda"}
                    onChange={(e) => setPosicionPuerta(e.target.value)}
                  />
                  Izquierda
                </label>
                <label>
                  <input
                    type="radio"
                    name="posicion-puerta"
                    value="derecha"
                    checked={posicionPuerta === "derecha"}
                    onChange={(e) => setPosicionPuerta(e.target.value)}
                  />
                  Derecha
                </label>
              </div>
            </div>

            <div className="muro-editor__field">
              <label className="muro-editor__label" htmlFor="editor-pv-muro1">
                Largo tramo inicial (cm)
              </label>
              <input
                id="editor-pv-muro1"
                type="number"
                min={0}
                max={Math.floor(cotaLibre)}
                value={muro1}
                onChange={(e) => setMuro1(Number(e.target.value))}
                className="muro-editor__input muro-editor__input--compact"
              />
            </div>

            <div className="muro-editor__field">
              <label className="muro-editor__label" htmlFor="editor-pv-muro2">
                Largo tramo final (cm)
              </label>
              <input
                id="editor-pv-muro2"
                type="number"
                min={0}
                max={Math.floor(cotaLibre)}
                value={muro2}
                onChange={(e) => setMuro2(Number(e.target.value))}
                className="muro-editor__input muro-editor__input--compact"
              />
            </div>
          </div>

          <div className="muro-editor__stats">
            <span>
              Total utilizado: <strong>{Math.round(anchoTotal)} cm</strong> de {Math.round(cotaLibre)} cm disponibles.
            </span>
            {!datosValidos && (
              <span className="muro-editor__warning">Reduce las dimensiones, el diseño supera la longitud disponible.</span>
            )}
            <span>Altura actual: {altura} cm</span>
          </div>

          <div className="muro-editor__actions">
            <button
              type="button"
              className="muro-editor__button muro-editor__button--primary"
              onClick={() => {
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
                  escala,
                  margen,
                  x1,
                  y1,
                  x2,
                  y2,
                  id: muroInicial.id,
                };
                onSave(datos);
              }}
              disabled={!datosValidos}
            >
              Guardar cambios
            </button>
            <button
              type="button"
              className="muro-editor__button muro-editor__button--ghost"
              onClick={onClose}
            >
              Cancelar
            </button>
          </div>
        </div>

        <div className="muro-editor__canvas">
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
              {/* Segmentos (muros, ventana y puerta) */}
              {segmentos.map((seg, i) => (
                <Rect
                  key={i}
                  x={(canvasWidth - cotaLibre * escala) / 2 + seg.x - margen} // Relativo al muro exterior
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
  );
}