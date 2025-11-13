import { z } from "zod";

const pisoOptions = ["1 de 1", "1 de 2", "1 de 3", "2 de 2", "2 de 3", "3 de 3"];

const columnaSchema = z.object({
  tipo_columna: z
    .string({ required_error: "Selecciona el tipo de columna" })
    .trim()
    .min(1, "Selecciona el tipo de columna")
    .transform((val) => Number(val))
    .refine((val) => [1, 2, 3].includes(val), {
      message: "Selecciona el tipo de columna",
    }),
});

const resistenciaSchema = z.object({
  profundidad: z
    .string({ required_error: "Ingresa la profundidad" })
    .trim()
    .min(1, "Ingresa la profundidad")
    .transform((val) => Number(val))
    .refine((val) => !Number.isNaN(val), { message: "Ingresa la profundidad" })
    .refine((val) => val >= 0, { message: "La profundidad debe ser mayor o igual a 0" }),
  resistencia: z
    .string({ required_error: "Ingresa la resistencia" })
    .trim()
    .min(1, "Ingresa la resistencia")
    .transform((val) => Number(val))
    .refine((val) => !Number.isNaN(val), { message: "Ingresa la resistencia" })
    .refine((val) => val > 0, { message: "La resistencia debe ser mayor a 0" }),
});

export const createCimientosDefaultValues = () => ({
  piso: "1 de 1",
  columnas: [{ tipo_columna: "1" }],
  resistencia_terreno: [
    { profundidad: "0.2", resistencia: "30" },
    { profundidad: "1.2", resistencia: "165" },
    { profundidad: "4.5", resistencia: "180" },
    { profundidad: "8.0", resistencia: "195" },
    { profundidad: "15.0", resistencia: "205" },
  ],
});

export const cimientosSchema = z
  .object({
    piso: z.enum(pisoOptions, { errorMap: () => ({ message: "Selecciona el piso" }) }),
    columnas: z
      .array(columnaSchema, { invalid_type_error: "Agrega al menos una columna" })
      .min(1, "Agrega al menos una columna"),
    resistencia_terreno: z
      .array(resistenciaSchema, { invalid_type_error: "Agrega al menos una medición" })
      .min(1, "Agrega al menos una medición"),
  })
  .transform((data) => ({
    piso: data.piso,
    columnas: data.columnas.map((columna) => ({
      tipo_columna: Number(columna.tipo_columna),
    })),
    resistencia_terreno: data.resistencia_terreno.map((registro) => ({
      profundidad: Number(registro.profundidad),
      resistencia: Number(registro.resistencia),
    })),
  }));

