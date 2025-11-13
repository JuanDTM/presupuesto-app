import { z } from "zod";

const positiveNumber = (label, { min = 1 } = {}) =>
  z
    .string({ required_error: `Ingresa ${label}` })
    .trim()
    .min(1, `Ingresa ${label}`)
    .transform((val) => Number(val))
    .refine((val) => !Number.isNaN(val), { message: `Ingresa ${label}` })
    .refine((val) => val >= min, {
      message: `${label} debe ser mayor o igual a ${min}`,
    });

const nonNegativeNumber = (label) =>
  z
    .string({ required_error: `Ingresa ${label}` })
    .trim()
    .min(1, `Ingresa ${label}`)
    .transform((val) => Number(val))
    .refine((val) => !Number.isNaN(val), { message: `Ingresa ${label}` })
    .refine((val) => val >= 0, {
      message: `${label} debe ser mayor o igual a 0`,
    });

const numericOption = (label, allowedValues) =>
  z
    .string({ required_error: `Selecciona ${label}` })
    .trim()
    .min(1, `Selecciona ${label}`)
    .transform((val) => Number(val))
    .refine((val) => !Number.isNaN(val), { message: `Selecciona ${label}` })
    .refine((val) => allowedValues.includes(val), { message: `Selecciona ${label}` });

const elementoSchema = (conMuros = true) =>
  z.object({
    largo: positiveNumber("el largo"),
    muros: conMuros ? nonNegativeNumber("los muros") : z.any().optional(),
    cantidad: positiveNumber("la cantidad"),
  });

export const createColumnasDefaultValues = () => ({
  id_ladrillo: "1",
  cintas: [{ largo: "", muros: "0", cantidad: "1" }],
  columnetas_corona: [],
  columnetas: [],
  columnas: [],
  columnas_grandes: [],
});

export const columnasSchema = z
  .object({
    id_ladrillo: numericOption("el tipo de ladrillo", [1, 4, 6, 7]),
    cintas: z.array(elementoSchema(true)),
    columnetas_corona: z.array(elementoSchema(true)),
    columnetas: z.array(elementoSchema(true)),
    columnas: z.array(elementoSchema(true)),
    columnas_grandes: z.array(elementoSchema(true)),
  })
  .superRefine((data, ctx) => {
    const total =
      data.cintas.length +
      data.columnetas_corona.length +
      data.columnetas.length +
      data.columnas.length +
      data.columnas_grandes.length;
    if (total === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Agrega al menos un elemento",
        path: ["cintas"],
      });
    }
  })
  .transform((data) => ({
    id_ladrillo: data.id_ladrillo,
    cintas: data.cintas.map((item) => ({
      largo: item.largo,
      muros: Number(item.muros),
      cantidad: item.cantidad,
    })),
    columnetas_corona: data.columnetas_corona.map((item) => ({
      largo: item.largo,
      muros: Number(item.muros),
      cantidad: item.cantidad,
    })),
    columnetas: data.columnetas.map((item) => ({
      largo: item.largo,
      muros: Number(item.muros),
      cantidad: item.cantidad,
    })),
    columnas: data.columnas.map((item) => ({
      largo: item.largo,
      muros: Number(item.muros),
      cantidad: item.cantidad,
    })),
    columnas_grandes: data.columnas_grandes.map((item) => ({
      largo: item.largo,
      muros: Number(item.muros),
      cantidad: item.cantidad,
    })),
  }));

