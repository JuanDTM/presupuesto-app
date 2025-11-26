import React, { useMemo, useState } from "react";
import "./ReformasModal.css";
import MurosModal from "../modules/muro/components/MurosModal";
import PisosModal from "../modules/piso/components/PisosModal";
import CieloRasoModal from "../modules/cielo/components/CieloRasoModal";
import VigasModal from "../modules/vigas/components/VigasModal";
import ColumnasModal from "../modules/columnas/components/ColumnasModal";
import CimientosModal from "../modules/cimientos/components/CimientosModal";
import TechosModal from "../modules/cubierta/components/TechosModal";
import HidraulicaModal from "../modules/hiraulicas/components/HidraulicaModal";

const CATEGORIES = [
  {
    id: "MUROS",
    label: "Muros",
    area: "muros",
    image:
      "/reformas/muros.webp",
    tutorialUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    id: "PISOS",
    label: "Pisos",
    area: "pisos",
    image:
      "/reformas/piso.jpg",
    tutorialUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    id: "CUBIERTA",
    label: "Cubierta",
    area: "cubierta",
    image:
      "/reformas/techo.jpg",
    tutorialUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    id: "CIELO RASO",
    label: "Cielo raso",
    area: "cielo",
    image:
      "/reformas/cielo-raso.webp",
    tutorialUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    id: "VIGAS",
    label: "Vigas",
    area: "vigas",
    image:
      "/reformas/viga.webp",
    tutorialUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    id: "COLUMNAS",
    label: "Columnas",
    area: "columnas",
    image:
      "/reformas/columnas.webp",
    tutorialUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    id: "CIMIENTOS",
    label: "Cimientos",
    area: "cimientos",
    image:
      "/reformas/cimientos.webp",
    tutorialUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    id: "HIRAULICAS",
    label: "Hidráulicas",
    area: "hidraulica",
    image:
      "/reformas/hidra.jpg",
    tutorialUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
];

export default function ReformasModal({ visible, onClose }) {
  const [opcionSeleccionada, setOpcionSeleccionada] = useState(null);

  const renderContenido = useMemo(() => {
    switch (opcionSeleccionada) {
      case "MUROS":
        return <MurosModal onClose={onClose} onVolver={() => setOpcionSeleccionada(null)} />;
      case "PISOS":
        return <PisosModal onClose={onClose} onVolver={() => setOpcionSeleccionada(null)} />;
      case "CIELO RASO":
        return <CieloRasoModal onClose={onClose} onVolver={() => setOpcionSeleccionada(null)} />;
      case "VIGAS":
        return <VigasModal onClose={onClose} onVolver={() => setOpcionSeleccionada(null)} />;
      case "COLUMNAS":
        return <ColumnasModal onClose={onClose} onVolver={() => setOpcionSeleccionada(null)} />;
      case "CIMIENTOS":
        return <CimientosModal onClose={onClose} onVolver={() => setOpcionSeleccionada(null)} />;
      case "CUBIERTA":
        return <TechosModal onClose={onClose} onVolver={() => setOpcionSeleccionada(null)} />;
      case "HIRAULICAS":
        return <HidraulicaModal onClose={onClose} onVolver={() => setOpcionSeleccionada(null)} />;
      default:
        return null;
    }
  }, [opcionSeleccionada, onClose]);

  if (!visible) return null;

  const handleClose = () => {
    setOpcionSeleccionada(null);
    onClose?.();
  };

  return (
    <div className="reformas-overlay">
      <div className="reformas-modal">
        <header className="reformas-modal__header">
          <div className="reformas-modal__title">
            <span className="reformas-modal__badge" aria-hidden="true">
              🛠️
            </span>
            <div>
              <h1>Cotizar reformas</h1>
              <p>En construcción residencial</p>
            </div>
          </div>
          <button
            type="button"
            className="reformas-modal__close"
            onClick={handleClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </header>

        <div className="reformas-modal__layout">
          <div className="reformas-modal__main">
            {!opcionSeleccionada ? (
              <>
                <p className="reformas-modal__subtitle">
                  Selecciona una categoría para cotizar y personaliza la estimación según tu obra.
                </p>
                <div className="bento-grid">
                  {CATEGORIES.map((category) => (
                    <button
                      key={category.id}
                      className={`bento-item bento-${category.area}`}
                      type="button"
                      onClick={() => setOpcionSeleccionada(category.id)}
                    >
                      <div className="bento-item__media">
                        <img src={category.image} alt={category.label} loading="lazy" />
                      </div>
                      <a
                        href={category.tutorialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bento-item__tutorial"
                        onClick={(e) => e.stopPropagation()}
                        title="Ver tutorial"
                      >
                        <span className="tutorial-icon">▶</span>
                        <span className="tutorial-text">Tutorial</span>
                      </a>
                      <div className="bento-item__info">
                        <span className="bento-item__label">{category.label}</span>
                        <span className="bento-item__arrow" aria-hidden="true">
                          →
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="reformas-modal__step">{renderContenido}</div>
            )}
          </div>
        </div>

        {!opcionSeleccionada && (
          <footer className="reformas-modal__footer">
            <button type="button" className="reformas-modal__footer-btn" onClick={handleClose}>
              Cerrar
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}