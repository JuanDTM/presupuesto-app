import React, { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { pdf } from "@react-pdf/renderer";
import "./CieloRasoModal.css";
import { request } from "../../../lib/httpClient";
import apiUrls from "../../../config/api_urls";
import { createCieloDefaultValues, cieloSchema } from "../validation/schemas";
import CotizacionCieloPDF from "./CotizacionCieloPDF";

export default function CieloRasoModal({ onClose, onVolver }) {
  const [cotizacion, setCotizacion] = useState(null);
  const [imagenGuia, setImagenGuia] = useState(null);
  const [ultimoFormulario, setUltimoFormulario] = useState(null);

  const defaultValues = useMemo(() => createCieloDefaultValues(), []);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
    setValue,
    clearErrors,
  } = useForm({
    resolver: zodResolver(cieloSchema),
    defaultValues,
    mode: "onBlur",
  });

  const { fields: areas, append, remove } = useFieldArray({
    control,
    name: "areas",
  });

  const tipoSeleccionado = Number(watch("tipo"));
  const esPVC = [4, 5].includes(tipoSeleccionado);

  useEffect(() => {
    const imagenGuardada = localStorage.getItem("imagenGuiaCieloRaso");
    if (imagenGuardada) {
      setImagenGuia(imagenGuardada);
    }
  }, []);

  useEffect(() => {
    if (esPVC) {
      setValue("masilla", "0", { shouldValidate: true });
      setValue("pintura", "0", { shouldValidate: true });
      clearErrors(["masilla", "pintura"]);
    }
  }, [esPVC, setValue, clearErrors]);

  const manejarSubidaImagen = (event) => {
    const archivo = event.target.files?.[0];
    if (!archivo) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const imagenBase64 = reader.result;
      setImagenGuia(imagenBase64);
      localStorage.setItem("imagenGuiaCieloRaso", imagenBase64);
      alert("✅ Imagen guardada correctamente");
    };
    reader.readAsDataURL(archivo);
  };

  const agregarArea = () => {
    append({ largo: "", ancho: "", vacio: "" });
  };

  const eliminarArea = (index) => {
    remove(index);
  };

  const enviarCotizacion = async (formValues) => {
    const normalizarNumero = (valor) => {
      const numero = Number(valor);
      return Number.isFinite(numero) ? numero : 0;
    };

    const formularioNormalizado = {
      tipo: normalizarNumero(formValues.tipo),
      estructura: normalizarNumero(formValues.estructura),
      laminacion: normalizarNumero(formValues.laminacion),
      masilla: normalizarNumero(formValues.masilla),
      pintura: normalizarNumero(formValues.pintura),
      areas: (formValues.areas || []).map((area) => ({
        largo: normalizarNumero(area.largo),
        ancho: normalizarNumero(area.ancho),
        vacio: normalizarNumero(area.vacio),
      })),
    };

    const payload = {
      ...formularioNormalizado,
      areas: formularioNormalizado.areas.map((area) => ({
        largo: area.largo,
        ancho: area.ancho,
        vacio: area.vacio,
      })),
    };

    console.log("📤 Payload enviado:", JSON.stringify(payload, null, 2));

    try {
      const data = await request(apiUrls.cotizacion.cotizarCielo, {
        method: "POST",
        body: payload,
      });

      
      setCotizacion(data);
      alert("Cotización recibida ✅");
    } catch (err) {
      alert(`❌ Error de conexión:\n\n${err.message}`);
    }
  };

  const resetFormulario = () => {
    const freshValues = createCieloDefaultValues();
    reset(freshValues);
    setCotizacion(null);
    setUltimoFormulario(null);
  };

  const descargarPDF = async () => {
    if (!cotizacion) {
      alert("No hay cotización disponible para descargar");
      return;
    }

    if (!ultimoFormulario) {
      alert("No se encontraron los parámetros utilizados para la cotización.");
      return;
    }

    try {
      const blob = await pdf(
        <CotizacionCieloPDF cotizacion={cotizacion} params={ultimoFormulario} />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = `cotizacion-cielo-raso-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(enlace);
      enlace.click();
      document.body.removeChild(enlace);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("❌ Error al generar PDF:", error);
      alert("No se pudo generar el PDF de la cotización.");
    }
  };

  if (cotizacion) {
    return (
      <div className="cielo-modal cielo-modal--results">
        <div className="cielo-card cielo-card--results">
          <header className="cielo-modal__header">
            <div>
              <p className="cielo-modal__eyebrow">Resumen de cotización</p>
              <h1>Cielo raso</h1>
              <p className="cielo-modal__hint">
                Descarga el detalle o reinicia con nuevos parámetros cuando lo necesites.
              </p>
            </div>
          </header>

          <div className="cielo-results">
            <pre className="cielo-results__log">{cotizacion.mano_obra}</pre>
            <div className="cielo-results__summary">
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

          <div className="cielo-actions">
            <button
              onClick={descargarPDF}
              className="cielo-button cielo-button--secondary"
              type="button"
            >
              Descargar PDF
            </button>
            <button onClick={resetFormulario} className="cielo-button" type="button">
              Nueva cotización
            </button>
            <button
              onClick={onClose}
              className="cielo-button cielo-button--ghost"
              type="button"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form className="cielo-modal" onSubmit={handleSubmit(enviarCotizacion)} noValidate>
      <header className="cielo-modal__header">
        <div>
          <button onClick={onVolver} className="cielo-button cielo-button--ghost" type="button">
            Volver
          </button>
          <h1>Cielo raso</h1>
          <p className="cielo-modal__hint">
            Define el tipo de sistema y las áreas a cubrir para obtener una estimación precisa.
          </p>
        </div>
      </header>

      <div className="cielo-sections">
        <section className="cielo-card">
          <h2>Referencia visual</h2>
          <div className="cielo-media">
            {imagenGuia ? (
              <img
                src={imagenGuia}
                alt="Guía de medidas de cielo raso"
                className="cielo-media__preview"
              />
            ) : (
              <div className="cielo-media__placeholder">📷 Sin imagen de guía</div>
            )}

            <div className="cielo-media__info">
              <label className="cielo-field cielo-field--inline">
                <span>Subir imagen de guía</span>
                <input type="file" accept="image/*" onChange={manejarSubidaImagen} />
              </label>
              <p className="cielo-media__hint">
                Usa una imagen para orientar la toma de medidas. La guardamos localmente para tus
                próximas cotizaciones.
              </p>
              <ul className="cielo-media__tips">
                <li>🔁 Actualiza la imagen cuando cambien los planos.</li>
                <li>📐 Revisa que las cotas sean legibles en el archivo.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="cielo-card">
          <h2>Configuración general</h2>
          <div className="cielo-grid">
            <div className={`cielo-field ${errors.tipo ? "cielo-field--error" : ""}`}>
              <label htmlFor="cielo-tipo">Tipo de cielo raso</label>
              <select
                id="cielo-tipo"
                {...register("tipo")}
                aria-invalid={errors.tipo ? "true" : undefined}
              >
                <option value="1">Panel de yeso (Drywall)</option>
                <option value="2">Superboard 6 mm (Drywall)</option>
                <option value="3">Superboard 8 mm (Drywall)</option>
                <option value="4">PVC sencillo</option>
                <option value="5">PVC diagonal</option>
              </select>
              {errors.tipo && <p className="cielo-field__error">{errors.tipo.message}</p>}
            </div>

            <div className={`cielo-field ${errors.estructura ? "cielo-field--error" : ""}`}>
              <label htmlFor="cielo-estructura">Estructura</label>
              <select
                id="cielo-estructura"
                {...register("estructura")}
                aria-invalid={errors.estructura ? "true" : undefined}
              >
                <option value="0">No lleva</option>
                <option value="1">Sí lleva</option>
              </select>
              {errors.estructura && (
                <p className="cielo-field__error">{errors.estructura.message}</p>
              )}
            </div>

            <div className={`cielo-field ${errors.laminacion ? "cielo-field--error" : ""}`}>
              <label htmlFor="cielo-laminacion">Laminación</label>
              <select
                id="cielo-laminacion"
                {...register("laminacion")}
                aria-invalid={errors.laminacion ? "true" : undefined}
              >
                <option value="0">No lleva</option>
                <option value="1">Sí lleva</option>
              </select>
              {errors.laminacion && (
                <p className="cielo-field__error">{errors.laminacion.message}</p>
              )}
            </div>

            <div className={`cielo-field ${errors.masilla ? "cielo-field--error" : ""}`}>
              <label htmlFor="cielo-masilla">
                Masilla {esPVC && <span className="cielo-note">⚠️ No aplica para PVC</span>}
              </label>
              <select
                id="cielo-masilla"
                {...register("masilla")}
                aria-invalid={errors.masilla ? "true" : undefined}
                disabled={esPVC}
              >
                <option value="0">No lleva</option>
                <option value="1">Sí lleva</option>
              </select>
              {errors.masilla && <p className="cielo-field__error">{errors.masilla.message}</p>}
            </div>

            <div className={`cielo-field ${errors.pintura ? "cielo-field--error" : ""}`}>
              <label htmlFor="cielo-pintura">
                Pintura {esPVC && <span className="cielo-note">⚠️ No aplica para PVC</span>}
              </label>
              <select
                id="cielo-pintura"
                {...register("pintura")}
                aria-invalid={errors.pintura ? "true" : undefined}
                disabled={esPVC}
              >
                <option value="0">No lleva</option>
                <option value="1">Sí lleva</option>
              </select>
              {errors.pintura && <p className="cielo-field__error">{errors.pintura.message}</p>}
            </div>
          </div>
        </section>

        <section className="cielo-card">
          <div className="cielo-card__header">
            <h2>Áreas a cotizar</h2>
            <p className="cielo-card__helper">
              Agrega cada área de cielo raso indicando sus dimensiones y el vacío requerido.
            </p>
          </div>

          <div className="cielo-areas">
            {areas.map((area, index) => {
              const erroresArea = errors.areas?.[index];

              return (
                <div className="cielo-area" key={area.id ?? `area-${index}`}>
                  <div className="cielo-area__header">
                    <h3>Área #{index + 1}</h3>
                    {areas.length > 1 && (
                      <button
                        onClick={() => eliminarArea(index)}
                        className="cielo-button cielo-button--danger"
                        type="button"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                  <div className="cielo-area__grid">
                    <div
                      className={`cielo-field ${
                        erroresArea?.largo ? "cielo-field--error" : ""
                      }`}
                    >
                      <label htmlFor={`cielo-area-${index}-largo`}>Largo (cm)</label>
                      <input
                        id={`cielo-area-${index}-largo`}
                        type="number"
                        {...register(`areas.${index}.largo`)}
                        aria-invalid={erroresArea?.largo ? "true" : undefined}
                      />
                      {erroresArea?.largo && (
                        <p className="cielo-field__error">{erroresArea.largo.message}</p>
                      )}
                    </div>
                    <div
                      className={`cielo-field ${
                        erroresArea?.ancho ? "cielo-field--error" : ""
                      }`}
                    >
                      <label htmlFor={`cielo-area-${index}-ancho`}>Ancho (cm)</label>
                      <input
                        id={`cielo-area-${index}-ancho`}
                        type="number"
                        {...register(`areas.${index}.ancho`)}
                        aria-invalid={erroresArea?.ancho ? "true" : undefined}
                      />
                      {erroresArea?.ancho && (
                        <p className="cielo-field__error">{erroresArea.ancho.message}</p>
                      )}
                    </div>
                    <div
                      className={`cielo-field ${
                        erroresArea?.vacio ? "cielo-field--error" : ""
                      }`}
                    >
                      <label htmlFor={`cielo-area-${index}-vacio`}>Vacío (cm)</label>
                      <input
                        id={`cielo-area-${index}-vacio`}
                        type="number"
                        {...register(`areas.${index}.vacio`)}
                        aria-invalid={erroresArea?.vacio ? "true" : undefined}
                      />
                      {erroresArea?.vacio && (
                        <p className="cielo-field__error">{erroresArea.vacio.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={agregarArea}
            className="cielo-button cielo-button--secondary"
            type="button"
          >
            Añadir área
          </button>
        </section>
      </div>

      <div className="cielo-actions">
        <button className="cielo-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : "Enviar cotización"}
        </button>
        <button onClick={onVolver} className="cielo-button cielo-button--ghost" type="button">
          Volver
        </button>
      </div>
    </form>
  );
}