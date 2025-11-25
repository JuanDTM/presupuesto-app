/* @jsxRuntime classic */
/* @jsx React.createElement */
import React from "react";
import "./ReformaTotalModal.css"; 
import ProyectoConstruccion from "./ProyectoConstruccion";

export default function ReformaTotalModal({ visible, onClose }) {
  if (!visible) return null;

  const handleClose = () => {
    onClose?.();
  };

  return (
    <div className="reforma-total-overlay">
      <div className="reforma-total-modal">
        <header className="reforma-total__header">
          <div className="reforma-total__title">
            <span className="reforma-total__badge" aria-hidden="true">
              🏗️
            </span>
            <div>
              <h1>Construcción total</h1>
              <p>Diseña la retícula y exporta insumos para cotización</p>
            </div>
          </div>
          <button
            type="button"
            className="reforma-total__close"
            onClick={handleClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </header>

        <div className="reforma-total__layout">
          <ProyectoConstruccion />
        </div>
      </div>
    </div>
  );
}
