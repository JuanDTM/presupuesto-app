import { z } from "zod";

export const createCieloDefaultValues = () => ({
  areas: [{ largo: "", ancho: "", vacio: "" }],
  tipo: "1",
  estructura: "1",
  laminacion: "1",
  masilla: "1",
  pintura: "1",
});

const dimensionSchema = (label, { allowZero = false } = {}) =>
  z
    .string({ required_error: `Ingresa el ${label}` })
    .trim()
    .min(1, `Ingresa el ${label}`)
    .transform((val) => Number(val))
    .refine((val) => !Number.isNaN(val), { message: `Ingresa el ${label}` })
    .refine((val) => (allowZero ? val >= 0 : val > 0), {
      message: `Ingresa el ${label}`,
    })
    .refine((val) => val <= 100000, {
      message: `El ${label} es demasiado grande`,
    });

const areaSchema = z.object({
  largo: dimensionSchema("largo", { allowZero: false }),
  ancho: dimensionSchema("ancho", { allowZero: false }),
  vacio: dimensionSchema("vacío", { allowZero: true }),
});

export const cieloSchema = z
  .object({
    areas: z
      .array(areaSchema, { invalid_type_error: "Agrega al menos un área" })
      .min(1, "Agrega al menos un área"),
    tipo: z.coerce
      .number({ invalid_type_error: "Selecciona el tipo de cielo raso" })
      .int()
      .min(1, "Selecciona el tipo de cielo raso")
      .max(5, "Selecciona el tipo de cielo raso"),
    estructura: z.coerce
      .number({ invalid_type_error: "Selecciona si lleva estructura" })
      .int()
      .min(0, "Selecciona si lleva estructura")
      .max(1, "Selecciona si lleva estructura"),
    laminacion: z.coerce
      .number({ invalid_type_error: "Selecciona si lleva laminación" })
      .int()
      .min(0, "Selecciona si lleva laminación")
      .max(1, "Selecciona si lleva laminación"),
    masilla: z.coerce
      .number({ invalid_type_error: "Selecciona si lleva masilla" })
      .int()
      .min(0, "Selecciona si lleva masilla")
      .max(1, "Selecciona si lleva masilla"),
    pintura: z.coerce
      .number({ invalid_type_error: "Selecciona si lleva pintura" })
      .int()
      .min(0, "Selecciona si lleva pintura")
      .max(1, "Selecciona si lleva pintura"),
  })
  .superRefine((data, ctx) => {
    const tipo = Number(data.tipo);
    if ([4, 5].includes(tipo)) {
      if (data.masilla !== 0) {
        ctx.addIssue({
          code: "custom",
          message: "Los cielos PVC no requieren masilla",
          path: ["masilla"],
        });
      }
      if (data.pintura !== 0) {
        ctx.addIssue({
          code: "custom",
          message: "Los cielos PVC no requieren pintura",
          path: ["pintura"],
        });
      }
    }
  });

