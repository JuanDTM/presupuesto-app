import React, { useState } from "react";
import "./MurosModal.css";
import MuroPuertaEditor from "./MuroPuertaEditor";
import MuroVentanaEditor from "./MuroVentanaEditor";
import MuroPuertaVentanaEditor from "./MuroPuertaVentanaEditor";

export default function MurosModal({ onClose, onVolver }) {
  const [muroDatos, setMuroDatos] = useState({
    // Campos generales del muro
    cinta_corona: 1,
    viga_cimiento: 1,
    cinta_lateral: 1,
    pañete: 2,
    estuco: 2,
    pintura: 2,
    textura: 0,
    acabados_externos: 1,
    mamposteria: 1,
    ladrillo: 4,
    tipo: 2,
    
    // Datos del muro
    muro: {
      tipo: "muroEntero",
      piso: "1 de 1",
      ancho_estructura: "",
      ancho: "",
      clase: 1,
      estructura: 1,
      alto: "",
      medida1: 0,
      medida2: 0,
      medida3: 0,
      ventana: null,
    },
  });

  const [mostrarEditor, setMostrarEditor] = useState(false);
  const [cotizacion, setCotizacion] = useState(null);

  const enviarMuro = async () => {
    let payload = {
      cinta_corona: Number(muroDatos.cinta_corona),
      viga_cimiento: Number(muroDatos.viga_cimiento),
      cinta_lateral: Number(muroDatos.cinta_lateral),
      pañete: Number(muroDatos.pañete),
      estuco: Number(muroDatos.estuco),
      pintura: Number(muroDatos.pintura),
      textura: Number(muroDatos.textura),
      acabados_externos: Number(muroDatos.acabados_externos),
      mamposteria: Number(muroDatos.mamposteria),
      ladrillo: Number(muroDatos.ladrillo),
      tipo: Number(muroDatos.tipo),
      muro: {
        tipo: muroDatos.muro.tipo,
        piso: muroDatos.muro.piso,
        ancho_estructura: Number(muroDatos.muro.ancho_estructura),
        ancho: Number(muroDatos.muro.ancho),
        clase: Number(muroDatos.muro.clase),
        estructura: Number(muroDatos.muro.estructura),
        alto: Number(muroDatos.muro.alto),
        medida1: Number(muroDatos.muro.medida1),
        medida2: Number(muroDatos.muro.medida2),
        medida3: Number(muroDatos.muro.medida3),
        ventana: muroDatos.muro.ventana,
      },
    };

    console.log("📤 Payload enviado:", JSON.stringify(payload, null, 2));

    try {
      const res = await fetch("http://174.129.83.62/api/cotizacion-muro", {
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
COTIZACIÓN DE MURO
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
    a.download = "cotizacion_muro.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (cotizacion) {
    return (
      <div className="cotizacion-resultado">
        <h2>✅ Cotización de Muro Recibida</h2>
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
            setMuroDatos({
              cinta_corona: 1,
              viga_cimiento: 1,
              cinta_lateral: 1,
              pañete: 2,
              estuco: 2,
              pintura: 2,
              textura: 0,
              acabados_externos: 1,
              mamposteria: 1,
              ladrillo: 4,
              tipo: 2,
              muro: {
                tipo: "muroEntero",
                piso: "1 de 1",
                ancho_estructura: "",
                ancho: "",
                clase: 1,
                estructura: 1,
                alto: "",
                medida1: 0,
                medida2: 0,
                medida3: 0,
                ventana: null,
              },
            });
          }} className="btn-volver">Nueva cotización</button>
          <button onClick={onClose} className="btn-cerrar">Cerrar</button>
        </div>
      </div>
    );
  }

  if (mostrarEditor) {
    if (muroDatos.muro.tipo === "muroPuerta") {
      return <MuroPuertaEditor muroDatos={muroDatos} setMuroDatos={setMuroDatos} onVolver={() => setMostrarEditor(false)} />;
    } else if (muroDatos.muro.tipo === "muroVentana") {
      return <MuroVentanaEditor muroDatos={muroDatos} setMuroDatos={setMuroDatos} onVolver={() => setMostrarEditor(false)} />;
    } else if (muroDatos.muro.tipo === "muroPuertaVentana") {
      return <MuroPuertaVentanaEditor muroDatos={muroDatos} setMuroDatos={setMuroDatos} onVolver={() => setMostrarEditor(false)} />;
    }
  }

  return (
    <div className="formulario-muro">
      <h2>🧱 Cotización de Muros</h2>

      <h3>📐 Configuración del Muro</h3>
      <div className="grid-form">
        <label>
          Tipo de muro:
          <select value={muroDatos.muro.tipo} onChange={(e) => setMuroDatos({ ...muroDatos, muro: { ...muroDatos.muro, tipo: e.target.value } })}>
            <option value="muroEntero">Muro Entero</option>
            <option value="muroPuerta">Muro con Puerta</option>
            <option value="muroVentana">Muro con Ventana</option>
            <option value="muroPuertaVentana">Muro con Puerta y Ventana</option>
          </select>
        </label>

        <label>
          Piso:
          <select value={muroDatos.muro.piso} onChange={(e) => setMuroDatos({ ...muroDatos, muro: { ...muroDatos.muro, piso: e.target.value } })}>
            <option value="1 de 1">1 de 1</option>
            <option value="1 de 2">1 de 2</option>
            <option value="1 de 3">1 de 3</option>
            <option value="2 de 2">2 de 2</option>
            <option value="2 de 3">2 de 3</option>
            <option value="3 de 3">3 de 3</option>
          </select>
        </label>

        <label>
          Ancho estructura (eje a eje) cm:
          <input type="number" value={muroDatos.muro.ancho_estructura} onChange={(e) => setMuroDatos({ ...muroDatos, muro: { ...muroDatos.muro, ancho_estructura: e.target.value } })} />
        </label>

        <label>
          Ancho libre (cm):
          <input type="number" value={muroDatos.muro.ancho} onChange={(e) => setMuroDatos({ ...muroDatos, muro: { ...muroDatos.muro, ancho: e.target.value } })} />
        </label>

        <label>
          Alto (cm):
          <input type="number" value={muroDatos.muro.alto} onChange={(e) => setMuroDatos({ ...muroDatos, muro: { ...muroDatos.muro, alto: e.target.value } })} />
        </label>

        <label>
          Clase de viga:
          <select value={muroDatos.muro.clase} onChange={(e) => setMuroDatos({ ...muroDatos, muro: { ...muroDatos.muro, clase: Number(e.target.value) } })}>
            <option value="0">Sin carga</option>
            <option value="1">Carga normal</option>
            <option value="2">Carga central</option>
          </select>
        </label>

        <label>
          ¿Es estructural?
          <select value={muroDatos.muro.estructura} onChange={(e) => setMuroDatos({ ...muroDatos, muro: { ...muroDatos.muro, estructura: Number(e.target.value) } })}>
            <option value="1">Sí</option>
            <option value="0">No</option>
          </select>
        </label>
      </div>

      <h3>🔧 Elementos Estructurales</h3>
      <div className="grid-form">
        <label>
          Cinta corona:
          <select value={muroDatos.cinta_corona} onChange={(e) => setMuroDatos({ ...muroDatos, cinta_corona: Number(e.target.value) })}>
            <option value="0">No lleva</option>
            <option value="1">Sí lleva</option>
          </select>
        </label>

        <label>
          Viga de cimiento:
          <select value={muroDatos.viga_cimiento} onChange={(e) => setMuroDatos({ ...muroDatos, viga_cimiento: Number(e.target.value) })}>
            <option value="0">No lleva</option>
            <option value="1">Sí lleva</option>
          </select>
        </label>

        <label>
          Cinta lateral:
          <select value={muroDatos.cinta_lateral} onChange={(e) => setMuroDatos({ ...muroDatos, cinta_lateral: Number(e.target.value) })}>
            <option value="0">No lleva</option>
            <option value="1">Un lado</option>
            <option value="2">Ambos lados</option>
          </select>
        </label>

        <label>
          Tipo de ladrillo:
          <select value={muroDatos.ladrillo} onChange={(e) => setMuroDatos({ ...muroDatos, ladrillo: Number(e.target.value) })}>
            <option value="1">Farol 10x20x30</option>
            <option value="4">Farol 12x20x30</option>
            <option value="6">Tolete 10x6x20</option>
          </select>
        </label>

        <label>
          Tipo de resistencia:
          <select value={muroDatos.tipo} onChange={(e) => setMuroDatos({ ...muroDatos, tipo: Number(e.target.value) })}>
            <option value="0">Peso muy bajo</option>
            <option value="1">Peso bajo</option>
            <option value="2">Peso medio</option>
            <option value="3">Peso alto</option>
          </select>
        </label>

        <label>
          Mampostería:
          <select value={muroDatos.mamposteria} onChange={(e) => setMuroDatos({ ...muroDatos, mamposteria: Number(e.target.value) })}>
            <option value="0">No lleva</option>
            <option value="1">Sí lleva</option>
          </select>
        </label>
      </div>

      <h3>🎨 Acabados</h3>
      <div className="grid-form">
        <label>
          Pañete:
          <select value={muroDatos.pañete} onChange={(e) => setMuroDatos({ ...muroDatos, pañete: Number(e.target.value) })}>
            <option value="0">No lleva</option>
            <option value="1">Una cara</option>
            <option value="2">Ambas caras</option>
          </select>
        </label>

        <label>
          Estuco:
          <select value={muroDatos.estuco} onChange={(e) => setMuroDatos({ ...muroDatos, estuco: Number(e.target.value) })}>
            <option value="0">No lleva</option>
            <option value="1">Una cara</option>
            <option value="2">Ambas caras</option>
          </select>
        </label>

        <label>
          Pintura:
          <select value={muroDatos.pintura} onChange={(e) => setMuroDatos({ ...muroDatos, pintura: Number(e.target.value) })}>
            <option value="0">No lleva</option>
            <option value="1">Una cara</option>
            <option value="2">Ambas caras</option>
          </select>
        </label>

        <label>
          Textura:
          <select value={muroDatos.textura} onChange={(e) => setMuroDatos({ ...muroDatos, textura: Number(e.target.value) })}>
            <option value="0">No lleva</option>
            <option value="1">Una cara</option>
            <option value="2">Ambas caras</option>
          </select>
        </label>

        <label>
          Acabados externos:
          <select value={muroDatos.acabados_externos} onChange={(e) => setMuroDatos({ ...muroDatos, acabados_externos: Number(e.target.value) })}>
            <option value="0">No lleva</option>
            <option value="1">Sí lleva</option>
          </select>
        </label>
      </div>

      {muroDatos.muro.tipo !== "muroEntero" && (
        <button onClick={() => setMostrarEditor(true)} className="btn-editor">🎨 Abrir editor gráfico para puertas/ventanas</button>
      )}

      <div className="acciones">
        <button onClick={enviarMuro} className="btn-aceptar">Enviar cotización</button>
        <button onClick={onVolver} className="btn-volver">Volver</button>
      </div>
    </div>
  );
}