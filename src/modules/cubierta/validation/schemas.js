import { z } from "zod";

const dimensionSchema = (label, { min, max }) =>
  z
    .string({ required_error: `Ingresa el ${label}` })
    .trim()
    .min(1, `Ingresa el ${label}`)
    .transform((val) => Number(val))
    .refine((val) => !Number.isNaN(val), { message: `Ingresa el ${label}` })
    .refine((val) => val >= min, {
      message: `${label} debe ser mayor o igual a ${min} cm`,
    })
    .refine((val) => val <= max, {
      message: `${label} debe ser menor o igual a ${max} cm`,
    });

const numericSelectSchema = (label, allowedValues) =>
  z
    .string({ required_error: `Selecciona ${label}` })
    .trim()
    .min(1, `Selecciona ${label}`)
    .transform((val) => Number(val))
    .refine((val) => !Number.isNaN(val), { message: `Selecciona ${label}` })
    .refine((val) => (allowedValues ? allowedValues.includes(val) : true), {
      message: `Selecciona ${label}`,
    });

export const createTechoDefaultValues = () => ({
  ancho: "250",
  largo: "300",
  altoInclinacion: "100",
  tipoTeja: "2",
  tipoLadrillo: "1",
  flanche: "1",
  cotizarTecho: true,
  cotizarMuros: false,
});

export const techoSchema = z
  .object({
    ancho: dimensionSchema("el ancho", { min: 100, max: 2000 }),
    largo: dimensionSchema("el largo", { min: 100, max: 2000 }),
    altoInclinacion: dimensionSchema("el alto de la inclinación", { min: 50, max: 500 }),
    tipoTeja: numericSelectSchema("el tipo de teja", [2, 3, 4, 5]),
    tipoLadrillo: numericSelectSchema("el tipo de ladrillo", [1, 4, 6, 7]),
    flanche: numericSelectSchema("el tipo de flanche", [0, 1, 2]),
    cotizarTecho: z.boolean(),
    cotizarMuros: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (!data.cotizarTecho && !data.cotizarMuros) {
      ctx.addIssue({
        code: "custom",
        message: "Selecciona al menos una opción de cotización",
        path: ["cotizarTecho"],
      });
      ctx.addIssue({
        code: "custom",
        message: "Selecciona al menos una opción de cotización",
        path: ["cotizarMuros"],
      });
    }
  })
  .transform((data) => ({
    ...data,
    ancho: Number(data.ancho),
    largo: Number(data.largo),
    altoInclinacion: Number(data.altoInclinacion),
    tipoTeja: Number(data.tipoTeja),
    tipoLadrillo: Number(data.tipoLadrillo),
    flanche: Number(data.flanche),
  }));

