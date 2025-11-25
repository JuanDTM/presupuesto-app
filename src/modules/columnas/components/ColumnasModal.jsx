import React, { useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { pdf } from "@react-pdf/renderer";
import "./ColumnasModal.css";
import { request } from "../../../lib/httpClient";
import apiUrls from "../../../config/api_urls";
import { createColumnasDefaultValues, columnasSchema } from "../validation/schemas";
import CotizacionColumnasPDF from "./CotizacionColumnasPDF";
import TutorialButton from "../../../components/TutorialButton";

const TIPO_LADRILLO_OPCIONES = [
  { value: "1", label: "Farol 10×20×30" },
  { value: "4", label: "Farol 12×20×30" },
  { value: "6", label: "Tolete 10×6×20" },
  { value: "7", label: "Tolete 12×6×24.5" },
];

const crearCampo = () => ({ largo: "", muros: "0", cantidad: "1" });

export default function ColumnasModal({ onClose, onVolver }) {
  const [cotizacion, setCotizacion] = useState(null);
  const [ultimoFormulario, setUltimoFormulario] = useState(null);

  const defaultValues = useMemo(() => createColumnasDefaultValues(), []);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(columnasSchema),
    defaultValues,
    mode: "onBlur",
  });

  const {
    fields: cintasFields,
    append: appendCinta,
    remove: removeCinta,
  } = useFieldArray({
    control,
    name: "cintas",
  });

  const {
    fields: columnetasCoronaFields,
    append: appendColumnetaCorona,
    remove: removeColumnetaCorona,
  } = useFieldArray({
    control,
    name: "columnetas_corona",
  });

  const {
    fields: columnetasFields,
    append: appendColumneta,
    remove: removeColumneta,
  } = useFieldArray({
    control,
    name: "columnetas",
  });

  const {
    fields: columnasFields,
    append: appendColumna,
    remove: removeColumna,
  } = useFieldArray({
    control,
    name: "columnas",
  });

  const {
    fields: columnasGrandesFields,
    append: appendColumnaGrande,
    remove: removeColumnaGrande,
  } = useFieldArray({
    control,
    name: "columnas_grandes",
  });

  const agregarElemento = (appendFn) => appendFn(crearCampo());

  const enviarCotizacion = async (formValues) => {
    const payload = {
      id_ladrillo: formValues.id_ladrillo,
      cintas: formValues.cintas.length > 0 ? formValues.cintas : null,
      columnetas_corona:
        formValues.columnetas_corona.length > 0 ? formValues.columnetas_corona : null,
      columnetas: formValues.columnetas.length > 0 ? formValues.columnetas : null,
      columnas: formValues.columnas.length > 0 ? formValues.columnas : null,
      columnas_grandes:
        formValues.columnas_grandes.length > 0 ? formValues.columnas_grandes : null,
    };

    console.log("📤 Payload enviado:", JSON.stringify(payload, null, 2));

    try {
      const data = await request(apiUrls.cotizacion.cotizarColumnas, {
        method: "POST",
        body: payload,
      });

      setCotizacion(data);
      setUltimoFormulario(formValues);
      alert("Cotización recibida ✅");
    } catch (error) {
      console.error("❌ Error al cotizar columnas:", error);
      const message =
        error?.message || "Ocurrió un problema al enviar la cotización. Intenta nuevamente.";
      alert(`❌ Error:\n\n${message}`);
    }
  };

  const resetFormulario = () => {
    const defaults = createColumnasDefaultValues();
    reset(defaults);
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
        <CotizacionColumnasPDF cotizacion={cotizacion} params={ultimoFormulario} />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = `cotizacion-columnas-${new Date().toISOString().split("T")[0]}.pdf`;
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
      <div className="columnas-modal columnas-modal--results">
        <div className="columnas-card columnas-card--results">
          <header className="columnas-modal__header">
            <div>
              <p className="columnas-modal__eyebrow">Resumen de cotización</p>
              <h1>Columnas y columnetas</h1>
              <p className="columnas-modal__hint">
                Descarga el detalle o reinicia con nuevos parámetros cuando lo necesites.
              </p>
            </div>
          </header>

          <div className="columnas-results">
            <pre className="columnas-results__log">{cotizacion.mano_obra}</pre>
            <div className="columnas-results__summary">
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

          <div className="columnas-actions">
            <button
              onClick={descargarPDF}
              className="columnas-button columnas-button--secondary"
              type="button"
            >
              Descargar PDF
            </button>
            <button onClick={resetFormulario} className="columnas-button" type="button">
              Nueva cotización
            </button>
            <button
              onClick={onClose}
              className="columnas-button columnas-button--ghost"
              type="button"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const buildTable = (titulo, fields, name) => (
    <section className="columnas-card">
      <div className="columnas-card__header">
        <h2>{titulo}</h2>
        <p className="columnas-card__helper">
          Ingresa el largo, cantidad de muros asociados (si aplica) y la cantidad requerida.
        </p>
      </div>

      <div className="columnas-actions">
        <button
          type="button"
          onClick={() => agregarElemento(
            name === "cintas"
              ? appendCinta
              : name === "columnetas_corona"
              ? appendColumnetaCorona
              : name === "columnetas"
              ? appendColumneta
              : name === "columnas"
              ? appendColumna
              : appendColumnaGrande
          )}
          className="columnas-button columnas-button--secondary"
        >
          Añadir elemento
        </button>
      </div>

      <table className="columnas-table">
        <thead>
          <tr>
            <th>Largo (cm)</th>
            <th>Muros</th>
            <th>Cantidad</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field, index) => {
            const ruta = `${name}.${index}`;
            const errorCampo = errors[name]?.[index];
            return (
              <tr key={field.id}>
                <td>
                  <input
                    type="number"
                    min="1"
                    {...register(`${ruta}.largo`)}
                    aria-invalid={errorCampo?.largo ? "true" : undefined}
                  />
                  {errorCampo?.largo && (
                    <p className="columnas-field__error">{errorCampo.largo.message}</p>
                  )}
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    {...register(`${ruta}.muros`)}
                    aria-invalid={errorCampo?.muros ? "true" : undefined}
                  />
                  {errorCampo?.muros && (
                    <p className="columnas-field__error">{errorCampo.muros.message}</p>
                  )}
                </td>
                <td>
                  <input
                    type="number"
                    min="1"
                    {...register(`${ruta}.cantidad`)}
                    aria-invalid={errorCampo?.cantidad ? "true" : undefined}
                  />
                  {errorCampo?.cantidad && (
                    <p className="columnas-field__error">{errorCampo.cantidad.message}</p>
                  )}
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => {
                      const removeFn =
                        name === "cintas"
                          ? removeCinta
                          : name === "columnetas_corona"
                          ? removeColumnetaCorona
                          : name === "columnetas"
                          ? removeColumneta
                          : name === "columnas"
                          ? removeColumna
                          : removeColumnaGrande;
                      removeFn(index);
                    }}
                    className="columnas-button columnas-button--danger"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {errors[name] && Array.isArray(errors[name]) && errors[name].message && (
        <p className="columnas-field__error">{errors[name].message}</p>
      )}
    </section>
  );

  return (
    <form className="columnas-modal" onSubmit={handleSubmit(enviarCotizacion)} noValidate>
      <header className="columnas-modal__header">
        <div>
          <button onClick={onVolver} className="columnas-button columnas-button--ghost" type="button">
            Volver
          </button>
          <h1>Columnas, columnetas y cintas</h1>
          <p className="columnas-modal__hint">
            Registra los elementos necesarios de soporte vertical para estimar la obra civil.
          </p>
        </div>
        <TutorialButton variant="minimal" text="Tutorial" />
      </header>

      <div className="columnas-sections">
        <section className="columnas-card">
          <h2>Tipo de ladrillo</h2>
          <div className={`columnas-field ${errors.id_ladrillo ? "columnas-field--error" : ""}`}>
            <label htmlFor="columnas-ladrillo">Ladrillo base</label>
            <select
              id="columnas-ladrillo"
              {...register("id_ladrillo")}
              aria-invalid={errors.id_ladrillo ? "true" : undefined}
            >
              {TIPO_LADRILLO_OPCIONES.map((opcion) => (
                <option key={opcion.value} value={opcion.value}>
                  {opcion.label}
                </option>
              ))}
            </select>
            {errors.id_ladrillo && (
              <p className="columnas-field__error">{errors.id_ladrillo.message}</p>
            )}
            <p className="columnas-card__helper">
              Este ladrillo se utilizará para todos los elementos registrados debajo.
            </p>
          </div>
        </section>

        {buildTable("Cintas estructurales", cintasFields, "cintas")}
        {buildTable("Columnetas de corona", columnetasCoronaFields, "columnetas_corona")}
        {buildTable("Columnetas", columnetasFields, "columnetas")}
        {buildTable("Columnas", columnasFields, "columnas")}
        {buildTable("Columnas grandes", columnasGrandesFields, "columnas_grandes")}
      </div>

      <div className="columnas-actions">
        <button className="columnas-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : "Enviar cotización"}
        </button>
        <button
          onClick={onVolver}
          className="columnas-button columnas-button--ghost"
          type="button"
        >
          Volver
        </button>
      </div>
    </form>
  );
}

