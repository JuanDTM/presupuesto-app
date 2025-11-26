import React, { useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { pdf } from "@react-pdf/renderer";
import "./VigasModal.css";
import { request } from "../../../lib/httpClient";
import apiUrls from "../../../config/api_urls";
import { createVigasDefaultValues, vigasSchema } from "../validation/schemas";
import CotizacionVigasPDF from "./CotizacionVigasPDF";
import TutorialButton from "../../../components/TutorialButton";

const TIPO_VIGA_OPCIONES = [
  { value: "1", label: "Viga corona delgada" },
  { value: "2", label: "Viga corona gruesa" },
  { value: "3", label: "Viga normal" },
  { value: "4", label: "Viga carga lateral" },
  { value: "5", label: "Viga carga central" },
];

const TIPO_LADRILLO_OPCIONES = [
  { value: "1", label: "Farol 10×20×30" },
  { value: "4", label: "Farol 12×20×30" },
  { value: "6", label: "Tolete 10×6×20" },
  { value: "7", label: "Tolete 12×6×24.5" },
];

const obtenerNombreViga = (tipo) =>
  TIPO_VIGA_OPCIONES.find((opcion) => opcion.value === String(tipo))?.label || "Viga";

const obtenerNombreLadrillo = (id) =>
  TIPO_LADRILLO_OPCIONES.find((opcion) => opcion.value === String(id))?.label || "Ladrillo";

export default function VigasModal({ onClose, onVolver }) {
  const [cotizacion, setCotizacion] = useState(null);
  const [ultimoFormulario, setUltimoFormulario] = useState(null);

  const defaultValues = useMemo(() => createVigasDefaultValues(), []);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(vigasSchema),
    defaultValues,
    mode: "onBlur",
  });

  const {
    fields: vigasFields,
    append: appendViga,
    remove: removeViga,
  } = useFieldArray({
    control,
    name: "vigas",
  });

  const {
    fields: vigasCimientoFields,
    append: appendVigaCimiento,
    remove: removeVigaCimiento,
  } = useFieldArray({
    control,
    name: "vigas_cimiento",
  });

  const {
    fields: cintasFields,
    append: appendCinta,
    remove: removeCinta,
  } = useFieldArray({
    control,
    name: "cintas",
  });

  const vigasWatch = watch("vigas");
  const vigasCimientoWatch = watch("vigas_cimiento");
  const cintasWatch = watch("cintas");

  const agregarViga = () => {
    appendViga({ largo: "", tipo: "1", id_ladrillo: "1", cantidad: "1" });
  };

  const agregarVigaCimiento = () => {
    appendVigaCimiento({ largo: "", cantidad: "1" });
  };

  const agregarCinta = () => {
    appendCinta({ largo: "", id_ladrillo: "1", cantidad: "1" });
  };

  const enviarCotizacion = async (formValues) => {
    const payload = {
      vigas: formValues.vigas.length > 0 ? formValues.vigas : null,
      viga_cimiento: formValues.vigas_cimiento.length > 0 ? formValues.vigas_cimiento : null,
      cintas: formValues.cintas.length > 0 ? formValues.cintas : null,
    };

    console.log("📤 Payload enviado:", JSON.stringify(payload, null, 2));

    try {
      const data = await request(apiUrls.cotizacion.cotizarVigas, {
        method: "POST",
        body: payload,
      });

      setCotizacion(data);
      setUltimoFormulario(formValues);
      alert("Cotización recibida ✅");
    } catch (error) {
      console.error("❌ Error al cotizar vigas:", error);
      const message =
        error?.message || "Ocurrió un problema al enviar la cotización. Intenta nuevamente.";
      alert(`❌ Error:\n\n${message}`);
    }
  };

  const resetFormulario = () => {
    reset(createVigasDefaultValues());
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
        <CotizacionVigasPDF cotizacion={cotizacion} params={ultimoFormulario} />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = `cotizacion-vigas-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(enlace);
      enlace.click();
      document.body.removeChild(enlace);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("❌ Error al generar PDF:", error);
      alert("No se pudo generar el PDF de la cotización.");
    }
  };

  const vigasGeneralError =
    errors.vigas && "message" in errors.vigas ? errors.vigas.message : undefined;

  if (cotizacion) {
    return (
      <div className="vigas-modal vigas-modal--results">
        <div className="vigas-card vigas-card--results">
          <header className="vigas-modal__header">
            <div>
              <p className="vigas-modal__eyebrow">Resumen de cotización</p>
              <h1>Vigas y cintas</h1>
              <p className="vigas-modal__hint">
                Descarga el detalle o reinicia con nuevos parámetros cuando lo necesites.
              </p>
            </div>
          </header>

          <div className="vigas-results">
            <pre className="vigas-results__log">{cotizacion.mano_obra}</pre>
            <div className="vigas-results__summary">
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

          <div className="vigas-actions">
            <button
              onClick={descargarPDF}
              className="vigas-button vigas-button--secondary"
              type="button"
            >
              Descargar PDF
            </button>
            <button onClick={resetFormulario} className="vigas-button" type="button">
              Nueva cotización
            </button>
            <button onClick={onClose} className="vigas-button vigas-button--ghost" type="button">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form className="vigas-modal" onSubmit={handleSubmit(enviarCotizacion)} noValidate>
      <header className="vigas-modal__header">
        <div>
          <button onClick={onVolver} className="vigas-button vigas-button--ghost" type="button">
            Volver
          </button>
          <h1>Vigas, Cintas y Vigas de cimiento</h1>
          <p className="vigas-modal__hint">
            Registra las vigas estructurales, vigas de cimiento y cintas necesarias para estimar la
            mano de obra y materiales.
          </p>
        </div>
        <TutorialButton variant="minimal" text="Tutorial" />
      </header>

      <div className="vigas-sections">
        <section className="vigas-card">
          <div className="vigas-card__header">
            <h2>Vigas estructurales</h2>
            <p className="vigas-card__helper">
              Ingresa las dimensiones y materiales de cada viga estructural presente en el proyecto.
            </p>
          </div>

          <div className="vigas-actions">
            <button
              type="button"
              onClick={agregarViga}
              className="vigas-button vigas-button--secondary"
            >
              Añadir viga
            </button>
          </div>

          {vigasGeneralError && <p className="vigas-field__error">{vigasGeneralError}</p>}

          <table className="vigas-table">
            <thead>
              <tr>
                <th>Largo (cm)</th>
                <th>Tipo</th>
                <th>Ladrillo</th>
                <th>Cantidad</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {vigasFields.map((field, index) => (
                <tr key={field.id}>
                  <td>
                    <input
                      type="number"
                      min="1"
                      {...register(`vigas.${index}.largo`)}
                      aria-invalid={errors.vigas?.[index]?.largo ? "true" : undefined}
                    />
                    {errors.vigas?.[index]?.largo && (
                      <p className="vigas-field__error">{errors.vigas[index].largo.message}</p>
                    )}
                  </td>
                  <td>
                    <select
                      {...register(`vigas.${index}.tipo`)}
                      aria-invalid={errors.vigas?.[index]?.tipo ? "true" : undefined}
                    >
                      {TIPO_VIGA_OPCIONES.map((opcion) => (
                        <option key={opcion.value} value={opcion.value}>
                          {opcion.label}
                        </option>
                      ))}
                    </select>
                    {errors.vigas?.[index]?.tipo && (
                      <p className="vigas-field__error">{errors.vigas[index].tipo.message}</p>
                    )}
                  </td>
                  <td>
                    <select
                      {...register(`vigas.${index}.id_ladrillo`)}
                      aria-invalid={errors.vigas?.[index]?.id_ladrillo ? "true" : undefined}
                    >
                      {TIPO_LADRILLO_OPCIONES.map((opcion) => (
                        <option key={opcion.value} value={opcion.value}>
                          {opcion.label}
                        </option>
                      ))}
                    </select>
                    {errors.vigas?.[index]?.id_ladrillo && (
                      <p className="vigas-field__error">
                        {errors.vigas[index].id_ladrillo.message}
                      </p>
                    )}
                  </td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      {...register(`vigas.${index}.cantidad`)}
                      aria-invalid={errors.vigas?.[index]?.cantidad ? "true" : undefined}
                    />
                    {errors.vigas?.[index]?.cantidad && (
                      <p className="vigas-field__error">
                        {errors.vigas[index].cantidad.message}
                      </p>
                    )}
                  </td>
                  <td>
                    {vigasFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeViga(index)}
                        className="vigas-button vigas-button--danger"
                      >
                        Eliminar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="vigas-card">
          <div className="vigas-card__header">
            <h2>Vigas de cimiento</h2>
            <p className="vigas-card__helper">
              Registra las vigas de cimiento si forman parte de la estructura del proyecto.
            </p>
          </div>

          <div className="vigas-actions">
            <button
              type="button"
              onClick={agregarVigaCimiento}
              className="vigas-button vigas-button--secondary"
            >
              Añadir viga de cimiento
            </button>
          </div>

          <table className="vigas-table">
            <thead>
              <tr>
                <th>Largo (cm)</th>
                <th>Cantidad</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {vigasCimientoFields.map((field, index) => (
                <tr key={field.id}>
                  <td>
                    <input
                      type="number"
                      min="1"
                      {...register(`vigas_cimiento.${index}.largo`)}
                      aria-invalid={
                        errors.vigas_cimiento?.[index]?.largo ? "true" : undefined
                      }
                    />
                    {errors.vigas_cimiento?.[index]?.largo && (
                      <p className="vigas-field__error">
                        {errors.vigas_cimiento[index].largo.message}
                      </p>
                    )}
                  </td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      {...register(`vigas_cimiento.${index}.cantidad`)}
                      aria-invalid={
                        errors.vigas_cimiento?.[index]?.cantidad ? "true" : undefined
                      }
                    />
                    {errors.vigas_cimiento?.[index]?.cantidad && (
                      <p className="vigas-field__error">
                        {errors.vigas_cimiento[index].cantidad.message}
                      </p>
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => removeVigaCimiento(index)}
                      className="vigas-button vigas-button--danger"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="vigas-card">
          <div className="vigas-card__header">
            <h2>Cintas estructurales</h2>
            <p className="vigas-card__helper">
              Registra las cintas necesarias, incluyendo sus dimensiones, ladrillo y cantidad.
            </p>
          </div>

          <div className="vigas-actions">
            <button
              type="button"
              onClick={agregarCinta}
              className="vigas-button vigas-button--secondary"
            >
              Añadir cinta
            </button>
          </div>

          <table className="vigas-table">
            <thead>
              <tr>
                <th>Largo (cm)</th>
                <th>Ladrillo</th>
                <th>Cantidad</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cintasFields.map((field, index) => (
                <tr key={field.id}>
                  <td>
                    <input
                      type="number"
                      min="1"
                      {...register(`cintas.${index}.largo`)}
                      aria-invalid={errors.cintas?.[index]?.largo ? "true" : undefined}
                    />
                    {errors.cintas?.[index]?.largo && (
                      <p className="vigas-field__error">{errors.cintas[index].largo.message}</p>
                    )}
                  </td>
                  <td>
                    <select
                      {...register(`cintas.${index}.id_ladrillo`)}
                      aria-invalid={
                        errors.cintas?.[index]?.id_ladrillo ? "true" : undefined
                      }
                    >
                      {TIPO_LADRILLO_OPCIONES.map((opcion) => (
                        <option key={opcion.value} value={opcion.value}>
                          {opcion.label}
                        </option>
                      ))}
                    </select>
                    {errors.cintas?.[index]?.id_ladrillo && (
                      <p className="vigas-field__error">
                        {errors.cintas[index].id_ladrillo.message}
                      </p>
                    )}
                  </td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      {...register(`cintas.${index}.cantidad`)}
                      aria-invalid={
                        errors.cintas?.[index]?.cantidad ? "true" : undefined
                      }
                    />
                    {errors.cintas?.[index]?.cantidad && (
                      <p className="vigas-field__error">
                        {errors.cintas[index].cantidad.message}
                      </p>
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => removeCinta(index)}
                      className="vigas-button vigas-button--danger"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <div className="vigas-actions">
        <button className="vigas-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : "Enviar cotización"}
        </button>
        <button onClick={onVolver} className="vigas-button vigas-button--ghost" type="button">
          Volver
        </button>
      </div>
    </form>
  );
}

