import React, { useState } from "react";
import "./CimientosModal.css";

export default function CimientosModal({ onClose, onVolver }) {
  const [columnas, setColumnas] = useState([]);
  const [piso, setPiso] = useState("1 de 1");
  const [resistenciaTerreno, setResistenciaTerreno] = useState([
    { profundidad: 0.2, resistencia: 30.0 },
    { profundidad: 1.2, resistencia: 165.0 },
    { profundidad: 4.5, resistencia: 180.0 },
    { profundidad: 8.0, resistencia: 195.0 },
    { profundidad: 15.0, resistencia: 205.0 },
  ]);
  const [cotizacion, setCotizacion] = useState(null);

  // Estado para agregar columnas
  const [tipoColumna, setTipoColumna] = useState(1);

  // Agregar columna
  const agregarColumna = () => {
    setColumnas([...columnas, { tipo_columna: Number(tipoColumna) }]);
  };

  // Eliminar columna
  const eliminarColumna = (index) => {
    setColumnas(columnas.filter((_, i) => i !== index));
  };

  // Actualizar resistencia del terreno
  const actualizarResistencia = (index, campo, valor) => {
    const nuevaResistencia = [...resistenciaTerreno];
    nuevaResistencia[index][campo] = Number(valor);
    setResistenciaTerreno(nuevaResistencia);
  };

  // Agregar nueva fila de resistencia
  const agregarResistencia = () => {
    setResistenciaTerreno([
      ...resistenciaTerreno,
      { profundidad: 0, resistencia: 0 },
    ]);
  };

  // Eliminar fila de resistencia
  const eliminarResistencia = (index) => {
    if (resistenciaTerreno.length > 1) {
      setResistenciaTerreno(resistenciaTerreno.filter((_, i) => i !== index));
    } else {
      alert("⚠️ Debe haber al menos una medición de resistencia del terreno");
    }
  };

  // Enviar cotización
  const enviarCotizacion = async () => {
    if (columnas.length === 0) {
      alert("⚠️ Debes agregar al menos una columna");
      return;
    }

    if (resistenciaTerreno.length === 0) {
      alert("⚠️ Debes agregar al menos una medición de resistencia del terreno");
      return;
    }

    const payload = {
      columnas: {
        datos: columnas,
      },
      piso: piso,
      resistencia_terreno: resistenciaTerreno,
    };

    console.log("📤 Payload enviado:", JSON.stringify(payload, null, 2));

    try {
      const res = await fetch("http://174.129.83.62/api/cotizacion-cimientos", {
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
COTIZACIÓN DE CIMIENTOS
========================

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
    a.download = "cotizacion_cimientos.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (cotizacion) {
    return (
      <div className="cotizacion-resultado">
        <h2>✅ Cotización de Cimientos Recibida</h2>
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
              setColumnas([]);
              setPiso("1 de 1");
              setResistenciaTerreno([
                { profundidad: 0.2, resistencia: 30.0 },
                { profundidad: 1.2, resistencia: 165.0 },
                { profundidad: 4.5, resistencia: 180.0 },
                { profundidad: 8.0, resistencia: 195.0 },
                { profundidad: 15.0, resistencia: 205.0 },
              ]);
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
    <div className="formulario-cimientos">
      <h2>🏗️ Cotización de Cimientos</h2>

      {/* Selector de piso */}
      <div className="selector-piso">
        <label>
          <strong>Nivel de construcción:</strong>
          <select value={piso} onChange={(e) => setPiso(e.target.value)}>
            <option value="1 de 1">1 de 1 (Un nivel)</option>
            <option value="1 de 2">1 de 2 (Dos niveles)</option>
            <option value="1 de 3">1 de 3 (Tres niveles)</option>
          </select>
        </label>
      </div>

      {/* COLUMNAS */}
      <div className="seccion">
        <h3>🏛️ Columnas</h3>
        <div className="grid-form-columnas">
          <label>
            Tipo de columna:
            <select value={tipoColumna} onChange={(e) => setTipoColumna(Number(e.target.value))}>
              <option value="1">Columna de esquina</option>
              <option value="2">Columna lateral</option>
              <option value="3">Columna de centro</option>
            </select>
          </label>
          <button onClick={agregarColumna} className="btn-agregar">
            ➕ Agregar Columna
          </button>
        </div>

        {columnas.length > 0 && (
          <div className="lista-elementos">
            <h4>Columnas agregadas: {columnas.length}</h4>
            <div className="columnas-grid">
              {columnas.map((col, index) => (
                <div key={index} className="columna-card">
                  <div className="columna-info">
                    <strong>Columna {index + 1}</strong>
                    <span>
                      {col.tipo_columna === 1 && "🔲 Esquina"}
                      {col.tipo_columna === 2 && "📐 Lateral"}
                      {col.tipo_columna === 3 && "⬛ Centro"}
                    </span>
                  </div>
                  <button onClick={() => eliminarColumna(index)} className="btn-eliminar-card">
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* RESISTENCIA DEL TERRENO */}
      <div className="seccion">
        <h3>🌍 Resistencia del Terreno</h3>
        <p className="info-text">
          Ingresa las mediciones de resistencia del terreno a diferentes profundidades (datos del estudio de suelos).
        </p>

        <div className="lista-elementos">
          <table>
            <thead>
              <tr>
                <th>Profundidad (m)</th>
                <th>Resistencia (kN/m²)</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {resistenciaTerreno.map((item, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="number"
                      step="0.1"
                      value={item.profundidad}
                      onChange={(e) => actualizarResistencia(index, "profundidad", e.target.value)}
                      className="input-tabla"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.1"
                      value={item.resistencia}
                      onChange={(e) => actualizarResistencia(index, "resistencia", e.target.value)}
                      className="input-tabla"
                    />
                  </td>
                  <td>
                    <button onClick={() => eliminarResistencia(index)} className="btn-eliminar">
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={agregarResistencia} className="btn-agregar-fila">
            ➕ Agregar medición
          </button>
        </div>
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