import React, { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { pdf } from "@react-pdf/renderer";
import "./PisosModal.css";
import { request } from "../../../lib/httpClient";
import apiUrls from "../../../config/api_urls";
import { createPisoDefaultValues, pisoSchema } from "../validation/schemas";
import CotizacionPisoPDF from "./CotizacionPisoPDF";

export default function PisosModal({ onClose, onVolver }) {
  const [cotizacion, setCotizacion] = useState(null);
  const [imagenGuia, setImagenGuia] = useState(null);
  const [ultimoFormulario, setUltimoFormulario] = useState(null);

  const defaultValues = useMemo(() => createPisoDefaultValues(), []);

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
    resolver: zodResolver(pisoSchema),
    defaultValues,
    mode: "onBlur",
  });

  const { fields: areas, append, remove } = useFieldArray({
    control,
    name: "areas",
  });

  const remodelacion = watch("remodelacion");

  useEffect(() => {
    const imagenGuardada = localStorage.getItem("imagenGuiaPisos");
    if (imagenGuardada) {
      setImagenGuia(imagenGuardada);
    }
  }, []);

  useEffect(() => {
    if (remodelacion) {
      setValue("largo", "", { shouldValidate: true });
      setValue("ancho", "", { shouldValidate: true });
      clearErrors(["largo", "ancho"]);
    }
  }, [remodelacion, setValue, clearErrors]);

  const manejarSubidaImagen = (event) => {
    const archivo = event.target.files?.[0];
    if (!archivo) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const imagenBase64 = reader.result;
      setImagenGuia(imagenBase64);
      localStorage.setItem("imagenGuiaPisos", imagenBase64);
      alert("✅ Imagen guardada correctamente");
    };
    reader.readAsDataURL(archivo);
  };

  const agregarArea = () => {
    append({ largo: "", ancho: "" });
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
      largo: normalizarNumero(formValues.largo),
      ancho: normalizarNumero(formValues.ancho),
      losa: normalizarNumero(formValues.losa),
      mortero: normalizarNumero(formValues.mortero),
      enchape: normalizarNumero(formValues.enchape),
      remodelacion: !!formValues.remodelacion,
      areas: (formValues.areas || []).map((area) => ({
        largo: normalizarNumero(area.largo),
        ancho: normalizarNumero(area.ancho),
      })),
    };

    const payload = {
      ...formularioNormalizado,
      areas: formularioNormalizado.areas.map((area) => ({
        largo: area.largo,
        ancho: area.ancho,
      })),
    };

    console.log("📤 Payload enviado:", JSON.stringify(payload, null, 2));

    try {
      const data = await request(apiUrls.cotizacion.cotizarPiso, {method: "POST", body: payload});

      setCotizacion(data);
      setUltimoFormulario(formularioNormalizado);
      alert("Cotización recibida ✅");
    } catch (error) {
      console.error("❌ Error al cotizar piso:", error);
      const message =
        error?.message || "Ocurrió un problema al enviar la cotización. Intenta nuevamente.";
      alert(`❌ Error:\n\n${message}`);
    }
  };

  const resetFormulario = () => {
    const freshValues = createPisoDefaultValues();
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
        <CotizacionPisoPDF cotizacion={cotizacion} params={ultimoFormulario} />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = `cotizacion-piso-${new Date().toISOString().split("T")[0]}.pdf`;
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
      <div className="pisos-modal pisos-modal--results">
        <div className="pisos-card pisos-card--results">
          <header className="pisos-modal__header">
            <div>
              <p className="pisos-modal__eyebrow">Resumen de cotización</p>
              <h1>Pisos</h1>
              <p className="pisos-modal__hint">
                Descarga el detalle o reinicia con nuevos parámetros cuando lo necesites.
              </p>
            </div>
          </header>

          <div className="pisos-results">
            <pre className="pisos-results__log">{cotizacion.mano_obra}</pre>
            <div className="pisos-results__summary">
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

          <div className="pisos-actions">
            <button
              onClick={descargarPDF}
              className="pisos-button pisos-button--secondary"
              type="button"
            >
              Descargar PDF
            </button>
            <button onClick={resetFormulario} className="pisos-button" type="button">
              Nueva cotización
            </button>
            <button
              onClick={onClose}
              className="pisos-button pisos-button--ghost"
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
    <form className="pisos-modal" onSubmit={handleSubmit(enviarCotizacion)} noValidate>
      <header className="pisos-modal__header">
        <div>
          <button onClick={onVolver} className="pisos-button pisos-button--ghost" type="button">
            Volver
          </button>
          <h1>Pisos</h1>
          <p className="pisos-modal__hint">
            Completa las medidas principales y los acabados para obtener una estimación precisa.
          </p>
        </div>
      </header>

      <div className="pisos-sections">
        <section className="pisos-card">
          <h2>Referencia visual</h2>
          <div className="pisos-media">
            {imagenGuia ? (
              <img
                src={imagenGuia}
                alt="Guía de medidas del piso"
                className="pisos-media__preview"
              />
            ) : (
              <div className="pisos-media__placeholder">📷 Sin imagen de guía</div>
            )}

            <div className="pisos-media__info">
              <label className="pisos-field pisos-field--inline">
                <span>Subir imagen de guía</span>
                <input type="file" accept="image/*" onChange={manejarSubidaImagen} />
              </label>
              <p className="pisos-media__hint">
                Utiliza una imagen para orientar la toma de medidas. La guardamos de forma local
                para tus futuras cotizaciones.
              </p>
              <ul className="pisos-media__tips">
                <li>🔁 Cambia la imagen cuando actualices el plano.</li>
                <li>📐 Revisa que las cotas sean legibles antes de enviarla.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="pisos-card">
          <h2>Medidas generales</h2>
          <div className="pisos-grid">
            <div className={`pisos-field ${errors.largo ? "pisos-field--error" : ""}`}>
              <label htmlFor="pisos-largo">Largo externo (cm)</label>
              <input
                id="pisos-largo"
                type="number"
                {...register("largo")}
                disabled={remodelacion}
                aria-invalid={errors.largo ? "true" : undefined}
              />
              {errors.largo && <p className="pisos-field__error">{errors.largo.message}</p>}
            </div>
            <div className={`pisos-field ${errors.ancho ? "pisos-field--error" : ""}`}>
              <label htmlFor="pisos-ancho">Ancho externo (cm)</label>
              <input
                id="pisos-ancho"
                type="number"
                {...register("ancho")}
                disabled={remodelacion}
                aria-invalid={errors.ancho ? "true" : undefined}
              />
              {errors.ancho && <p className="pisos-field__error">{errors.ancho.message}</p>}
            </div>
            <div className={`pisos-field ${errors.losa ? "pisos-field--error" : ""}`}>
              <label htmlFor="pisos-losa">Tipo de losa</label>
              <select
                id="pisos-losa"
                {...register("losa")}
                aria-invalid={errors.losa ? "true" : undefined}
              >
                <option value="0">Sin losa</option>
                <option value="1">Losa fina de 7 cm</option>
                <option value="2">Losa normal de 8 cm</option>
                <option value="3">Losa pobre de 10 cm</option>
              </select>
              {errors.losa && <p className="pisos-field__error">{errors.losa.message}</p>}
            </div>
            <div className={`pisos-field ${errors.mortero ? "pisos-field--error" : ""}`}>
              <label htmlFor="pisos-mortero">Mortero</label>
              <select
                id="pisos-mortero"
                {...register("mortero")}
                aria-invalid={errors.mortero ? "true" : undefined}
              >
                <option value="0">Sin mortero</option>
                <option value="1">Mortero de 3 cm</option>
                <option value="2">Mortero de 5 cm</option>
                <option value="3">Mortero de 7 cm</option>
              </select>
              {errors.mortero && <p className="pisos-field__error">{errors.mortero.message}</p>}
            </div>
            <div className={`pisos-field ${errors.enchape ? "pisos-field--error" : ""}`}>
              <label htmlFor="pisos-enchape">Enchape</label>
              <select
                id="pisos-enchape"
                {...register("enchape")}
                aria-invalid={errors.enchape ? "true" : undefined}
              >
                <option value="0">Sin enchape</option>
                <option value="1">Cerámica</option>
                <option value="2">Porcelanato</option>
              </select>
              {errors.enchape && <p className="pisos-field__error">{errors.enchape.message}</p>}
            </div>
            <div className="pisos-field pisos-field--checkbox">
              <label htmlFor="pisos-remodelacion">
                <input id="pisos-remodelacion" type="checkbox" {...register("remodelacion")} />
                ¿Es remodelación?
              </label>
              <p className="pisos-field__hint">
                Si marcas esta opción, solo tendremos en cuenta las áreas internas.
              </p>
            </div>
          </div>
        </section>

        <section className="pisos-card">
          <div className="pisos-card__header">
            <h2>Áreas internas</h2>
            <p className="pisos-card__helper">
              Agrega cada espacio interno que necesites cotizar. Calcularemos el total.
            </p>
          </div>

          <div className="pisos-areas">
            {areas.map((area, index) => {
              const largoError = errors.areas?.[index]?.largo;
              const anchoError = errors.areas?.[index]?.ancho;

              return (
                <div className="pisos-area" key={area.id ?? `area-${index}`}>
                  <div className="pisos-area__header">
                    <h3>Área #{index + 1}</h3>
                    {areas.length > 1 && (
                      <button
                        onClick={() => eliminarArea(index)}
                        className="pisos-button pisos-button--danger"
                        type="button"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                  <div className="pisos-area__grid">
                    <div className={`pisos-field ${largoError ? "pisos-field--error" : ""}`}>
                      <label htmlFor={`pisos-area-${index}-largo`}>Largo (cm)</label>
                      <input
                        id={`pisos-area-${index}-largo`}
                        type="number"
                        {...register(`areas.${index}.largo`)}
                        aria-invalid={largoError ? "true" : undefined}
                      />
                      {largoError && (
                        <p className="pisos-field__error">{largoError.message}</p>
                      )}
                    </div>
                    <div className={`pisos-field ${anchoError ? "pisos-field--error" : ""}`}>
                      <label htmlFor={`pisos-area-${index}-ancho`}>Ancho (cm)</label>
                      <input
                        id={`pisos-area-${index}-ancho`}
                        type="number"
                        {...register(`areas.${index}.ancho`)}
                        aria-invalid={anchoError ? "true" : undefined}
                      />
                      {anchoError && (
                        <p className="pisos-field__error">{anchoError.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button onClick={agregarArea} className="pisos-button pisos-button--secondary" type="button">
            Añadir área
          </button>
        </section>
      </div>

      <div className="pisos-actions">
        <button className="pisos-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : "Enviar cotización"}
        </button>
        <button onClick={onVolver} className="pisos-button pisos-button--ghost" type="button">
          Volver
        </button>
      </div>
    </form>
  );
}

