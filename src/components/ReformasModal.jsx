import React, { useState } from "react";
import "./ReformasModal.css";
import MurosModal from "./MurosModal";
import PisosModal from "./PisosModal";

export default function ReformasModal({ visible, onClose }) {
  const [opcionSeleccionada, setOpcionSeleccionada] = useState(null);

  if (!visible) return null;

  return (
    <div className="overlay">
      <div className="modal">
        <h1 className="titulo">🏗️ COTIZAR REFORMAS EN CONSTRUCCIÓN RESIDENCIAL</h1>

        {!opcionSeleccionada && (
          <>
            <div className="texto-info">
              <p><strong>Selecciona una categoría para cotizar:</strong></p>
              <ul>
                <li onClick={() => setOpcionSeleccionada("MUROS")}>MUROS</li>
                <li onClick={() => setOpcionSeleccionada("PISOS")}>PISOS</li>
                <li>CUBIERTA</li>
                <li>CIELO RASO</li>
                <li>VIGAS</li>
                <li>COLUMNAS</li>
                <li>CIMIENTOS</li>
              </ul>
            </div>
            <button onClick={onClose} className="btn-cerrar">Cerrar</button>
          </>
        )}

        {opcionSeleccionada === "MUROS" && (
          <MurosModal
            onClose={onClose}
            onVolver={() => setOpcionSeleccionada(null)}
          />
        )}

        {opcionSeleccionada === "PISOS" && (
          <PisosModal
            onClose={onClose}
            onVolver={() => setOpcionSeleccionada(null)}
          />
        )}
      </div>
    </div>
  );
}