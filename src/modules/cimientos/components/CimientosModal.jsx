import React, { useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { pdf } from "@react-pdf/renderer";
import "./CimientosModal.css";
import { request } from "../../../lib/httpClient";
import apiUrls from "../../../config/api_urls";
import { createCimientosDefaultValues, cimientosSchema } from "../validation/schemas";
import CotizacionCimientosPDF from "./CotizacionCimientosPDF";

const TIPO_COLUMNA_OPCIONES = [
  { value: "1", label: "Columna de esquina" },
  { value: "2", label: "Columna lateral" },
  { value: "3", label: "Columna central" },
];

const PISOS_OPCIONES = ["1 de 1", "1 de 2", "1 de 3", "2 de 2", "2 de 3", "3 de 3"];

export default function CimientosModal({ onClose, onVolver }) {
  const [cotizacion, setCotizacion] = useState(null);
  const [ultimoFormulario, setUltimoFormulario] = useState(null);

  const defaultValues = useMemo(() => createCimientosDefaultValues(), []);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(cimientosSchema),
    defaultValues,
    mode: "onBlur",
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
    fields: resistenciaFields,
    append: appendResistencia,
    remove: removeResistencia,
  } = useFieldArray({
    control,
    name: "resistencia_terreno",
  });

  const columnasWatch = watch("columnas");

  const agregarColumna = () => {
    appendColumna({ tipo_columna: "1" });
  };

  const agregarResistencia = () => {
    appendResistencia({ profundidad: "0", resistencia: "0" });
  };

  const enviarCotizacion = async (formValues) => {
    const payload = {
      columnas: {
        datos: formValues.columnas.map((columna) => ({
          tipo_columna: columna.tipo_columna,
        })),
      },
      piso: formValues.piso,
      resistencia_terreno: formValues.resistencia_terreno.map((registro) => ({
        profundidad: registro.profundidad,
        resistencia: registro.resistencia,
      })),
    };

    console.log("📤 Payload enviado:", JSON.stringify(payload, null, 2));

    try {
      const data = await request(apiUrls.cotizacion.cotizarCimientos, {
        method: "POST",
        body: payload,
      });

      setCotizacion(data);
      setUltimoFormulario(formValues);
      alert("Cotización recibida ✅");
    } catch (error) {
      console.error("❌ Error al cotizar cimientos:", error);
      const message =
        error?.message || "Ocurrió un problema al enviar la cotización. Intenta nuevamente.";
      alert(`❌ Error:\n\n${message}`);
    }
  };

  const resetFormulario = () => {
    const defaults = createCimientosDefaultValues();
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
        <CotizacionCimientosPDF cotizacion={cotizacion} params={ultimoFormulario} />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = `cotizacion-cimientos-${new Date().toISOString().split("T")[0]}.pdf`;
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
      <div className="cimientos-modal cimientos-modal--results">
        <div className="cimientos-card cimientos-card--results">
          <header className="cimientos-modal__header">
            <div>
              <p className="cimientos-modal__eyebrow">Resumen de cotización</p>
              <h1>Cimientos</h1>
              <p className="cimientos-modal__hint">
                Descarga el detalle o reinicia con nuevos parámetros cuando lo necesites.
              </p>
            </div>
          </header>

          <div className="cimientos-results">
            <pre className="cimientos-results__log">{cotizacion.mano_obra}</pre>
            <div className="cimientos-results__summary">
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

          <div className="cimientos-actions">
            <button
              onClick={descargarPDF}
              className="cimientos-button cimientos-button--secondary"
              type="button"
            >
              Descargar PDF
            </button>
            <button onClick={resetFormulario} className="cimientos-button" type="button">
              Nueva cotización
            </button>
            <button
              onClick={onClose}
              className="cimientos-button cimientos-button--ghost"
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
    <form className="cimientos-modal" onSubmit={handleSubmit(enviarCotizacion)} noValidate>
      <header className="cimientos-modal__header">
        <div>
          <button onClick={onVolver} className="cimientos-button cimientos-button--ghost" type="button">
            Volver
          </button>
          <h1>Cimientos</h1>
          <p className="cimientos-modal__hint">
            Configura las columnas y las mediciones de resistencia del terreno para estimar el
            diseño de cimientos.
          </p>
        </div>
      </header>

      <div className="cimientos-sections">
        <section className="cimientos-card">
          <h2>Nivel de construcción</h2>
          <div className={`cimientos-field ${errors.piso ? "cimientos-field--error" : ""}`}>
            <label htmlFor="cimientos-piso">Selecciona el piso</label>
            <select
              id="cimientos-piso"
              {...register("piso")}
              aria-invalid={errors.piso ? "true" : undefined}
            >
              {PISOS_OPCIONES.map((opcion) => (
                <option key={opcion} value={opcion}>
                  {opcion}
                </option>
              ))}
            </select>
            {errors.piso && <p className="cimientos-field__error">{errors.piso.message}</p>}
          </div>
        </section>

        <section className="cimientos-card">
          <div className="cimientos-card__header">
            <h2>Columnas</h2>
            <p className="cimientos-card__helper">
              Añade los tipos de columna requeridos para este nivel. Puedes combinar columnas de
              esquina, laterales o centrales.
            </p>
          </div>

          <div className="cimientos-actions">
            <button
              type="button"
              onClick={agregarColumna}
              className="cimientos-button cimientos-button--secondary"
            >
              Añadir columna
            </button>
          </div>

          {errors.columnas && (
            <p className="cimientos-field__error">{errors.columnas.message}</p>
          )}

          <div className="cimientos-list">
            {columnasFields.map((columna, index) => {
              const errorColumna = errors.columnas?.[index]?.tipo_columna;
              const selectedValue = columnasWatch?.[index]?.tipo_columna ?? columna.tipo_columna;
              const nombreColumna =
                TIPO_COLUMNA_OPCIONES.find((opcion) => opcion.value === selectedValue)?.label ||
                "Columna";
              return (
                <div key={columna.id} className="cimientos-chip">
                  <div>
                    Columna #{index + 1} · {nombreColumna}
                  </div>
                  <div className="cimientos-actions" style={{ gap: "8px" }}>
                    <select
                      {...register(`columnas.${index}.tipo_columna`)}
                      aria-invalid={errorColumna ? "true" : undefined}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "12px",
                        border: errorColumna
                          ? "1px solid #d14352"
                          : "1px solid rgba(214, 221, 239, 0.9)",
                        background: errorColumna ? "#fff4f4" : "#ffffff",
                      }}
                    >
                      {TIPO_COLUMNA_OPCIONES.map((opcion) => (
                        <option key={opcion.value} value={opcion.value}>
                          {opcion.label}
                        </option>
                      ))}
                    </select>
                    {columnasFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeColumna(index)}
                        className="cimientos-button cimientos-button--danger"
                        style={{ padding: "10px 16px" }}
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                  {errorColumna && (
                    <p className="cimientos-field__error">{errorColumna.message}</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="cimientos-card">
          <div className="cimientos-card__header">
            <h2>Resistencia del terreno</h2>
            <p className="cimientos-card__helper">
              Ingresa las mediciones del estudio de suelos (profundidad y resistencia). Se requiere
              al menos una medición para generar la cotización.
            </p>
          </div>

          <div className="cimientos-actions">
            <button
              type="button"
              onClick={agregarResistencia}
              className="cimientos-button cimientos-button--secondary"
            >
              Añadir medición
            </button>
          </div>

          <table className="cimientos-table">
            <thead>
              <tr>
                <th>Profundidad (m)</th>
                <th>Resistencia (kN/m²)</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {resistenciaFields.map((campo, index) => (
                <tr key={campo.id}>
                  <td>
                    <input
                      type="number"
                      step="0.1"
                      {...register(`resistencia_terreno.${index}.profundidad`)}
                      aria-invalid={
                        errors.resistencia_terreno?.[index]?.profundidad ? "true" : undefined
                      }
                    />
                    {errors.resistencia_terreno?.[index]?.profundidad && (
                      <p className="cimientos-field__error">
                        {errors.resistencia_terreno[index].profundidad.message}
                      </p>
                    )}
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.1"
                      {...register(`resistencia_terreno.${index}.resistencia`)}
                      aria-invalid={
                        errors.resistencia_terreno?.[index]?.resistencia ? "true" : undefined
                      }
                    />
                    {errors.resistencia_terreno?.[index]?.resistencia && (
                      <p className="cimientos-field__error">
                        {errors.resistencia_terreno[index].resistencia.message}
                      </p>
                    )}
                  </td>
                  <td>
                    {resistenciaFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeResistencia(index)}
                        className="cimientos-button cimientos-button--danger"
                      >
                        Eliminar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {errors.resistencia_terreno && (
            <p className="cimientos-field__error">{errors.resistencia_terreno.message}</p>
          )}
        </section>
      </div>

      <div className="cimientos-actions">
        <button className="cimientos-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : "Enviar cotización"}
        </button>
        <button onClick={onVolver} className="cimientos-button cimientos-button--ghost" type="button">
          Volver
        </button>
      </div>
    </form>
  );
}

