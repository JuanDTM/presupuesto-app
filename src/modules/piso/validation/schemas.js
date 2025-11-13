import { z } from "zod";

export const createPisoDefaultValues = () => ({
  largo: "",
  ancho: "",
  areas: [{ largo: "", ancho: "" }],
  losa: "2",
  mortero: "1",
  enchape: "1",
  remodelacion: false,
});

const dimensionSchema = (label) =>
  z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) {
        return null;
      }
      return value;
    },
    z.union([
      z.coerce
        .number({ invalid_type_error: `Ingresa el ${label}` })
        .min(1, `Ingresa el ${label}`),
      z.null(),
    ])
  );

const areaSchema = z.object({
  largo: z.coerce
    .number({ invalid_type_error: "Ingresa el largo del área" })
    .min(100, "Ingresa el largo del área"),
  ancho: z.coerce
    .number({ invalid_type_error: "Ingresa el ancho del área" })
    .min(100, "Ingresa el ancho del área"),
});

export const pisoSchema = z
  .object({
    largo: dimensionSchema("largo externo"),
    ancho: dimensionSchema("ancho externo"),
    losa: z.coerce
      .number({ invalid_type_error: "Selecciona el tipo de losa" })
      .int("Selecciona el tipo de losa")
      .min(0, "Selecciona el tipo de losa")
      .max(3, "Selecciona el tipo de losa"),
    mortero: z.coerce
      .number({ invalid_type_error: "Selecciona el mortero" })
      .int("Selecciona el mortero")
      .min(0, "Selecciona el mortero")
      .max(3, "Selecciona el mortero"),
    enchape: z.coerce
      .number({ invalid_type_error: "Selecciona el enchape" })
      .int("Selecciona el enchape")
      .min(0, "Selecciona el enchape")
      .max(2, "Selecciona el enchape"),
    remodelacion: z.boolean(),
    areas: z
      .array(areaSchema, { invalid_type_error: "Agrega al menos un área" })
      .min(1, "Agrega al menos un área"),
  })
  .superRefine((data, ctx) => {
    if (!data.remodelacion) {
      if (data.largo === null) {
        ctx.addIssue({
          code: "custom",
          message: "Ingresa el largo externo",
          path: ["largo"],
        });
      }
      if (data.ancho === null) {
        ctx.addIssue({
          code: "custom",
          message: "Ingresa el ancho externo",
          path: ["ancho"],
        });
      }
    }
  });

