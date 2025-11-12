import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import "./MurosModal.css";
import MuroPuertaEditor from "./MuroPuertaEditor";
import MuroVentanaEditor from "./MuroVentanaEditor";
import MuroPuertaVentanaEditor from "./MuroPuertaVentanaEditor";
import { createMuroDefaultValues, muroSchema } from "../validation/schemas";
import { request } from "../../../lib/httpClient";
import apiUrls from "../../../config/api_urls";

export default function MurosModal({ onClose, onVolver }) {
  const [muroDatos, setMuroDatos] = useState(() => createMuroDefaultValues());
  const [mostrarEditor, setMostrarEditor] = useState(false);
  const [cotizacion, setCotizacion] = useState(null);
  const [stageScale, setStageScale] = useState(1);

  const defaultValues = useMemo(() => createMuroDefaultValues(), []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
    reset,
  } = useForm({
    resolver: zodResolver(muroSchema),
    mode: "onBlur",
    defaultValues,
  });

  const registerField = (path, updater) => {
    const field = register(path);
    return {
      ...field,
      onChange: (event) => {
        field.onChange(event);
        updater(event.target.value);
      },
    };
  };

  const registerNumericField = (path, updater) => {
    const field = register(path);
    return {
      ...field,
      onChange: (event) => {
        field.onChange(event);
        const raw = event.target.value;
        updater(raw === "" ? "" : Number(raw));
      },
    };
  };

  const propsEditor = {
    visible: mostrarEditor,
    onClose: () => setMostrarEditor(false),
    onSave: (datos) => {
      const nuevoMuro = { ...muroDatos.muro };

      if (datos.tipo === "puerta") {
        nuevoMuro.medida1 = datos.muro1 || 0;
        nuevoMuro.medida2 = datos.anchoPuerta || 0;
        nuevoMuro.medida3 = datos.muro2 || 0;
        nuevoMuro.ventana = null;
      } else if (datos.tipo === "ventana") {
        nuevoMuro.medida1 = datos.muro1 || 0;
        nuevoMuro.medida2 = 0;
        nuevoMuro.medida3 = datos.muro2 || 0;
        nuevoMuro.ventana = {
          tipo: datos.numeroVentana === 2 ? "ventanal" : "ventana",
          ancho: datos.anchoVentana || 0,
          alto: datos.altoVentana || 0,
          ubicacion: "centro",
        };
      } else if (datos.tipo === "puertaventana") {
        nuevoMuro.medida1 = datos.muro1 || 0;
        nuevoMuro.medida2 = datos.anchoPuerta || 0;
        nuevoMuro.medida3 = datos.muro2 || 0;
        nuevoMuro.ventana = {
          tipo: "ventana",
          ancho: datos.anchoVentana || 0,
          alto: datos.altoVentana || 0,
          ubicacion: datos.posicionPuerta === "izquierda" ? "derecha" : "izquierda",
        };
      }

      setMuroDatos((prev) => ({
        ...prev,
        muro: nuevoMuro,
      }));

      setMostrarEditor(false);
      alert("✅ Datos del editor guardados");
    },
    nodoA: "A",
    nodoB: "B",
    desplazamiento: 0,
    escala: 1.5,
    margen: 40,
    altura: Number(muroDatos.muro.alto) || 250,
    x1: 0,
    y1: 0,
    x2: Number(muroDatos.muro.ancho) * 2 || 600,
    y2: 0,
    muroInicial: {
      id: Date.now(),
      anchoPuerta: muroDatos.muro.medida2,
      anchoVentana: muroDatos.muro.ventana?.ancho || 45,
      altoVentana: muroDatos.muro.ventana?.alto || 110,
      muro1: muroDatos.muro.medida1,
      muro2: muroDatos.muro.medida3,
      muro3: 0,
      numeroVentana: 1,
      posicionPuerta: "izquierda",
    },
    handleWheel: (e) => {
      e.evt.preventDefault();
      const scaleBy = 1.05;
      const stage = e.target.getStage();
      const oldScale = stage.scaleX();
      const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
      setStageScale(newScale);
    },
    spacePressed: false,
    isPanning: false,
    stageScale: stageScale,
  };

  const enviarCotizacion = async (values) => {
    const merged = {
      ...muroDatos,
      ...values,
      muro: {
        ...muroDatos.muro,
        ...values.muro,
      },
    };

    setMuroDatos(merged);

    const muroPayload = {
      tipo: merged.muro.tipo,
      piso: merged.muro.piso,
      ancho_estructura: Number(merged.muro.ancho_estructura),
      ancho: Number(merged.muro.ancho),
      clase: Number(merged.muro.clase),
      estructura: Number(merged.muro.estructura),
      alto: Number(merged.muro.alto),
      medida1: Number(merged.muro.medida1 || 0),
      medida2: Number(merged.muro.medida2 || 0),
      medida3: Number(merged.muro.medida3 || 0),
    };

    if (
      merged.muro.tipo === "muroVentana" ||
      merged.muro.tipo === "muroPuertaVentana"
    ) {
      if (merged.muro.ventana) {
        muroPayload.ventana = {
          tipo: merged.muro.ventana.tipo,
          ancho: Number(merged.muro.ventana.ancho),
          alto: Number(merged.muro.ventana.alto),
          ubicacion: merged.muro.ventana.ubicacion,
        };
      } else {
        alert("⚠️ Debes configurar la ventana usando el editor gráfico");
        return;
      }
    } else {
      muroPayload.ventana = null;
    }

    const payload = {
      cinta_corona: Number(merged.cinta_corona),
      viga_cimiento: Number(merged.viga_cimiento),
      cinta_lateral: Number(merged.cinta_lateral),
      pañete: Number(merged["pañete"]),
      estuco: Number(merged.estuco),
      pintura: Number(merged.pintura),
      textura: Number(merged.textura),
      acabados_externos: Number(merged.acabados_externos),
      mamposteria: Number(merged.mamposteria),
      ladrillo: Number(merged.ladrillo),
      tipo: Number(merged.tipo),
      muro: muroPayload,
    };

    console.log("📤 Payload enviado:", JSON.stringify(payload, null, 2));

    try {
      const res = await request(apiUrls.cotizacion.cotizarMuro, { method: 'POST', body: payload })

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
      <div className="muro-modal muro-modal--results">
        <div className="muro-card muro-card--results">
          <header className="muro-modal__header">
            <div>
              <p className="muro-modal__eyebrow">Resumen de cotización</p>
              <h1>Cálculo para muros</h1>
              <p className="muro-modal__hint">
                Descarga el detalle o inicia una nueva estimación con parámetros diferentes.
              </p>
            </div>
          </header>

          <div className="muro-results">
            <pre className="muro-results__log">{cotizacion.mano_obra}</pre>
            <div className="muro-results__summary">
              <p>
                <span>Valor total mano de obra</span>
                <strong>${cotizacion.valor_total_mano_obra}</strong>
              </p>
              <p>
                <span>Valor total materiales</span>
                <strong>${cotizacion.Valor_total_Materiales}</strong>
              </p>
              <p>
                <span>Obra a todo costo</span>
                <strong>${cotizacion.Valor_total_obra_a_todo_costo}</strong>
              </p>
            </div>
          </div>

          <div className="muro-actions">
            <button onClick={descargarPDF} className="muro-button muro-button--secondary" type="button">
              Descargar detalle
            </button>
            <button
              onClick={() => {
                setCotizacion(null);
                const freshValues = createMuroDefaultValues();
                setMuroDatos(freshValues);
                reset(freshValues);
              }}
              className="muro-button"
              type="button"
            >
              Nueva cotización
            </button>
            <button onClick={onClose} className="muro-button muro-button--ghost" type="button">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar editores
  if (mostrarEditor) {
    if (muroDatos.muro.tipo === "muroPuerta") {
      return <MuroPuertaEditor {...propsEditor} />;
    } else if (muroDatos.muro.tipo === "muroVentana") {
      return <MuroVentanaEditor {...propsEditor} />;
    } else if (muroDatos.muro.tipo === "muroPuertaVentana") {
      return <MuroPuertaVentanaEditor {...propsEditor} />;
    }
  }

  return (
    <form className="muro-modal" onSubmit={handleSubmit(enviarCotizacion)} noValidate>
      <header className="muro-modal__header">
        <div>
          <h1>Muros</h1>
          <p className="muro-modal__hint">
            Completa los parámetros estructurales y de acabados para obtener una estimación
            precisa.
          </p>
        </div>
      </header>

      <div className="muro-sections">
        <section className="muro-card">
          <h2>Configuración del muro</h2>
          <div className="muro-grid">
            <div className={`muro-field ${errors.muro?.tipo ? "muro-field--error" : ""}`}>
              <label
                htmlFor="muro-tipo"
                aria-invalid={errors.muro?.tipo ? "true" : undefined}
              >
                Tipo de muro
              </label>
              <select
                id="muro-tipo"
                {...registerField("muro.tipo", (value) =>
                  setMuroDatos((prev) => ({
                    ...prev,
                    muro: {
                      ...prev.muro,
                      tipo: value,
                      ventana:
                        value === "muroVentana" || value === "muroPuertaVentana"
                          ? prev.muro.ventana
                          : null,
                    },
                  }))
                )}
                aria-invalid={!!errors.muro?.tipo}
              >
                <option value="muroEntero">Muro entero</option>
                <option value="muroPuerta">Muro con puerta</option>
                <option value="muroVentana">Muro con ventana</option>
                <option value="muroPuertaVentana">Muro con puerta y ventana</option>
              </select>
              {errors.muro?.tipo && (
                <p className="muro-field__error">{errors.muro?.tipo.message}</p>
              )}
            </div>

            <div className={`muro-field ${errors.muro?.piso ? "muro-field--error" : ""}`}>
              <label
                htmlFor="muro-piso"
                aria-invalid={errors.muro?.piso ? "true" : undefined}
              >
                Piso
              </label>
              <select
                id="muro-piso"
                {...registerField("muro.piso", (value) =>
                  setMuroDatos((prev) => ({
                    ...prev,
                    muro: { ...prev.muro, piso: value },
                  }))
                )}
                aria-invalid={!!errors.muro?.piso}
              >
                <option value="1 de 1">1 de 1</option>
                <option value="1 de 2">1 de 2</option>
                <option value="1 de 3">1 de 3</option>
                <option value="2 de 2">2 de 2</option>
                <option value="2 de 3">2 de 3</option>
                <option value="3 de 3">3 de 3</option>
              </select>
              {errors.muro?.piso && (
                <p className="muro-field__error">{errors.muro?.piso.message}</p>
              )}
            </div>

            <div className={`muro-field ${errors.muro?.ancho_estructura ? "muro-field--error" : ""}`}>
              <label
                htmlFor="muro-ancho-estructura"
                aria-invalid={errors.muro?.ancho_estructura ? "true" : undefined}
              >
                Ancho estructura (eje a eje) cm
              </label>
              <input
                id="muro-ancho-estructura"
                type="number"
                {...registerNumericField("muro.ancho_estructura", (value) =>
                  setMuroDatos((prev) => ({
                    ...prev,
                    muro: { ...prev.muro, ancho_estructura: value },
                  }))
                )}
                aria-invalid={!!errors.muro?.ancho_estructura}
              />
              {errors.muro?.ancho_estructura && (
                <p className="muro-field__error">{errors.muro?.ancho_estructura.message}</p>
              )}
            </div>

            <div className={`muro-field ${errors.muro?.ancho ? "muro-field--error" : ""}`}>
              <label htmlFor="muro-ancho" aria-invalid={errors.muro?.ancho ? "true" : undefined}>
                Ancho libre (cm)
              </label>
              <input
                id="muro-ancho"
                type="number"
                {...registerNumericField("muro.ancho", (value) =>
                  setMuroDatos((prev) => ({
                    ...prev,
                    muro: { ...prev.muro, ancho: value },
                  }))
                )}
                aria-invalid={!!errors.muro?.ancho}
              />
              {errors.muro?.ancho && (
                <p className="muro-field__error">{errors.muro?.ancho.message}</p>
              )}
            </div>

            <div className={`muro-field ${errors.muro?.alto ? "muro-field--error" : ""}`}>
              <label htmlFor="muro-alto" aria-invalid={errors.muro?.alto ? "true" : undefined}>
                Alto (cm)
              </label>
              <input
                id="muro-alto"
                type="number"
                {...registerNumericField("muro.alto", (value) =>
                  setMuroDatos((prev) => ({
                    ...prev,
                    muro: { ...prev.muro, alto: value },
                  }))
                )}
                aria-invalid={!!errors.muro?.alto}
              />
              {errors.muro?.alto && (
                <p className="muro-field__error">{errors.muro?.alto.message}</p>
              )}
            </div>

            <div className={`muro-field ${errors.muro?.clase ? "muro-field--error" : ""}`}>
              <label htmlFor="muro-clase" aria-invalid={errors.muro?.clase ? "true" : undefined}>
                Clase de viga
              </label>
              <select
                id="muro-clase"
                {...registerNumericField("muro.clase", (value) =>
                  setMuroDatos((prev) => ({
                    ...prev,
                    muro: { ...prev.muro, clase: value },
                  }))
                )}
                aria-invalid={!!errors.muro?.clase}
              >
                <option value="0">Sin carga</option>
                <option value="1">Carga normal</option>
                <option value="2">Carga central</option>
              </select>
              {errors.muro?.clase && (
                <p className="muro-field__error">{errors.muro?.clase.message}</p>
              )}
            </div>

            <div className={`muro-field ${errors.muro?.estructura ? "muro-field--error" : ""}`}>
              <label
                htmlFor="muro-estructura"
                aria-invalid={errors.muro?.estructura ? "true" : undefined}
              >
                ¿Es estructural?
              </label>
              <select
                id="muro-estructura"
                {...registerNumericField("muro.estructura", (value) =>
                  setMuroDatos((prev) => ({
                    ...prev,
                    muro: { ...prev.muro, estructura: value },
                  }))
                )}
                aria-invalid={!!errors.muro?.estructura}
              >
                <option value="1">Sí</option>
                <option value="0">No</option>
              </select>
              {errors.muro?.estructura && (
                <p className="muro-field__error">{errors.muro?.estructura.message}</p>
              )}
            </div>
          </div>
        </section>

        <section className="muro-card">
          <h2>Elementos estructurales</h2>
          <div className="muro-grid">
            <div className={`muro-field ${errors.cinta_corona ? "muro-field--error" : ""}`}>
              <label
                htmlFor="muro-cinta-corona"
                aria-invalid={errors.cinta_corona ? "true" : undefined}
              >
                Cinta corona
              </label>
              <select
                id="muro-cinta-corona"
                {...registerNumericField("cinta_corona", (value) =>
                  setMuroDatos((prev) => ({ ...prev, cinta_corona: value }))
                )}
                aria-invalid={!!errors.cinta_corona}
              >
                <option value="0">No lleva</option>
                <option value="1">Sí lleva</option>
              </select>
              {errors.cinta_corona && (
                <p className="muro-field__error">{errors.cinta_corona.message}</p>
              )}
            </div>

            <div className={`muro-field ${errors.viga_cimiento ? "muro-field--error" : ""}`}>
              <label
                htmlFor="muro-viga-cimiento"
                aria-invalid={errors.viga_cimiento ? "true" : undefined}
              >
                Viga de cimiento
              </label>
              <select
                id="muro-viga-cimiento"
                {...registerNumericField("viga_cimiento", (value) =>
                  setMuroDatos((prev) => ({ ...prev, viga_cimiento: value }))
                )}
                aria-invalid={!!errors.viga_cimiento}
              >
                <option value="0">No lleva</option>
                <option value="1">Sí lleva</option>
              </select>
              {errors.viga_cimiento && (
                <p className="muro-field__error">{errors.viga_cimiento.message}</p>
              )}
            </div>

            <div className={`muro-field ${errors.cinta_lateral ? "muro-field--error" : ""}`}>
              <label
                htmlFor="muro-cinta-lateral"
                aria-invalid={errors.cinta_lateral ? "true" : undefined}
              >
                Cinta lateral
              </label>
              <select
                id="muro-cinta-lateral"
                {...registerNumericField("cinta_lateral", (value) =>
                  setMuroDatos((prev) => ({ ...prev, cinta_lateral: value }))
                )}
                aria-invalid={!!errors.cinta_lateral}
              >
                <option value="0">No lleva</option>
                <option value="1">Un lado</option>
                <option value="2">Ambos lados</option>
              </select>
              {errors.cinta_lateral && (
                <p className="muro-field__error">{errors.cinta_lateral.message}</p>
              )}
            </div>

            <div className={`muro-field ${errors.ladrillo ? "muro-field--error" : ""}`}>
              <label htmlFor="muro-ladrillo" aria-invalid={errors.ladrillo ? "true" : undefined}>
                Tipo de ladrillo
              </label>
              <select
                id="muro-ladrillo"
                {...registerNumericField("ladrillo", (value) =>
                  setMuroDatos((prev) => ({ ...prev, ladrillo: value }))
                )}
                aria-invalid={!!errors.ladrillo}
              >
                <option value="1">Farol 10x20x30</option>
                <option value="4">Farol 12x20x30</option>
                <option value="6">Tolete 10x6x20</option>
              </select>
              {errors.ladrillo && (
                <p className="muro-field__error">{errors.ladrillo.message}</p>
              )}
            </div>

            <div className={`muro-field ${errors.tipo ? "muro-field--error" : ""}`}>
              <label
                htmlFor="muro-tipo-resistencia"
                aria-invalid={errors.tipo ? "true" : undefined}
              >
                Tipo de resistencia
              </label>
              <select
                id="muro-tipo-resistencia"
                {...registerNumericField("tipo", (value) =>
                  setMuroDatos((prev) => ({ ...prev, tipo: value }))
                )}
                aria-invalid={!!errors.tipo}
              >
                <option value="0">Peso muy bajo</option>
                <option value="1">Peso bajo</option>
                <option value="2">Peso medio</option>
                <option value="3">Peso alto</option>
              </select>
              {errors.tipo && (
                <p className="muro-field__error">{errors.tipo.message}</p>
              )}
            </div>

            <div className={`muro-field ${errors.mamposteria ? "muro-field--error" : ""}`}>
              <label
                htmlFor="muro-mamposteria"
                aria-invalid={errors.mamposteria ? "true" : undefined}
              >
                Mampostería
              </label>
              <select
                id="muro-mamposteria"
                {...registerNumericField("mamposteria", (value) =>
                  setMuroDatos((prev) => ({ ...prev, mamposteria: value }))
                )}
                aria-invalid={!!errors.mamposteria}
              >
                <option value="0">No lleva</option>
                <option value="1">Sí lleva</option>
              </select>
              {errors.mamposteria && (
                <p className="muro-field__error">{errors.mamposteria.message}</p>
              )}
            </div>
          </div>
        </section>

        <section className="muro-card">
          <h2>Acabados</h2>
          <div className="muro-grid">
            <div className={`muro-field ${errors["pañete"] ? "muro-field--error" : ""}`}>
              <label htmlFor="muro-panete" aria-invalid={errors["pañete"] ? "true" : undefined}>
                Pañete
              </label>
              <select
                id="muro-panete"
                {...registerNumericField("pañete", (value) =>
                  setMuroDatos((prev) => ({ ...prev, pañete: value }))
                )}
                aria-invalid={!!errors["pañete"]}
              >
                <option value="0">No lleva</option>
                <option value="1">Una cara</option>
                <option value="2">Ambas caras</option>
              </select>
              {errors["pañete"] && (
                <p className="muro-field__error">{errors["pañete"].message}</p>
              )}
            </div>

            <div className={`muro-field ${errors.estuco ? "muro-field--error" : ""}`}>
              <label htmlFor="muro-estuco" aria-invalid={errors.estuco ? "true" : undefined}>
                Estuco
              </label>
              <select
                id="muro-estuco"
                {...registerNumericField("estuco", (value) =>
                  setMuroDatos((prev) => ({ ...prev, estuco: value }))
                )}
                aria-invalid={!!errors.estuco}
              >
                <option value="0">No lleva</option>
                <option value="1">Una cara</option>
                <option value="2">Ambas caras</option>
              </select>
              {errors.estuco && (
                <p className="muro-field__error">{errors.estuco.message}</p>
              )}
            </div>

            <div className={`muro-field ${errors.pintura ? "muro-field--error" : ""}`}>
              <label htmlFor="muro-pintura" aria-invalid={errors.pintura ? "true" : undefined}>
                Pintura
              </label>
              <select
                id="muro-pintura"
                {...registerNumericField("pintura", (value) =>
                  setMuroDatos((prev) => ({ ...prev, pintura: value }))
                )}
                aria-invalid={!!errors.pintura}
              >
                <option value="0">No lleva</option>
                <option value="1">Una cara</option>
                <option value="2">Ambas caras</option>
              </select>
              {errors.pintura && (
                <p className="muro-field__error">{errors.pintura.message}</p>
              )}
            </div>

            <div className={`muro-field ${errors.textura ? "muro-field--error" : ""}`}>
              <label htmlFor="muro-textura" aria-invalid={errors.textura ? "true" : undefined}>
                Textura
              </label>
              <select
                id="muro-textura"
                {...registerNumericField("textura", (value) =>
                  setMuroDatos((prev) => ({ ...prev, textura: value }))
                )}
                aria-invalid={!!errors.textura}
              >
                <option value="0">No lleva</option>
                <option value="1">Una cara</option>
                <option value="2">Ambas caras</option>
              </select>
              {errors.textura && (
                <p className="muro-field__error">{errors.textura.message}</p>
              )}
            </div>

            <div className={`muro-field ${errors.acabados_externos ? "muro-field--error" : ""}`}>
              <label
                htmlFor="muro-acabados-ex"
                aria-invalid={errors.acabados_externos ? "true" : undefined}
              >
                Acabados externos
              </label>
              <select
                id="muro-acabados-ex"
                {...registerNumericField("acabados_externos", (value) =>
                  setMuroDatos((prev) => ({ ...prev, acabados_externos: value }))
                )}
                aria-invalid={!!errors.acabados_externos}
              >
                <option value="0">No lleva</option>
                <option value="1">Sí lleva</option>
              </select>
              {errors.acabados_externos && (
                <p className="muro-field__error">{errors.acabados_externos.message}</p>
              )}
            </div>
          </div>
        </section>

        {muroDatos.muro.tipo !== "muroEntero" && (
          <section className="muro-alert">
            <h3>Antes de abrir el editor</h3>
            <ul>
              <li>
                Confirma el <strong>ancho libre</strong> del muro.
              </li>
              <li>
                Define la <strong>altura</strong> para dimensionar elementos.
              </li>
            </ul>
            <button
              onClick={() => {
                const current = getValues();
                if (!current.muro.ancho || !current.muro.alto) {
                  alert(
                    "⚠️ Por favor ingresa el ancho libre y el alto del muro antes de abrir el editor"
                  );
                  return;
                }
                setMostrarEditor(true);
              }}
              className="muro-button"
              type="button"
            >
              Abrir editor gráfico
            </button>
          </section>
        )}
      </div>

      <div className="muro-actions">
        <button className="muro-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : "Enviar cotización"}
        </button>
        <button onClick={onVolver} className="muro-button muro-button--ghost" type="button">
          Volver
        </button>
      </div>
    </form>
  );
}