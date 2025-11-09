import React from 'react';
import { useAuth } from '../context/AuthContext';
import { DEPARTAMENTOS } from '../constants/departamentos';
import { PREGUNTAS } from '../constants/preguntas';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '../validation/schemas';
import styles from './AuthForm.module.css';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export default function RegisterForm({ onSuccess }) {
  const { register: doRegister, loading, error } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nombre_usuario: '',
      telefono: '',
      documento_identidad: '',
      email: '',
      id_departamento: '',
      password: '',
      password_confirmation: '',
      id_pregunta_seguridad: '',
      respuesta_seguridad: '',
    },
  });

  const onSubmit = async (values) => {
    const payload = {
      ...values,
      id_departamento: Number(values.id_departamento),
      id_pregunta_seguridad: Number(values.id_pregunta_seguridad),
    };
    const ok = await doRegister(payload);
    if (ok) {
      toast.success('Registro exitoso');
      navigate('/panel');
    } else {
      toast.error('No se pudo registrar');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.container}>
      <h2 className={styles.heading}>Registro</h2>
      <div>
        <div className={styles.field}>
          <label className={styles.label}>Nombre completo</label>
          <input className={styles.input} {...register('nombre_usuario')} aria-invalid={!!errors.nombre_usuario} />
          {errors.nombre_usuario && <p className={styles.error}>{errors.nombre_usuario.message}</p>}
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Teléfono</label>
          <input className={styles.input} {...register('telefono')} aria-invalid={!!errors.telefono} />
          {errors.telefono && <p className={styles.error}>{errors.telefono.message}</p>}
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Documento de identidad</label>
          <input className={styles.input} {...register('documento_identidad')} aria-invalid={!!errors.documento_identidad} />
          {errors.documento_identidad && <p className={styles.error}>{errors.documento_identidad.message}</p>}
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Email</label>
          <input className={styles.input} type="email" {...register('email')} aria-invalid={!!errors.email} />
          {errors.email && <p className={styles.error}>{errors.email.message}</p>}
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Departamento</label>
          <select className={styles.input} {...register('id_departamento')} aria-invalid={!!errors.id_departamento}>
            <option value="">Seleccione...</option>
            {DEPARTAMENTOS.map((d) => (
              <option key={d.id} value={d.id}>{d.nombre}</option>
            ))}
          </select>
          {errors.id_departamento && <p className={styles.error}>{errors.id_departamento.message}</p>}
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Contraseña</label>
          <input className={styles.input} type="password" {...register('password')} aria-invalid={!!errors.password} />
          {errors.password && <p className={styles.error}>{errors.password.message}</p>}
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Confirmar contraseña</label>
          <input className={styles.input} type="password" {...register('password_confirmation')} aria-invalid={!!errors.password_confirmation} />
          {errors.password_confirmation && <p className={styles.error}>{errors.password_confirmation.message}</p>}
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Pregunta de seguridad</label>
          <select className={styles.input} {...register('id_pregunta_seguridad')} aria-invalid={!!errors.id_pregunta_seguridad}>
            <option value="">Seleccione...</option>
            {PREGUNTAS.map((p) => (
              <option key={p.id} value={p.id}>{p.texto}</option>
            ))}
          </select>
          {errors.id_pregunta_seguridad && <p className={styles.error}>{errors.id_pregunta_seguridad.message}</p>}
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Respuesta de seguridad</label>
          <input className={styles.input} {...register('respuesta_seguridad')} aria-invalid={!!errors.respuesta_seguridad} />
          {errors.respuesta_seguridad && <p className={styles.error}>{errors.respuesta_seguridad.message}</p>}
        </div>
      </div>
      {error && <p className={styles.error}>{error}</p>}
      <button type="submit" disabled={loading || isSubmitting} className={styles.button}>
        {loading || isSubmitting ? 'Registrando...' : 'Registrarse'}
      </button>
      <div style={{ marginTop: 12 }}>
        <Link to="/login">¿Ya tienes cuenta? Inicia sesión</Link>
      </div>
    </form>
  );
}


