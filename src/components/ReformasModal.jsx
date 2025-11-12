import React, { useState } from "react";
import "./ReformasModal.css";
import MurosModal from "./MurosModal";
import PisosModal from "./PisosModal";
import CieloRasoModal from "./CieloRasoModal";
import VigasModal from "./VigasModal";
import ColumnasModal from "./ColumnasModal";
import CimientosModal from "./CimientosModal";
import TechosModal from "./TechosModal";

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
                <li onClick={() => setOpcionSeleccionada("CUBIERTA")}>CUBIERTA</li>
                <li onClick={() => setOpcionSeleccionada("CIELO RASO")}>CIELO RASO</li>
                <li onClick={() => setOpcionSeleccionada("VIGAS")}>VIGAS</li>
                <li onClick={() => setOpcionSeleccionada("COLUMNAS")}>COLUMNAS</li>
                <li onClick={() => setOpcionSeleccionada("CIMIENTOS")}>CIMIENTOS</li>
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

        {opcionSeleccionada === "CIELO RASO" && (
          <CieloRasoModal
            onClose={onClose}
            onVolver={() => setOpcionSeleccionada(null)}
          />
        )}
        {opcionSeleccionada === "VIGAS" && (
          <VigasModal
            onClose={onClose}
            onVolver={() => setOpcionSeleccionada(null)}
          />
        )}
        {opcionSeleccionada === "COLUMNAS" && (
          <ColumnasModal
            onClose={onClose}
            onVolver={() => setOpcionSeleccionada(null)}
          />
        )}
        {opcionSeleccionada === "CIMIENTOS" && (
          <CimientosModal
            onClose={onClose}
            onVolver={() => setOpcionSeleccionada(null)}
          />
        )}
        {opcionSeleccionada === "CUBIERTA" && (
          <TechosModal
            onClose={onClose}
            onVolver={() => setOpcionSeleccionada(null)}
          />
        )}
      </div>
    </div>
  );
}