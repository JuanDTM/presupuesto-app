
import React, { useState, useEffect } from "react";
import { Stage, Layer, Rect, Text } from "react-konva";
import "./MuroEditorModal.css";

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

  const cotaLibre = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) / 2;
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
    const datosValidos = anchoPuerta > 0 && muro1 >= 0 && muro2 >= 0 && anchoTotal <= cotaLibre;

  if (!visible) return null;

  return (
    <div className="muro-editor-overlay">
      <div className="muro-editor">
        <div className="muro-editor__panel">
          <div className="muro-editor__title">
            <h2>Muro con puerta</h2>
            <p>Define la apertura de la puerta y los segmentos laterales para ajustar la cotización.</p>
          </div>

          <div className="muro-editor__fields">
            <div className="muro-editor__field">
              <label className="muro-editor__label" htmlFor="editor-puerta-ancho">
                Ancho de la puerta (cm)
              </label>
              <input
                id="editor-puerta-ancho"
                type="number"
                min={1}
                max={Math.floor(cotaLibre)}
                value={anchoPuerta}
                onChange={(e) => setAnchoPuerta(Number(e.target.value))}
                className="muro-editor__input muro-editor__input--compact"
              />
            </div>

            <div className="muro-editor__field">
              <label className="muro-editor__label" htmlFor="editor-puerta-muro1">
                Largo del primer tramo (cm)
              </label>
              <input
                id="editor-puerta-muro1"
                type="number"
                min={0}
                max={Math.floor(cotaLibre)}
                value={muro1}
                onChange={(e) => setMuro1(Number(e.target.value))}
                className="muro-editor__input muro-editor__input--compact"
              />
            </div>

            <div className="muro-editor__field">
              <label className="muro-editor__label" htmlFor="editor-puerta-muro2">
                Largo del segundo tramo (cm)
              </label>
              <input
                id="editor-puerta-muro2"
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
              <span className="muro-editor__warning">Ajusta las medidas: superan la longitud disponible.</span>
            )}
            <span>Altura actual: {altura} cm</span>
          </div>

          <div className="muro-editor__actions">
            <button
              type="button"
              className="muro-editor__button muro-editor__button--primary"
              onClick={() => {
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
  );
}