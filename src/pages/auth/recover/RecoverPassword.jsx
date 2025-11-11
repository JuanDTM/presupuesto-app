import { useState } from 'react';
import { authRepository } from '../../../modules/auth/repository/authRepository';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { recoverStep1Schema, recoverStep2Schema } from '../../../modules/auth/validation/schemas';
import { PREGUNTAS } from '../../../modules/auth/constants/preguntas';
import styles from './RecoverPassword.module.css';
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

  const emailError = step1.formState.errors.email?.message;
  const respuestaError = step2.formState.errors.respuesta_seguridad?.message;
  const nuevaPasswordError = step2.formState.errors.nueva_password?.message;
  const confirmacionError = step2.formState.errors.nueva_password_confirmation?.message;

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.brandIcon} aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </span>
          <span className={styles.brandText} onClick={() => navigate('/')}>COTIZACIÓN CON ESQUEMAS DE MEDIDAS</span>
        </div>
      </header>

      <main className={styles.wrapper}>
        <div className={styles.hero}>
          <h1>Recuperar contraseña</h1>
          <p>
            Introduce tu email para obtener la pregunta de seguridad.
          </p>
        </div>

        <div className={styles.card}>
          <form onSubmit={step1.handleSubmit(consultarPregunta)} className={styles.form}>
            <div className={`${styles.field} ${emailError ? styles.fieldError : ''}`}>
              <label className={styles.label} htmlFor="recover-email">
                Dirección de email
              </label>
              <div className={styles.inputWrapper}>
                <input
                  id="recover-email"
                  type="email"
                  className={`${styles.input} ${emailError ? styles.inputError : ''}`}
                  placeholder="tu@email.com"
                  {...step1.register('email')}
                  aria-invalid={!!emailError}
                />
                <span className={styles.inputIcon} aria-hidden="true">
                  ✉️
                </span>
              </div>
              {emailError && <p className={styles.error}>{emailError}</p>}
            </div>

            <button
              type="submit"
              disabled={loading || step1.formState.isSubmitting || !!pregunta}
              className={styles.primary}
            >
              {loading || step1.formState.isSubmitting ? 'Consultando...' : 'Obtener pregunta'}
            </button>
          </form>

          {pregunta && (
            <form onSubmit={step2.handleSubmit(cambiarPassword)} className={styles.form}>
              <div className={styles.question}>
                <p className={styles.questionLabel}>Pregunta de seguridad</p>
                <p className={styles.questionText}>{pregunta}</p>
              </div>

              <div className={`${styles.field} ${respuestaError ? styles.fieldError : ''}`}>
                <label className={styles.label} htmlFor="recover-respuesta">
                  Tu respuesta
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    id="recover-respuesta"
                    className={`${styles.input} ${respuestaError ? styles.inputError : ''}`}
                    placeholder="Escribe tu respuesta"
                    {...step2.register('respuesta_seguridad')}
                    aria-invalid={!!respuestaError}
                  />
                </div>
                {respuestaError && <p className={styles.error}>{respuestaError}</p>}
              </div>

              <div className={`${styles.field} ${nuevaPasswordError ? styles.fieldError : ''}`}>
                <label className={styles.label} htmlFor="recover-pass">
                  Nueva contraseña
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    id="recover-pass"
                    type="password"
                    className={`${styles.input} ${nuevaPasswordError ? styles.inputError : ''}`}
                    placeholder="Crea una contraseña segura"
                    {...step2.register('nueva_password')}
                    aria-invalid={!!nuevaPasswordError}
                  />
                </div>
                {nuevaPasswordError && <p className={styles.error}>{nuevaPasswordError}</p>}
              </div>

              <div className={`${styles.field} ${confirmacionError ? styles.fieldError : ''}`}>
                <label className={styles.label} htmlFor="recover-pass-confirm">
                  Confirmar contraseña
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    id="recover-pass-confirm"
                    type="password"
                    className={`${styles.input} ${confirmacionError ? styles.inputError : ''}`}
                    placeholder="Repite la contraseña"
                    {...step2.register('nueva_password_confirmation')}
                    aria-invalid={!!confirmacionError}
                  />
                </div>
                {confirmacionError && <p className={styles.error}>{confirmacionError}</p>}
              </div>

              <button
                type="submit"
                disabled={loading || step2.formState.isSubmitting}
                className={styles.primary}
              >
                {loading || step2.formState.isSubmitting ? 'Actualizando...' : 'Actualizar contraseña'}
              </button>
            </form>
          )}
        </div>

        {error && <p className={`${styles.feedback} ${styles.feedbackError}`}>{error}</p>}
        {okMsg && <p className={`${styles.feedback} ${styles.feedbackOk}`}>{okMsg}</p>}

        <Link to="/login" className={styles.linkBack}>
          ¿Recuperaste tu contraseña? Inicia sesión
        </Link>
      </main>
    </div>
  );
}


