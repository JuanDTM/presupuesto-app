import React, { useState } from "react";
import "./ColumnasModal.css";

export default function ColumnasModal({ onClose, onVolver }) {
  const [idLadrillo, setIdLadrillo] = useState(1);
  const [cintas, setCintas] = useState([]);
  const [columnetasCorona, setColumnetasCorona] = useState([]);
  const [columnetas, setColumnetas] = useState([]);
  const [columnas, setColumnas] = useState([]);
  const [columnasGrandes, setColumnasGrandes] = useState([]);
  const [cotizacion, setCotizacion] = useState(null);

  // Estados para formularios temporales
  const [nuevaCinta, setNuevaCinta] = useState({
    largo: "",
    muros: 0,
    cantidad: 1,
  });

  const [nuevaColumnetaCorona, setNuevaColumnetaCorona] = useState({
    largo: "",
    muros: 0,
    cantidad: 1,
  });

  const [nuevaColumneta, setNuevaColumneta] = useState({
    largo: "",
    muros: 0,
    cantidad: 1,
  });

  const [nuevaColumna, setNuevaColumna] = useState({
    largo: "",
    muros: 0,
    cantidad: 1,
  });

  const [nuevaColumnaGrande, setNuevaColumnaGrande] = useState({
    largo: "",
    muros: 0,
    cantidad: 1,
  });

  // Agregar elementos
  const agregarCinta = () => {
    if (!nuevaCinta.largo || nuevaCinta.largo < 1) {
      alert("⚠️ El largo debe ser mayor o igual a 1");
      return;
    }
    setCintas([
      ...cintas,
      {
        largo: Number(nuevaCinta.largo),
        muros: Number(nuevaCinta.muros),
        cantidad: Number(nuevaCinta.cantidad),
      },
    ]);
    setNuevaCinta({ largo: "", muros: 0, cantidad: 1 });
  };

  const agregarColumnetaCorona = () => {
    if (!nuevaColumnetaCorona.largo || nuevaColumnetaCorona.largo < 1) {
      alert("⚠️ El largo debe ser mayor o igual a 1");
      return;
    }
    setColumnetasCorona([
      ...columnetasCorona,
      {
        largo: Number(nuevaColumnetaCorona.largo),
        muros: Number(nuevaColumnetaCorona.muros),
        cantidad: Number(nuevaColumnetaCorona.cantidad),
      },
    ]);
    setNuevaColumnetaCorona({ largo: "", muros: 0, cantidad: 1 });
  };

  const agregarColumneta = () => {
    if (!nuevaColumneta.largo || nuevaColumneta.largo < 1) {
      alert("⚠️ El largo debe ser mayor o igual a 1");
      return;
    }
    setColumnetas([
      ...columnetas,
      {
        largo: Number(nuevaColumneta.largo),
        muros: Number(nuevaColumneta.muros),
        cantidad: Number(nuevaColumneta.cantidad),
      },
    ]);
    setNuevaColumneta({ largo: "", muros: 0, cantidad: 1 });
  };

  const agregarColumna = () => {
    if (!nuevaColumna.largo || nuevaColumna.largo < 1) {
      alert("⚠️ El largo debe ser mayor o igual a 1");
      return;
    }
    setColumnas([
      ...columnas,
      {
        largo: Number(nuevaColumna.largo),
        muros: Number(nuevaColumna.muros),
        cantidad: Number(nuevaColumna.cantidad),
      },
    ]);
    setNuevaColumna({ largo: "", muros: 0, cantidad: 1 });
  };

  const agregarColumnaGrande = () => {
    if (!nuevaColumnaGrande.largo || nuevaColumnaGrande.largo < 1) {
      alert("⚠️ El largo debe ser mayor o igual a 1");
      return;
    }
    setColumnasGrandes([
      ...columnasGrandes,
      {
        largo: Number(nuevaColumnaGrande.largo),
        muros: Number(nuevaColumnaGrande.muros),
        cantidad: Number(nuevaColumnaGrande.cantidad),
      },
    ]);
    setNuevaColumnaGrande({ largo: "", muros: 0, cantidad: 1 });
  };

  // Eliminar elementos
  const eliminarCinta = (index) => {
    setCintas(cintas.filter((_, i) => i !== index));
  };

  const eliminarColumnetaCorona = (index) => {
    setColumnetasCorona(columnetasCorona.filter((_, i) => i !== index));
  };

  const eliminarColumneta = (index) => {
    setColumnetas(columnetas.filter((_, i) => i !== index));
  };

  const eliminarColumna = (index) => {
    setColumnas(columnas.filter((_, i) => i !== index));
  };

  const eliminarColumnaGrande = (index) => {
    setColumnasGrandes(columnasGrandes.filter((_, i) => i !== index));
  };

  // Enviar cotización
  const enviarCotizacion = async () => {
    // Validar que al menos uno tenga datos
    if (
      cintas.length === 0 &&
      columnetasCorona.length === 0 &&
      columnetas.length === 0 &&
      columnas.length === 0 &&
      columnasGrandes.length === 0
    ) {
      alert("⚠️ Debes agregar al menos un elemento (cinta, columneta o columna)");
      return;
    }

    const payload = {
      id_ladrillo: Number(idLadrillo),
      cintas: cintas.length > 0 ? cintas : null,
      columnetas_corona: columnetasCorona.length > 0 ? columnetasCorona : null,
      columnetas: columnetas.length > 0 ? columnetas : null,
      columnas: columnas.length > 0 ? columnas : null,
      columnas_grandes: columnasGrandes.length > 0 ? columnasGrandes : null,
    };

    console.log("📤 Payload enviado:", JSON.stringify(payload, null, 2));

    try {
      const res = await fetch("http://174.129.83.62/api/cotizacion-columnas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("📥 Status de respuesta:", res.status);

      if (!res.ok) {
        let errorMsg = `Error ${res.status}`;
        try {
          let errorText = await res.text();
          if (errorText.startsWith("a{")) {
            errorText = errorText.substring(1);
          }
          const errorData = JSON.parse(errorText);
          console.error("❌ Error de la API:", errorData);

          if (errorData.message) {
            errorMsg = errorData.message;
          } else if (errorData.error) {
            errorMsg = errorData.error;
          } else if (errorData.errors) {
            errorMsg = Object.values(errorData.errors).flat().join("\n");
          } else {
            errorMsg = JSON.stringify(errorData, null, 2);
          }
        } catch (e) {
          console.error("Error al parsear respuesta:", e);
          errorMsg = await res.text();
        }

        alert(`❌ Error al enviar la cotización:\n\n${errorMsg}`);
        return;
      }

      let responseText = await res.text();
      console.log("📥 Respuesta cruda:", responseText);

      if (responseText.startsWith("a{")) {
        console.warn("⚠️ Se detectó 'a' al inicio de la respuesta, limpiando...");
        responseText = responseText.substring(1);
      }

      const data = JSON.parse(responseText);
      console.log("✅ Respuesta API parseada:", data);
      setCotizacion(data);
      alert("Cotización recibida con éxito ✅");
    } catch (err) {
      console.error("❌ Error de red:", err);
      alert(`❌ Error de conexión:\n\n${err.message}\n\nVerifica que la API esté disponible.`);
    }
  };

  const descargarPDF = () => {
    if (!cotizacion) return;

    const contenido = `
COTIZACIÓN DE COLUMNAS, COLUMNETAS Y CINTAS
============================================

${cotizacion.mano_obra}

-----------------------------------
RESUMEN FINANCIERO
-----------------------------------
Valor Total Mano de Obra: $${cotizacion.valor_total_mano_obra}
Valor Total Materiales: $${cotizacion.Valor_total_Materiales}
Valor Total Obra a Todo Costo: $${cotizacion.Valor_total_obra_a_todo_costo}
    `;

    const blob = new Blob([contenido], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cotizacion_columnas.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (cotizacion) {
    return (
      <div className="cotizacion-resultado">
        <h2>✅ Cotización de Columnas Recibida</h2>
        <pre className="mano-obra">{cotizacion.mano_obra}</pre>
        <div className="resumen">
          <p>
            <strong>Valor Total Mano de Obra:</strong> ${cotizacion.valor_total_mano_obra}
          </p>
          <p>
            <strong>Valor Total Materiales:</strong> ${cotizacion.Valor_total_Materiales}
          </p>
          <p>
            <strong>Valor Total Obra a Todo Costo:</strong> ${cotizacion.Valor_total_obra_a_todo_costo}
          </p>
        </div>
        <div className="acciones">
          <button onClick={descargarPDF} className="btn-descargar">
            📄 Descargar PDF
          </button>
          <button
            onClick={() => {
              setCotizacion(null);
              setCintas([]);
              setColumnetasCorona([]);
              setColumnetas([]);
              setColumnas([]);
              setColumnasGrandes([]);
            }}
            className="btn-volver"
          >
            Nueva cotización
          </button>
          <button onClick={onClose} className="btn-cerrar">
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="formulario-columnas">
      <h2>🏛️ Cotización de Columnas, Columnetas y Cintas</h2>

      {/* Selector de ladrillo global */}
      <div className="selector-ladrillo">
        <label>
          <strong>Tipo de ladrillo (aplica a todos los elementos):</strong>
          <select value={idLadrillo} onChange={(e) => setIdLadrillo(Number(e.target.value))}>
            <option value="1">Farol 10x20x30</option>
            <option value="4">Farol 12x20x30</option>
            <option value="6">Tolete 10x6x20</option>
            <option value="7">Tolete 12x6x24.5</option>
          </select>
        </label>
      </div>

      {/* CINTAS */}
      <div className="seccion">
        <h3>🔗 Cintas</h3>
        <div className="grid-form">
          <label>
            Largo (cm):
            <input
              type="number"
              value={nuevaCinta.largo}
              onChange={(e) => setNuevaCinta({ ...nuevaCinta, largo: e.target.value })}
              min="1"
            />
          </label>

          <label>
            Muros:
            <input
              type="number"
              value={nuevaCinta.muros}
              onChange={(e) => setNuevaCinta({ ...nuevaCinta, muros: e.target.value })}
              min="0"
            />
          </label>

          <label>
            Cantidad:
            <input
              type="number"
              value={nuevaCinta.cantidad}
              onChange={(e) => setNuevaCinta({ ...nuevaCinta, cantidad: e.target.value })}
              min="1"
            />
          </label>
        </div>
        <button onClick={agregarCinta} className="btn-agregar">
          ➕ Agregar Cinta
        </button>

        {cintas.length > 0 && (
          <div className="lista-elementos">
            <h4>Cintas agregadas:</h4>
            <table>
              <thead>
                <tr>
                  <th>Largo (cm)</th>
                  <th>Muros</th>
                  <th>Cantidad</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {cintas.map((cinta, index) => (
                  <tr key={index}>
                    <td>{cinta.largo}</td>
                    <td>{cinta.muros}</td>
                    <td>{cinta.cantidad}</td>
                    <td>
                      <button onClick={() => eliminarCinta(index)} className="btn-eliminar">
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* COLUMNETAS DE CORONA */}
      <div className="seccion">
        <h3>👑 Columnetas de Corona</h3>
        <div className="grid-form">
          <label>
            Largo (cm):
            <input
              type="number"
              value={nuevaColumnetaCorona.largo}
              onChange={(e) => setNuevaColumnetaCorona({ ...nuevaColumnetaCorona, largo: e.target.value })}
              min="1"
            />
          </label>

          <label>
            Muros:
            <input
              type="number"
              value={nuevaColumnetaCorona.muros}
              onChange={(e) => setNuevaColumnetaCorona({ ...nuevaColumnetaCorona, muros: e.target.value })}
              min="0"
            />
          </label>

          <label>
            Cantidad:
            <input
              type="number"
              value={nuevaColumnetaCorona.cantidad}
              onChange={(e) => setNuevaColumnetaCorona({ ...nuevaColumnetaCorona, cantidad: e.target.value })}
              min="1"
            />
          </label>
        </div>
        <button onClick={agregarColumnetaCorona} className="btn-agregar">
          ➕ Agregar Columneta de Corona
        </button>

        {columnetasCorona.length > 0 && (
          <div className="lista-elementos">
            <h4>Columnetas de corona agregadas:</h4>
            <table>
              <thead>
                <tr>
                  <th>Largo (cm)</th>
                  <th>Muros</th>
                  <th>Cantidad</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {columnetasCorona.map((col, index) => (
                  <tr key={index}>
                    <td>{col.largo}</td>
                    <td>{col.muros}</td>
                    <td>{col.cantidad}</td>
                    <td>
                      <button onClick={() => eliminarColumnetaCorona(index)} className="btn-eliminar">
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* COLUMNETAS */}
      <div className="seccion">
        <h3>🏗️ Columnetas</h3>
        <div className="grid-form">
          <label>
            Largo (cm):
            <input
              type="number"
              value={nuevaColumneta.largo}
              onChange={(e) => setNuevaColumneta({ ...nuevaColumneta, largo: e.target.value })}
              min="1"
            />
          </label>

          <label>
            Muros:
            <input
              type="number"
              value={nuevaColumneta.muros}
              onChange={(e) => setNuevaColumneta({ ...nuevaColumneta, muros: e.target.value })}
              min="0"
            />
          </label>

          <label>
            Cantidad:
            <input
              type="number"
              value={nuevaColumneta.cantidad}
              onChange={(e) => setNuevaColumneta({ ...nuevaColumneta, cantidad: e.target.value })}
              min="1"
            />
          </label>
        </div>
        <button onClick={agregarColumneta} className="btn-agregar">
          ➕ Agregar Columneta
        </button>

        {columnetas.length > 0 && (
          <div className="lista-elementos">
            <h4>Columnetas agregadas:</h4>
            <table>
              <thead>
                <tr>
                  <th>Largo (cm)</th>
                  <th>Muros</th>
                  <th>Cantidad</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {columnetas.map((col, index) => (
                  <tr key={index}>
                    <td>{col.largo}</td>
                    <td>{col.muros}</td>
                    <td>{col.cantidad}</td>
                    <td>
                      <button onClick={() => eliminarColumneta(index)} className="btn-eliminar">
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* COLUMNAS */}
      <div className="seccion">
        <h3>🏛️ Columnas</h3>
        <div className="grid-form">
          <label>
            Largo (cm):
            <input
              type="number"
              value={nuevaColumna.largo}
              onChange={(e) => setNuevaColumna({ ...nuevaColumna, largo: e.target.value })}
              min="1"
            />
          </label>

          <label>
            Muros:
            <input
              type="number"
              value={nuevaColumna.muros}
              onChange={(e) => setNuevaColumna({ ...nuevaColumna, muros: e.target.value })}
              min="0"
            />
          </label>

          <label>
            Cantidad:
            <input
              type="number"
              value={nuevaColumna.cantidad}
              onChange={(e) => setNuevaColumna({ ...nuevaColumna, cantidad: e.target.value })}
              min="1"
            />
          </label>
        </div>
        <button onClick={agregarColumna} className="btn-agregar">
          ➕ Agregar Columna
        </button>

        {columnas.length > 0 && (
          <div className="lista-elementos">
            <h4>Columnas agregadas:</h4>
            <table>
              <thead>
                <tr>
                  <th>Largo (cm)</th>
                  <th>Muros</th>
                  <th>Cantidad</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {columnas.map((col, index) => (
                  <tr key={index}>
                    <td>{col.largo}</td>
                    <td>{col.muros}</td>
                    <td>{col.cantidad}</td>
                    <td>
                      <button onClick={() => eliminarColumna(index)} className="btn-eliminar">
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* COLUMNAS GRANDES */}
      <div className="seccion">
        <h3>🏢 Columnas Grandes</h3>
        <div className="grid-form">
          <label>
            Largo (cm):
            <input
              type="number"
              value={nuevaColumnaGrande.largo}
              onChange={(e) => setNuevaColumnaGrande({ ...nuevaColumnaGrande, largo: e.target.value })}
              min="1"
            />
          </label>

          <label>
            Muros:
            <input
              type="number"
              value={nuevaColumnaGrande.muros}
              onChange={(e) => setNuevaColumnaGrande({ ...nuevaColumnaGrande, muros: e.target.value })}
              min="0"
            />
          </label>

          <label>
            Cantidad:
            <input
              type="number"
              value={nuevaColumnaGrande.cantidad}
              onChange={(e) => setNuevaColumnaGrande({ ...nuevaColumnaGrande, cantidad: e.target.value })}
              min="1"
            />
          </label>
        </div>
        <button onClick={agregarColumnaGrande} className="btn-agregar">
          ➕ Agregar Columna Grande
        </button>

        {columnasGrandes.length > 0 && (
          <div className="lista-elementos">
            <h4>Columnas grandes agregadas:</h4>
            <table>
              <thead>
                <tr>
                  <th>Largo (cm)</th>
                  <th>Muros</th>
                  <th>Cantidad</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {columnasGrandes.map((col, index) => (
                  <tr key={index}>
                    <td>{col.largo}</td>
                    <td>{col.muros}</td>
                    <td>{col.cantidad}</td>
                    <td>
                      <button onClick={() => eliminarColumnaGrande(index)} className="btn-eliminar">
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="acciones">
        <button onClick={enviarCotizacion} className="btn-aceptar">
          Enviar cotización
        </button>
        <button onClick={onVolver} className="btn-volver">
          Volver
        </button>
      </div>
    </div>
  );
}