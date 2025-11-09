import React, { useState, useEffect } from "react";
import "./CieloRasoModal.css";

export default function CieloRasoModal({ onClose, onVolver }) {
  const [cieloRasoDatos, setCieloRasoDatos] = useState({
    areas: [{ largo: "", ancho: "", vacio: "" }],
    tipo: 1,
    estructura: 1,
    laminacion: 1,
    masilla: 1,
    pintura: 1,
  });

  const [cotizacion, setCotizacion] = useState(null);
  const [imagenGuia, setImagenGuia] = useState(null);

  // Cargar imagen guardada
  useEffect(() => {
    const imagenGuardada = localStorage.getItem("imagenGuiaCieloRaso");
    if (imagenGuardada) {
      setImagenGuia(imagenGuardada);
    }
  }, []);

  // Desactivar masilla y pintura si el tipo es PVC (4 o 5)
  useEffect(() => {
    if (cieloRasoDatos.tipo === 4 || cieloRasoDatos.tipo === 5) {
      setCieloRasoDatos((prev) => ({
        ...prev,
        masilla: 0,
        pintura: 0,
      }));
    }
  }, [cieloRasoDatos.tipo]);

  const manejarSubidaImagen = (e) => {
    const archivo = e.target.files[0];
    if (archivo) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imagenBase64 = reader.result;
        setImagenGuia(imagenBase64);
        localStorage.setItem("imagenGuiaCieloRaso", imagenBase64);
        alert("✅ Imagen guardada correctamente");
      };
      reader.readAsDataURL(archivo);
    }
  };

  const agregarArea = () => {
    setCieloRasoDatos({
      ...cieloRasoDatos,
      areas: [...cieloRasoDatos.areas, { largo: "", ancho: "", vacio: "" }],
    });
  };

  const eliminarArea = (index) => {
    const nuevasAreas = cieloRasoDatos.areas.filter((_, i) => i !== index);
    setCieloRasoDatos({ ...cieloRasoDatos, areas: nuevasAreas });
  };

  const actualizarArea = (index, campo, valor) => {
    const nuevasAreas = [...cieloRasoDatos.areas];
    nuevasAreas[index][campo] = valor;
    setCieloRasoDatos({ ...cieloRasoDatos, areas: nuevasAreas });
  };

  const enviarCotizacion = async () => {
    const payload = {
      areas: cieloRasoDatos.areas.map((area) => ({
        largo: Number(area.largo),
        ancho: Number(area.ancho),
        vacio: Number(area.vacio),
      })),
      tipo: Number(cieloRasoDatos.tipo),
      estructura: Number(cieloRasoDatos.estructura),
      laminacion: Number(cieloRasoDatos.laminacion),
      masilla: Number(cieloRasoDatos.masilla),
      pintura: Number(cieloRasoDatos.pintura),
    };

    console.log("📤 Payload enviado:", JSON.stringify(payload, null, 2));

    try {
      const res = await fetch("http://174.129.83.62/api/cotizacion-cielo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let errorMsg = `Error ${res.status}`;
        try {
          let errorText = await res.text();
          if (errorText.startsWith("a{")) errorText = errorText.substring(1);
          const errorData = JSON.parse(errorText);

          if (errorData.message) errorMsg = errorData.message;
          else if (errorData.error) errorMsg = errorData.error;
          else if (errorData.errors) errorMsg = Object.values(errorData.errors).flat().join("\n");
        } catch (e) {
          errorMsg = await res.text();
        }

        alert(`❌ Error:\n\n${errorMsg}`);
        return;
      }

      let responseText = await res.text();
      if (responseText.startsWith("a{")) responseText = responseText.substring(1);

      const data = JSON.parse(responseText);
      setCotizacion(data);
      alert("Cotización recibida ✅");
    } catch (err) {
      alert(`❌ Error de conexión:\n\n${err.message}`);
    }
  };

  const descargarPDF = () => {
    if (!cotizacion) return;

    const contenido = `
COTIZACIÓN DE CIELO RASO
=========================

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
    a.download = "cotizacion_cielo_raso.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (cotizacion) {
    return (
      <div className="cotizacion-resultado">
        <h2>✅ Cotización de Cielo Raso Recibida</h2>
        <pre className="mano-obra">{cotizacion.mano_obra}</pre>
        <div className="resumen">
          <p><strong>Valor Total Mano de Obra:</strong> ${cotizacion.valor_total_mano_obra}</p>
          <p><strong>Valor Total Materiales:</strong> ${cotizacion.Valor_total_Materiales}</p>
          <p><strong>Valor Total Obra a Todo Costo:</strong> ${cotizacion.Valor_total_obra_a_todo_costo}</p>
        </div>
        <div className="acciones">
          <button onClick={descargarPDF} className="btn-descargar">📄 Descargar PDF</button>
          <button onClick={() => {
            setCotizacion(null);
            setCieloRasoDatos({
              areas: [{ largo: "", ancho: "", vacio: "" }],
              tipo: 1,
              estructura: 1,
              laminacion: 1,
              masilla: 1,
              pintura: 1,
            });
          }} className="btn-volver">Nueva cotización</button>
          <button onClick={onClose} className="btn-cerrar">Cerrar</button>
        </div>
      </div>
    );
  }

  const esPVC = cieloRasoDatos.tipo === 4 || cieloRasoDatos.tipo === 5;

  return (
    <div className="cielo-raso-modal-contenido">
      <h2>🏠 Cotización de Cielo Raso</h2>

      <div className="explicacion">
        {imagenGuia ? (
          <img src={imagenGuia} alt="Guía de medidas" className="imagen-explicacion" />
        ) : (
          <div className="placeholder-imagen">📷 No hay imagen de guía</div>
        )}
        <div>
          <input type="file" accept="image/*" onChange={manejarSubidaImagen} />
          <p className="texto-explicacion">
            <strong>📐 Cómo ingresar las medidas:</strong><br />
            • <strong>Largo y Ancho:</strong> Dimensiones del área en cm.<br />
            • <strong>Vacío:</strong> Distancia entre el cielo raso y el techo en cm.<br />
            • Puedes agregar múltiples áreas.<br />
            • Si seleccionas <strong>PVC</strong>, masilla y pintura se desactivan automáticamente.
          </p>
        </div>
      </div>

      <div className="grid-form">
        <label>
          Tipo de cielo raso:
          <select value={cieloRasoDatos.tipo} onChange={(e) => setCieloRasoDatos({ ...cieloRasoDatos, tipo: Number(e.target.value) })}>
            <option value="1">Panel de yeso (Drywall)</option>
            <option value="2">Superboard 6mm (Drywall)</option>
            <option value="3">Superboard 8mm (Drywall)</option>
            <option value="4">PVC sencillo</option>
            <option value="5">PVC diagonal</option>
          </select>
        </label>

        <label>
          Estructura:
          <select value={cieloRasoDatos.estructura} onChange={(e) => setCieloRasoDatos({ ...cieloRasoDatos, estructura: Number(e.target.value) })}>
            <option value="0">No lleva</option>
            <option value="1">Sí lleva</option>
          </select>
        </label>

        <label>
          Laminación:
          <select value={cieloRasoDatos.laminacion} onChange={(e) => setCieloRasoDatos({ ...cieloRasoDatos, laminacion: Number(e.target.value) })}>
            <option value="0">No lleva</option>
            <option value="1">Sí lleva</option>
          </select>
        </label>

        <label>
          Masilla:
          <select 
            value={cieloRasoDatos.masilla} 
            onChange={(e) => setCieloRasoDatos({ ...cieloRasoDatos, masilla: Number(e.target.value) })}
            disabled={esPVC}
          >
            <option value="0">No lleva</option>
            <option value="1">Sí lleva</option>
          </select>
          {esPVC && <span className="nota-desactivado">⚠️ Desactivado (PVC)</span>}
        </label>

        <label>
          Pintura:
          <select 
            value={cieloRasoDatos.pintura} 
            onChange={(e) => setCieloRasoDatos({ ...cieloRasoDatos, pintura: Number(e.target.value) })}
            disabled={esPVC}
          >
            <option value="0">No lleva</option>
            <option value="1">Sí lleva</option>
          </select>
          {esPVC && <span className="nota-desactivado">⚠️ Desactivado (PVC)</span>}
        </label>
      </div>

      <h3>📦 Áreas a cotizar</h3>
      {cieloRasoDatos.areas.map((area, index) => (
        <div key={index} className="area-item">
          <label>
            Largo área {index + 1} (cm):
            <input type="number" value={area.largo} onChange={(e) => actualizarArea(index, "largo", e.target.value)} />
          </label>
          <label>
            Ancho área {index + 1} (cm):
            <input type="number" value={area.ancho} onChange={(e) => actualizarArea(index, "ancho", e.target.value)} />
          </label>
          <label>
            Vacío (cm):
            <input type="number" value={area.vacio} onChange={(e) => actualizarArea(index, "vacio", e.target.value)} />
          </label>
          {cieloRasoDatos.areas.length > 1 && (
            <button onClick={() => eliminarArea(index)} className="btn-eliminar">❌</button>
          )}
        </div>
      ))}

      <button onClick={agregarArea} className="btn-agregar">➕ Agregar área</button>

      <div className="acciones">
        <button onClick={enviarCotizacion} className="btn-aceptar">Enviar cotización</button>
        <button onClick={onVolver} className="btn-volver">Volver</button>
      </div>
    </div>
  );
}