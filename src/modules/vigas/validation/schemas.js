import { z } from "zod";

const positiveNumberString = (label, { min = 1 } = {}) =>
  z
    .string({ required_error: `Ingresa ${label}` })
    .trim()
    .min(1, `Ingresa ${label}`)
    .transform((val) => Number(val))
    .refine((val) => !Number.isNaN(val), { message: `Ingresa ${label}` })
    .refine((val) => val >= min, {
      message: `${label} debe ser mayor o igual a ${min}`,
    });

const numericOption = (label, allowedValues) =>
  z
    .string({ required_error: `Selecciona ${label}` })
    .trim()
    .min(1, `Selecciona ${label}`)
    .transform((val) => Number(val))
    .refine((val) => !Number.isNaN(val), { message: `Selecciona ${label}` })
    .refine((val) => allowedValues.includes(val), { message: `Selecciona ${label}` });

const vigaSchema = z.object({
  largo: positiveNumberString("el largo de la viga"),
  tipo: numericOption("el tipo de viga", [1, 2, 3, 4, 5]),
  id_ladrillo: numericOption("el tipo de ladrillo", [1, 4, 6, 7]),
  cantidad: positiveNumberString("la cantidad de vigas"),
});

const vigaCimientoSchema = z.object({
  largo: positiveNumberString("el largo de la viga de cimiento"),
  cantidad: positiveNumberString("la cantidad de vigas de cimiento"),
});

const cintaSchema = z.object({
  largo: positiveNumberString("el largo de la cinta"),
  id_ladrillo: numericOption("el tipo de ladrillo de la cinta", [1, 4, 6, 7]),
  cantidad: positiveNumberString("la cantidad de cintas"),
});

export const createVigasDefaultValues = () => ({
  vigas: [{ largo: "", tipo: "1", id_ladrillo: "1", cantidad: "1" }],
  vigas_cimiento: [],
  cintas: [],
});

export const vigasSchema = z
  .object({
    vigas: z.array(vigaSchema),
    vigas_cimiento: z.array(vigaCimientoSchema),
    cintas: z.array(cintaSchema),
  })
  .superRefine((data, ctx) => {
    const total =
      data.vigas.length + data.vigas_cimiento.length + data.cintas.length;
    if (total === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Agrega al menos una viga, viga de cimiento o cinta",
        path: ["vigas"],
      });
    }
  })
  .transform((data) => ({
    vigas: data.vigas.map((viga) => ({
      largo: viga.largo,
      tipo: viga.tipo,
      id_ladrillo: viga.id_ladrillo,
      cantidad: viga.cantidad,
    })),
    vigas_cimiento: data.vigas_cimiento.map((registro) => ({
      largo: registro.largo,
      cantidad: registro.cantidad,
    })),
    cintas: data.cintas.map((cinta) => ({
      largo: cinta.largo,
      id_ladrillo: cinta.id_ladrillo,
      cantidad: cinta.cantidad,
    })),
  }));

