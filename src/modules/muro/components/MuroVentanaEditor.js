
import React, { useState, useEffect } from "react";
import { Stage, Layer, Rect, Text } from "react-konva";
import "./MuroEditorModal.css";

export default function MuroVentanaEditor({
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
 const [numeroVentana, setNumeroVentana] = useState(1);
 const [muro1, setMuro1] = useState(60);
 const [muro2, setMuro2] = useState(80);
 const [muro3, setMuro3] = useState(0);
  const [alturaMuro, setAlturaMuro] = useState(muroInicial?.alturaMuro || 200);

 // Cuando se abre el modal o cambia el muroInicial, actualiza los estados
 useEffect(() => {
  if (visible) {
    setAnchoVentana(muroInicial.anchoVentana ?? 45);
    setAltoVentana(muroInicial.altoVentana ?? 110);
    setNumeroVentana(muroInicial.numeroVentana ?? 1);
    setMuro1(muroInicial.muro1 ?? 60);
    setMuro2(muroInicial.muro2 ?? 80);
    setMuro3(muroInicial.numeroVentana === 2 ? (muroInicial.muro3 ?? 70) : 0);
  }
}, [visible, muroInicial?.id]);

  // Cálculo de suma total
  const sumaMuros = muro1 + muro2 + (numeroVentana === 2 ? muro3 : 0);
  const sumaVentanas = anchoVentana * numeroVentana;
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
  // Muro1
  segmentos.push({
    x,
    w: muro1 * escala,
    color: "#00ff00",
    label: `${muro1} cm`
  });
  x += muro1 * escala;
  // Ventana1
  segmentos.push({
    x,
    w: anchoVentana * escala,
    color: "#00f0ff",
    label: `${anchoVentana}cm`,
    isVentana: true
  });
  x += anchoVentana * escala;
  // Si hay dos ventanas
  if (numeroVentana === 2) {
    // Muro2
    segmentos.push({
      x,
      w: muro2 * escala,
      color: "#00ff00",
      label: `${muro2} cm`
    });
    x += muro2 * escala;
    // Ventana2
    segmentos.push({
      x,
      w: anchoVentana * escala,
      color: "#00f0ff",
      label: `${anchoVentana}cm`,
      isVentana: true
    });
    x += anchoVentana * escala;
    // Muro3
    segmentos.push({
      x,
      w: muro3 * escala,
      color: "#00ff00",
      label: `${muro3} cm`
    });
    x += muro3 * escala;
  } else {
    // Muro2
    segmentos.push({
      x,
      w: muro2 * escala,
      color: "#00ff00",
      label: `${muro2} cm`
    });
    x += muro2 * escala;
  }

  // Validación mínima
  const datosValidos =
    anchoVentana > 0 &&
    altoVentana > 0 &&
    numeroVentana >= 1 &&
    muro1 >= 0 &&
    muro2 >= 0 &&
    (numeroVentana === 1 || muro3 >= 0) &&
    anchoTotal <= cotaLibre;

  if (!visible) return null;

  return (
    <div className="muro-editor-overlay">
      <div className="muro-editor">
        <div className="muro-editor__panel">
          <div className="muro-editor__title">
            <h2>Pared con ventana</h2>
            <p>Indica la cantidad de ventanas y sus separaciones para estimar materiales y mano de obra.</p>
          </div>

          <div className="muro-editor__fields">
            <div className="muro-editor__field">
              <label className="muro-editor__label" htmlFor="editor-v-ventana-ancho">
                Ancho de la ventana (cm)
              </label>
              <input
                id="editor-v-ventana-ancho"
                type="number"
                min={1}
                max={Math.floor(cotaLibre)}
                value={anchoVentana}
                onChange={(e) => setAnchoVentana(Number(e.target.value))}
                className="muro-editor__input muro-editor__input--compact"
              />
            </div>

            <div className="muro-editor__field">
              <label className="muro-editor__label" htmlFor="editor-v-ventana-alto">
                Alto de la ventana (cm)
              </label>
              <input
                id="editor-v-ventana-alto"
                type="number"
                min={1}
                max={Math.floor(altura)}
                value={altoVentana}
                onChange={(e) => setAltoVentana(Number(e.target.value))}
                className="muro-editor__input muro-editor__input--compact"
              />
            </div>

            <div className="muro-editor__field">
              <label className="muro-editor__label" htmlFor="editor-v-numero">
                Número de ventanas
              </label>
              <select
                id="editor-v-numero"
                value={numeroVentana}
                onChange={(e) => setNumeroVentana(Number(e.target.value))}
                className="muro-editor__select muro-editor__input--compact"
              >
                <option value={1}>Una ventana</option>
                <option value={2}>Dos ventanas</option>
              </select>
            </div>

            <div className="muro-editor__field">
              <label className="muro-editor__label" htmlFor="editor-v-muro1">
                Tramo izquierdo (cm)
              </label>
              <input
                id="editor-v-muro1"
                type="number"
                min={0}
                max={Math.floor(cotaLibre)}
                value={muro1}
                onChange={(e) => setMuro1(Number(e.target.value))}
                className="muro-editor__input muro-editor__input--compact"
              />
            </div>

            <div className="muro-editor__field">
              <label className="muro-editor__label" htmlFor="editor-v-muro2">
                Tramo derecho (cm)
              </label>
              <input
                id="editor-v-muro2"
                type="number"
                min={0}
                max={Math.floor(cotaLibre)}
                value={muro2}
                onChange={(e) => setMuro2(Number(e.target.value))}
                className="muro-editor__input muro-editor__input--compact"
              />
            </div>

            {numeroVentana === 2 && (
              <div className="muro-editor__field">
                <label className="muro-editor__label" htmlFor="editor-v-muro3">
                  Tramo intermedio (cm)
                </label>
                <input
                  id="editor-v-muro3"
                  type="number"
                  min={0}
                  max={Math.floor(cotaLibre)}
                  value={muro3}
                  onChange={(e) => setMuro3(Number(e.target.value))}
                  className="muro-editor__input muro-editor__input--compact"
                />
              </div>
            )}
          </div>

          <div className="muro-editor__stats">
            <span>
              Total utilizado: <strong>{Math.round(anchoTotal)} cm</strong> de {Math.round(cotaLibre)} cm disponibles.
            </span>
            {!datosValidos && (
              <span className="muro-editor__warning">
                Las dimensiones actuales superan el ancho libre del muro, ajusta los tramos.
              </span>
            )}
            <span>Altura actual: {altura} cm</span>
          </div>

          <div className="muro-editor__actions">
            <button
              type="button"
              className="muro-editor__button muro-editor__button--primary"
              onClick={() => {
                const datos = {
                  tipo: "ventana",
                  anchoVentana,
                  altoVentana,
                  numeroVentana,
                  muro1,
                  muro2,
                  muro3: numeroVentana === 2 ? muro3 : 0,
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
              {/* Segmentos (muros y ventanas) */}
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