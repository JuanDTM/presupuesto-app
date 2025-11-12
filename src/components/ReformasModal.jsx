import React, { useMemo, useState } from "react";
import "./ReformasModal.css";
import MurosModal from "../modules/muro/components/MurosModal";
import PisosModal from "./PisosModal";
import CieloRasoModal from "./CieloRasoModal";
import VigasModal from "./VigasModal";
import ColumnasModal from "./ColumnasModal";
import CimientosModal from "./CimientosModal";
import TechosModal from "./TechosModal";

const CATEGORIES = [
  {
    id: "MUROS",
    label: "Muros",
    area: "muros",
    image:
      "https://images.pexels.com/photos/1227515/pexels-photo-1227515.jpeg",
  },
  {
    id: "PISOS",
    label: "Pisos",
    area: "pisos",
    image:
      "https://www.sioingenieria.com/portal/shared/rs.php?rsid=1993",
  },
  {
    id: "CUBIERTA",
    label: "Cubierta",
    area: "cubierta",
    image:
      "https://thumbs.dreamstime.com/b/techador-que-trabaja-en-la-estructura-de-techo-construcci%C3%B3n-el-concepto-chapa-obra-214657366.jpg",
  },
  {
    id: "CIELO RASO",
    label: "Cielo raso",
    area: "cielo",
    image:
      "https://images.pexels.com/photos/6474129/pexels-photo-6474129.jpeg",
  },
  {
    id: "VIGAS",
    label: "Vigas",
    area: "vigas",
    image:
      "https://i.ytimg.com/vi/BJmQGmZBNeM/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLAyUxJaWUoaUYkfHSC5Cm7RJ0j8DQ",
  },
  {
    id: "COLUMNAS",
    label: "Columnas",
    area: "columnas",
    image:
      "https://acerostorices.com/wp-content/uploads/2023/05/albanil-haciendo-un-armado-de-columna.jpg",
  },
  {
    id: "CIMIENTOS",
    label: "Cimientos",
    area: "cimientos",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgoR-ryvcl-ObNTckjhvgdlMzJ3cN--HOWPQ&s",
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