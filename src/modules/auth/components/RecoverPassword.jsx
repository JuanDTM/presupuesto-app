import React, { useState } from 'react';
import { authRepository } from '../repository/authRepository';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { recoverStep1Schema, recoverStep2Schema } from '../validation/schemas';
import { PREGUNTAS } from '../constants/preguntas';
import styles from './AuthForm.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export default function RecoverPassword() {
  const [pregunta, setPregunta] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [okMsg, setOkMsg] = useState('');
  const navigate = useNavigate();

  const step1 = useForm({ resolver: zodResolver(recoverStep1Schema), defaultValues: { email: '' } });
  const step2 = useForm({ resolver: zodResolver(recoverStep2Schema), defaultValues: { respuesta_seguridad: '', nueva_password: '', nueva_password_confirmation: '' } });

  const consultarPregunta = async (values) => {
    setError('');
    setOkMsg('');
    setPregunta('');
    setLoading(true);
    try {
      const data = await authRepository.preguntaSeguridad(values.email);
      setPregunta(data?.pregunta_seguridad || '');
      toast.success('Pregunta obtenida');
    } catch (err) {
      setError(err?.message || 'No se pudo obtener la pregunta');
      toast.error('No se pudo obtener la pregunta');
    } finally {
      setLoading(false);
    }
  };

  const cambiarPassword = async (values) => {
    setError('');
    setOkMsg('');
    setLoading(true);
    try {
      const texto = (pregunta || '').trim();
      const match = PREGUNTAS.find((p) => p.texto === texto);
      const idPregunta = match ? match.id : undefined;
      if (!idPregunta) throw new Error('No se pudo determinar la pregunta de seguridad');

      await authRepository.recuperarPassword({
        email: step1.getValues('email'),
        id_pregunta_seguridad: Number(idPregunta),
        respuesta_seguridad: values.respuesta_seguridad,
        nueva_password: values.nueva_password,
        nueva_password_confirmation: values.nueva_password_confirmation,
      });
      setOkMsg('Contraseña actualizada exitosamente');
      toast.success('Contraseña actualizada');
      navigate('/login');
    } catch (err) {
      setError(err?.message || 'No se pudo actualizar la contraseña');
      toast.error('Error al actualizar contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Recuperar contraseña</h2>
      <form onSubmit={step1.handleSubmit(consultarPregunta)}>
        <div className={styles.field}>
          <label className={styles.label}>Email</label>
          <input className={styles.input} type="email" {...step1.register('email')} aria-invalid={!!step1.formState.errors.email} />
          {step1.formState.errors.email && <p className={styles.error}>{step1.formState.errors.email.message}</p>}
        </div>
        <button type="submit" disabled={loading || step1.formState.isSubmitting || !!pregunta} className={styles.button}>
          {loading || step1.formState.isSubmitting ? 'Consultando...' : 'Consultar pregunta'}
        </button>
      </form>

      {pregunta && (
        <form onSubmit={step2.handleSubmit(cambiarPassword)} style={{ marginTop: 16 }}>
          <p><strong>Pregunta:</strong> {pregunta}</p>
          <div className={styles.field}>
            <label className={styles.label}>Respuesta</label>
            <input className={styles.input} {...step2.register('respuesta_seguridad')} aria-invalid={!!step2.formState.errors.respuesta_seguridad} />
            {step2.formState.errors.respuesta_seguridad && <p className={styles.error}>{step2.formState.errors.respuesta_seguridad.message}</p>}
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Nueva contraseña</label>
            <input className={styles.input} type="password" {...step2.register('nueva_password')} aria-invalid={!!step2.formState.errors.nueva_password} />
            {step2.formState.errors.nueva_password && <p className={styles.error}>{step2.formState.errors.nueva_password.message}</p>}
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Confirmar contraseña</label>
            <input className={styles.input} type="password" {...step2.register('nueva_password_confirmation')} aria-invalid={!!step2.formState.errors.nueva_password_confirmation} />
            {step2.formState.errors.nueva_password_confirmation && <p className={styles.error}>{step2.formState.errors.nueva_password_confirmation.message}</p>}
          </div>
          <button type="submit" disabled={loading || step2.formState.isSubmitting} className={styles.button}>
            {loading || step2.formState.isSubmitting ? 'Actualizando...' : 'Cambiar contraseña'}
          </button>
        </form>
      )}

      {error && <p className={styles.error}>{error}</p>}
      {okMsg && <p className={styles.ok}>{okMsg}</p>}
      <div style={{ marginTop: 12 }}>
        <Link to="/login">Volver a iniciar sesión</Link>
      </div>
    </div>
  );
}


