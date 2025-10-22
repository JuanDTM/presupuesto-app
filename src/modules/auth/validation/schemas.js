import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido').trim(),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

export const registerSchema = z.object({
  nombre_usuario: z.string().min(3, 'Mínimo 3 caracteres'),
  telefono: z.string().regex(/^\d{7,15}$/,'Solo dígitos (7-15)'),
  documento_identidad: z.string().regex(/^\d{6,20}$/,'Documento inválido'),
  email: z.string().email('Email inválido').trim(),
  id_departamento: z.coerce.number().int().min(1, 'Seleccione un departamento'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  password_confirmation: z.string().min(6, 'Mínimo 6 caracteres'),
  id_pregunta_seguridad: z.coerce.number().int().min(1, 'Seleccione una pregunta'),
  respuesta_seguridad: z.string().min(2, 'Muy corta'),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Las contraseñas no coinciden',
  path: ['password_confirmation'],
});

export const recoverStep1Schema = z.object({
  email: z.string().email('Email inválido').trim(),
});

export const recoverStep2Schema = z.object({
  respuesta_seguridad: z.string().min(2, 'Muy corta'),
  nueva_password: z.string().min(6, 'Mínimo 6 caracteres'),
  nueva_password_confirmation: z.string().min(6, 'Mínimo 6 caracteres'),
}).refine((data) => data.nueva_password === data.nueva_password_confirmation, {
  message: 'Las contraseñas no coinciden',
  path: ['nueva_password_confirmation'],
});


