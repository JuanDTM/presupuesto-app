import React, { useState, useEffect } from "react";
import "./PisosModal.css";

export default function PisosModal({ onClose, onVolver }) {
  const [pisosDatos, setPisosDatos] = useState({
    largo: "",
    ancho: "",
    areas: [{ largo: "", ancho: "" }],
    losa: "2",
    mortero: "1",
    enchape: "1",
    remodelacion: false,
  });

  const [cotizacion, setCotizacion] = useState(null);
  const [imagenGuia, setImagenGuia] = useState(null);

  // Cargar imagen guardada al montar el componente
  useEffect(() => {
    const imagenGuardada = localStorage.getItem("imagenGuiaPisos");
    if (imagenGuardada) {
      setImagenGuia(imagenGuardada);
    }
  }, []);

  const manejarSubidaImagen = (e) => {
    const archivo = e.target.files[0];
    if (archivo) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imagenBase64 = reader.result;
        setImagenGuia(imagenBase64);
        localStorage.setItem("imagenGuiaPisos", imagenBase64);
        alert("✅ Imagen guardada correctamente");
      };
      reader.readAsDataURL(archivo);
    }
  };

  const agregarArea = () => {
    setPisosDatos({
      ...pisosDatos,
      areas: [...pisosDatos.areas, { largo: "", ancho: "" }],
    });
  };

  const eliminarArea = (index) => {
    const nuevasAreas = pisosDatos.areas.filter((_, i) => i !== index);
    setPisosDatos({ ...pisosDatos, areas: nuevasAreas });
  };

  const actualizarArea = (index, campo, valor) => {
    const nuevasAreas = [...pisosDatos.areas];
    nuevasAreas[index][campo] = valor;
    setPisosDatos({ ...pisosDatos, areas: nuevasAreas });
  };

  const enviarCotizacion = async () => {
    const payload = {
      largo: Number(pisosDatos.largo),
      ancho: Number(pisosDatos.ancho),
      areas: pisosDatos.areas.map((area) => ({
        largo: Number(area.largo),
        ancho: Number(area.ancho),
      })),
      losa: Number(pisosDatos.losa),
      mortero: Number(pisosDatos.mortero),
      enchape: Number(pisosDatos.enchape),
      remodelacion: pisosDatos.remodelacion,
    };

    console.log("📤 Payload enviado:", JSON.stringify(payload, null, 2));

    try {
      const res = await fetch("http://174.129.83.62/api/cotizacion-piso", {
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
COTIZACIÓN DE PISO
==================

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
    a.download = "cotizacion_piso.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (cotizacion) {
    return (
      <div className="cotizacion-resultado">
        <h2>✅ Cotización de Piso Recibida</h2>
        <pre className="mano-obra">{cotizacion.mano_obra}</pre>
        <div className="resumen">
          <p><strong>Valor Total Mano de Obra:</strong> ${cotizacion.valor_total_mano_obra}</p>
          <p><strong>Valor Total Materiales:</strong> ${cotizacion.Valor_total_Materiales}</p>
          <p><strong>Valor Total Obra a Todo Costo:</strong> ${cotizacion.Valor_total_obra_a_todo_costo}</p>
        </div>
        <div className="acciones">
          <button onClick={descargarPDF} className="btn-descargar">📄 Descargar PDF</button>
          <button onClick={() => { setCotizacion(null); setPisosDatos({ largo: "", ancho: "", areas: [{ largo: "", ancho: "" }], losa: "2", mortero: "1", enchape: "1", remodelacion: false }); }} className="btn-volver">Nueva cotización</button>
          <button onClick={onClose} className="btn-cerrar">Cerrar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pisos-modal-contenido">
      <h2>🏠 Cotización de Pisos</h2>

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
            • <strong>Largo y Ancho externos:</strong> Referencia para losa base (solo si NO es remodelación).<br />
            • <strong>Áreas internas:</strong> Áreas reales a cotizar. Puedes agregar múltiples áreas.<br />
            • Si es <strong>remodelación</strong>, solo se consideran las áreas internas.
          </p>
        </div>
      </div>

      <div className="grid-form">
        <label>Largo externo (cm): <input type="number" value={pisosDatos.largo} onChange={(e) => setPisosDatos({ ...pisosDatos, largo: e.target.value })} disabled={pisosDatos.remodelacion} /></label>
        <label>Ancho externo (cm): <input type="number" value={pisosDatos.ancho} onChange={(e) => setPisosDatos({ ...pisosDatos, ancho: e.target.value })} disabled={pisosDatos.remodelacion} /></label>
        <label>Losa: <select value={pisosDatos.losa} onChange={(e) => setPisosDatos({ ...pisosDatos, losa: e.target.value })}><option value="0">Sin losa</option><option value="1">Losa fina de 7cm</option><option value="2">Losa normal de 8cm</option><option value="3">Losa pobre de 10cm</option></select></label>
        <label>Mortero: <select value={pisosDatos.mortero} onChange={(e) => setPisosDatos({ ...pisosDatos, mortero: e.target.value })}><option value="0">Sin mortero</option><option value="1">Mortero de 3cm</option><option value="2">Mortero de 5cm</option><option value="3">Mortero de 7cm</option></select></label>
        <label>Enchape: <select value={pisosDatos.enchape} onChange={(e) => setPisosDatos({ ...pisosDatos, enchape: e.target.value })}><option value="0">Sin enchape</option><option value="1">Cerámica</option><option value="2">Porcelanato</option></select></label>
        <label><input type="checkbox" checked={pisosDatos.remodelacion} onChange={(e) => setPisosDatos({ ...pisosDatos, remodelacion: e.target.checked })} /> ¿Es remodelación?</label>
      </div>

      <h3>📦 Áreas internas</h3>
      {pisosDatos.areas.map((area, index) => (
        <div key={index} className="area-item">
          <label>Largo área {index + 1} (cm): <input type="number" value={area.largo} onChange={(e) => actualizarArea(index, "largo", e.target.value)} /></label>
          <label>Ancho área {index + 1} (cm): <input type="number" value={area.ancho} onChange={(e) => actualizarArea(index, "ancho", e.target.value)} /></label>
          {pisosDatos.areas.length > 1 && <button onClick={() => eliminarArea(index)} className="btn-eliminar">❌</button>}
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