import { z } from "zod";

// Schema para validar un punto hidráulico
const puntoSchema = z.object({
  id: z.number(),
  tipo: z.string().min(1, "El tipo es requerido"),
  x_cm: z.number().min(0, "La coordenada X debe ser mayor o igual a 0"),
  y_cm: z.number().min(0, "La coordenada Y debe ser mayor o igual a 0"),
  rotation: z.number().int().min(0).max(360),
});

// Schema para validar un eje secundario
const ejeSecundarioSchema = z.object({
  orientacion: z.enum(["V", "H"], {
    errorMap: () => ({ message: "La orientación debe ser 'V' (vertical) o 'H' (horizontal)" }),
  }),
  distancia_cm: z.number().positive("La distancia debe ser mayor a 0"),
});

// Schema para validar el plano
const planoSchema = z.object({
  ancho_cm: z.number().positive("El ancho debe ser mayor a 0"),
  largo_cm: z.number().positive("El largo debe ser mayor a 0"),
  puntos: z.array(puntoSchema).default([]),
  ejes_secundarios: z
    .array(ejeSecundarioSchema)
    .min(1, "Se requiere al menos un eje secundario"),
});

// Schema para validar un nivel
const nivelSchema = z.object({
  piso: z.boolean(),
  resane: z.boolean(),
  plano: planoSchema,
});

// Schema principal para el payload completo
export const hidraulicaPayloadSchema = z.object({
  niveles: z.array(nivelSchema).min(1, "Se requiere al menos un nivel"),
});

// Función helper para validar el payload antes de enviar
export const validateHidraulicaPayload = (payload) => {
  try {
    return {
      success: true,
      data: hidraulicaPayloadSchema.parse(payload),
      errors: null,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((err) => ({
        path: err.path.join("."),
        message: err.message,
      }));
      return {
        success: false,
        data: null,
        errors,
      };
    }
    return {
      success: false,
      data: null,
      errors: [{ path: "general", message: "Error de validación desconocido" }],
    };
  }
};

