import React, { useState } from "react";
import "./VigasModal.css";

export default function VigasModal({ onClose, onVolver }) {
  const [vigas, setVigas] = useState([]);
  const [vigasCimiento, setVigasCimiento] = useState([]);
  const [cintas, setCintas] = useState([]);
  const [cotizacion, setCotizacion] = useState(null);

  // Estados para formularios temporales
  const [nuevaViga, setNuevaViga] = useState({
    largo: "",
    tipo: 1,
    id_ladrillo: 1,
    cantidad: 1,
  });

  const [nuevaVigaCimiento, setNuevaVigaCimiento] = useState({
    largo: "",
    cantidad: 1,
  });

  const [nuevaCinta, setNuevaCinta] = useState({
    largo: "",
    id_ladrillo: 1,
    cantidad: 1,
  });

  // Agregar elementos
  const agregarViga = () => {
    if (!nuevaViga.largo || nuevaViga.largo < 1) {
      alert("⚠️ El largo debe ser mayor o igual a 1");
      return;
    }
    setVigas([...vigas, { ...nuevaViga, largo: Number(nuevaViga.largo), cantidad: Number(nuevaViga.cantidad) }]);
    setNuevaViga({ largo: "", tipo: 1, id_ladrillo: 1, cantidad: 1 });
  };

  const agregarVigaCimiento = () => {
    if (!nuevaVigaCimiento.largo || nuevaVigaCimiento.largo < 1) {
      alert("⚠️ El largo debe ser mayor o igual a 1");
      return;
    }
    setVigasCimiento([...vigasCimiento, { ...nuevaVigaCimiento, largo: Number(nuevaVigaCimiento.largo), cantidad: Number(nuevaVigaCimiento.cantidad) }]);
    setNuevaVigaCimiento({ largo: "", cantidad: 1 });
  };

  const agregarCinta = () => {
    if (!nuevaCinta.largo || nuevaCinta.largo < 1) {
      alert("⚠️ El largo debe ser mayor o igual a 1");
      return;
    }
    setCintas([...cintas, { ...nuevaCinta, largo: Number(nuevaCinta.largo), cantidad: Number(nuevaCinta.cantidad) }]);
    setNuevaCinta({ largo: "", id_ladrillo: 1, cantidad: 1 });
  };

  // Eliminar elementos
  const eliminarViga = (index) => {
    setVigas(vigas.filter((_, i) => i !== index));
  };

  const eliminarVigaCimiento = (index) => {
    setVigasCimiento(vigasCimiento.filter((_, i) => i !== index));
  };

  const eliminarCinta = (index) => {
    setCintas(cintas.filter((_, i) => i !== index));
  };

  // Enviar cotización
  const enviarCotizacion = async () => {
    // Validar que al menos uno tenga datos
    if (vigas.length === 0 && vigasCimiento.length === 0 && cintas.length === 0) {
      alert("⚠️ Debes agregar al menos una viga, viga de cimiento o cinta");
      return;
    }

    const payload = {
      vigas: vigas.length > 0 ? vigas : null,
      viga_cimiento: vigasCimiento.length > 0 ? vigasCimiento : null,
      cintas: cintas.length > 0 ? cintas : null,
    };

    console.log("📤 Payload enviado:", JSON.stringify(payload, null, 2));

    try {
      const res = await fetch("http://174.129.83.62/api/cotizacion-vigas", {
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
COTIZACIÓN DE VIGAS, CINTAS Y VIGAS DE CIMIENTO
================================================

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
    a.download = "cotizacion_vigas.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (cotizacion) {
    return (
      <div className="cotizacion-resultado">
        <h2>✅ Cotización de Vigas Recibida</h2>
        <pre className="mano-obra">{cotizacion.mano_obra}</pre>
        <div className="resumen">
          <p><strong>Valor Total Mano de Obra:</strong> ${cotizacion.valor_total_mano_obra}</p>
          <p><strong>Valor Total Materiales:</strong> ${cotizacion.Valor_total_Materiales}</p>
          <p><strong>Valor Total Obra a Todo Costo:</strong> ${cotizacion.Valor_total_obra_a_todo_costo}</p>
        </div>
        <div className="acciones">
          <button onClick={descargarPDF} className="btn-descargar">📄 Descargar PDF</button>
          <button
            onClick={() => {
              setCotizacion(null);
              setVigas([]);
              setVigasCimiento([]);
              setCintas([]);
            }}
            className="btn-volver"
          >
            Nueva cotización
          </button>
          <button onClick={onClose} className="btn-cerrar">Cerrar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="formulario-vigas">
      <h2>🏗️ Cotización de Vigas, Cintas y Vigas de Cimiento</h2>

      {/* VIGAS */}
      <div className="seccion">
        <h3>📏 Vigas</h3>
        <div className="grid-form">
          <label>
            Largo (cm):
            <input
              type="number"
              value={nuevaViga.largo}
              onChange={(e) => setNuevaViga({ ...nuevaViga, largo: e.target.value })}
              min="1"
            />
          </label>

          <label>
            Tipo de viga:
            <select value={nuevaViga.tipo} onChange={(e) => setNuevaViga({ ...nuevaViga, tipo: Number(e.target.value) })}>
              <option value="1">Viga corona delgada</option>
              <option value="2">Viga corona gruesa</option>
              <option value="3">Viga normal</option>
              <option value="4">Viga carga lateral</option>
              <option value="5">Viga carga central</option>
            </select>
          </label>

          <label>
            Tipo de ladrillo:
            <select value={nuevaViga.id_ladrillo} onChange={(e) => setNuevaViga({ ...nuevaViga, id_ladrillo: Number(e.target.value) })}>
              <option value="1">Farol 10x20x30</option>
              <option value="4">Farol 12x20x30</option>
              <option value="6">Tolete 10x6x20</option>
              <option value="7">Tolete 12x6x24.5</option>
            </select>
          </label>

          <label>
            Cantidad:
            <input
              type="number"
              value={nuevaViga.cantidad}
              onChange={(e) => setNuevaViga({ ...nuevaViga, cantidad: e.target.value })}
              min="1"
            />
          </label>
        </div>
        <button onClick={agregarViga} className="btn-agregar">➕ Agregar Viga</button>

        {vigas.length > 0 && (
          <div className="lista-elementos">
            <h4>Vigas agregadas:</h4>
            <table>
              <thead>
                <tr>
                  <th>Largo (cm)</th>
                  <th>Tipo</th>
                  <th>Ladrillo</th>
                  <th>Cantidad</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {vigas.map((viga, index) => (
                  <tr key={index}>
                    <td>{viga.largo}</td>
                    <td>
                      {viga.tipo === 1 && "Corona delgada"}
                      {viga.tipo === 2 && "Corona gruesa"}
                      {viga.tipo === 3 && "Normal"}
                      {viga.tipo === 4 && "Carga lateral"}
                      {viga.tipo === 5 && "Carga central"}
                    </td>
                    <td>
                      {viga.id_ladrillo === 1 && "Farol 10x20x30"}
                      {viga.id_ladrillo === 4 && "Farol 12x20x30"}
                      {viga.id_ladrillo === 6 && "Tolete 10x6x20"}
                      {viga.id_ladrillo === 7 && "Tolete 12x6x24.5"}
                    </td>
                    <td>{viga.cantidad}</td>
                    <td>
                      <button onClick={() => eliminarViga(index)} className="btn-eliminar">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* VIGAS DE CIMIENTO */}
      <div className="seccion">
        <h3>🏗️ Vigas de Cimiento</h3>
        <div className="grid-form">
          <label>
            Largo (cm):
            <input
              type="number"
              value={nuevaVigaCimiento.largo}
              onChange={(e) => setNuevaVigaCimiento({ ...nuevaVigaCimiento, largo: e.target.value })}
              min="1"
            />
          </label>

          <label>
            Cantidad:
            <input
              type="number"
              value={nuevaVigaCimiento.cantidad}
              onChange={(e) => setNuevaVigaCimiento({ ...nuevaVigaCimiento, cantidad: e.target.value })}
              min="1"
            />
          </label>
        </div>
        <button onClick={agregarVigaCimiento} className="btn-agregar">➕ Agregar Viga de Cimiento</button>

        {vigasCimiento.length > 0 && (
          <div className="lista-elementos">
            <h4>Vigas de cimiento agregadas:</h4>
            <table>
              <thead>
                <tr>
                  <th>Largo (cm)</th>
                  <th>Cantidad</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {vigasCimiento.map((viga, index) => (
                  <tr key={index}>
                    <td>{viga.largo}</td>
                    <td>{viga.cantidad}</td>
                    <td>
                      <button onClick={() => eliminarVigaCimiento(index)} className="btn-eliminar">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
            Tipo de ladrillo:
            <select value={nuevaCinta.id_ladrillo} onChange={(e) => setNuevaCinta({ ...nuevaCinta, id_ladrillo: Number(e.target.value) })}>
              <option value="1">Farol 10x20x30</option>
              <option value="4">Farol 12x20x30</option>
              <option value="6">Tolete 10x6x20</option>
              <option value="7">Tolete 12x6x24.5</option>
            </select>
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
        <button onClick={agregarCinta} className="btn-agregar">➕ Agregar Cinta</button>

        {cintas.length > 0 && (
          <div className="lista-elementos">
            <h4>Cintas agregadas:</h4>
            <table>
              <thead>
                <tr>
                  <th>Largo (cm)</th>
                  <th>Ladrillo</th>
                  <th>Cantidad</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {cintas.map((cinta, index) => (
                  <tr key={index}>
                    <td>{cinta.largo}</td>
                    <td>
                      {cinta.id_ladrillo === 1 && "Farol 10x20x30"}
                      {cinta.id_ladrillo === 4 && "Farol 12x20x30"}
                      {cinta.id_ladrillo === 6 && "Tolete 10x6x20"}
                      {cinta.id_ladrillo === 7 && "Tolete 12x6x24.5"}
                    </td>
                    <td>{cinta.cantidad}</td>
                    <td>
                      <button onClick={() => eliminarCinta(index)} className="btn-eliminar">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="acciones">
        <button onClick={enviarCotizacion} className="btn-aceptar">Enviar cotización</button>
        <button onClick={onVolver} className="btn-volver">Volver</button>
      </div>
    </div>
  );
}