import { z } from 'zod';

export const createMuroDefaultValues = () => ({
  cinta_corona: 1,
  viga_cimiento: 1,
  cinta_lateral: 1,
  pañete: 2,
  estuco: 2,
  pintura: 2,
  textura: 0,
  acabados_externos: 1,
  mamposteria: 1,
  ladrillo: 4,
  tipo: 2,
  muro: {
    tipo: 'muroEntero',
    piso: '1 de 1',
    ancho_estructura: '',
    ancho: '',
    clase: 1,
    estructura: 1,
    alto: '',
    medida1: 0,
    medida2: 0,
    medida3: 0,
    ventana: null,
  },
});

export const muroSchema = z.object({
  cinta_corona: z.coerce
    .number()
    .int()
    .min(0, 'Seleccione una opción válida')
    .max(1, 'Seleccione una opción válida'),
  viga_cimiento: z.coerce
    .number()
    .int()
    .min(0, 'Seleccione una opción válida')
    .max(1, 'Seleccione una opción válida'),
  cinta_lateral: z.coerce
    .number()
    .int()
    .min(0, 'Seleccione una opción válida')
    .max(2, 'Seleccione una opción válida'),
  pañete: z.coerce
    .number()
    .int()
    .min(0, 'Seleccione una opción válida')
    .max(2, 'Seleccione una opción válida'),
  estuco: z.coerce
    .number()
    .int()
    .min(0, 'Seleccione una opción válida')
    .max(2, 'Seleccione una opción válida'),
  pintura: z.coerce
    .number()
    .int()
    .min(0, 'Seleccione una opción válida')
    .max(2, 'Seleccione una opción válida'),
  textura: z.coerce
    .number()
    .int()
    .min(0, 'Seleccione una opción válida')
    .max(2, 'Seleccione una opción válida'),
  acabados_externos: z.coerce
    .number()
    .int()
    .min(0, 'Seleccione una opción válida')
    .max(1, 'Seleccione una opción válida'),
  mamposteria: z.coerce
    .number()
    .int()
    .min(0, 'Seleccione una opción válida')
    .max(1, 'Seleccione una opción válida'),
  ladrillo: z.coerce
    .number()
    .int()
    .min(1, 'Seleccione el tipo de ladrillo'),
  tipo: z.coerce
    .number()
    .int()
    .min(0, 'Seleccione un tipo de resistencia')
    .max(3, 'Seleccione un tipo de resistencia'),
  muro: z.object({
    tipo: z.enum(
      ['muroEntero', 'muroPuerta', 'muroVentana', 'muroPuertaVentana'],
      'Seleccione el tipo de muro'
    ),
    piso: z.string().min(1, 'Seleccione el piso'),
    ancho_estructura: z.coerce
      .number({ invalid_type_error: 'Ingrese el ancho estructural' })
      .positive('Debe ser mayor a cero')
      .min(100, 'Debe ser mayor a 100 cm'),
    ancho: z.coerce
      .number({ invalid_type_error: 'Ingrese el ancho libre' })
      .positive('Debe ser mayor a cero')
      .min(100, 'Debe ser mayor a 100 cm'),
    clase: z.coerce
      .number()
      .int()
      .min(0, 'Seleccione la clase de viga')
      .max(2, 'Seleccione la clase de viga'),
    estructura: z.coerce
      .number()
      .int()
      .min(0, 'Seleccione si es estructural')
      .max(1, 'Seleccione si es estructural'),
    alto: z.coerce
      .number({ invalid_type_error: 'Ingrese la altura' })
      .positive('Debe ser mayor a cero')
      .min(100, 'Debe ser mayor a 100 cm'),
  }),
});

