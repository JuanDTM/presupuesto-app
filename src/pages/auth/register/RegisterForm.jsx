import { useState } from 'react';
import { useAuth } from '../../../modules/auth/context/AuthContext';
import { DEPARTAMENTOS } from '../../../modules/auth/constants/departamentos';
import { PREGUNTAS } from '../../../modules/auth/constants/preguntas';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '../../../modules/auth/validation/schemas';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import styles from './RegisterForm.module.css';

export default function RegisterForm({ onSuccess }) {
  const { register: doRegister, loading, error } = useAuth();
  const navigate = useNavigate();
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
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
    <div className={styles.screen}>
      <div className={styles.card}>
        <div className={styles.left}>
          <div className={styles.overlay} />
          <div className={styles.leftContent}>
            <h2>Construye tus proyectos con precisión.</h2>
            <p>
              Cotiza, planifica y ejecuta tus obras con herramientas diseñadas para profesionales
              de la construcción.
            </p>
          </div>
        </div>
        <div className={styles.right}>
          <div className={styles.brand}>
            <div className={styles.brandIcon} aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>
            <p className={styles.brandName}>COTIZACIÓN CON ESQUEMAS DE MEDIDAS</p>
          </div>
          <div className={styles.heading}>
            <h1>Crea tu cuenta</h1>
            <p>
              Regístrate para empezar a cotizar tus proyectos de construcción y mejorar la gestión
              de tus obras.
            </p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <div
              className={`${styles.field} ${errors.nombre_usuario ? styles.fieldError : ''}`}
            >
              <label className={styles.label} htmlFor="register-nombre">
                Nombre completo
              </label>
              <div className={styles.inputWrapper}>
                <input
                  id="register-nombre"
                  className={`${styles.input} ${
                    errors.nombre_usuario ? styles.inputError : ''
                  }`}
                  placeholder="Introduce tu nombre"
                  {...register('nombre_usuario')}
                  aria-invalid={!!errors.nombre_usuario}
                />
              </div>
              {errors.nombre_usuario && (
                <p className={styles.error}>{errors.nombre_usuario.message}</p>
              )}
            </div>

            <div className={`${styles.field} ${errors.email ? styles.fieldError : ''}`}>
              <label className={styles.label} htmlFor="register-email">
                Correo electrónico
              </label>
              <div className={styles.inputWrapper}>
                <input
                  id="register-email"
                  className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                  type="email"
                  placeholder="tu.email@ejemplo.com"
                  {...register('email')}
                  aria-invalid={!!errors.email}
                />
              </div>
              {errors.email && <p className={styles.error}>{errors.email.message}</p>}
            </div>

            <div className={`${styles.field} ${errors.password ? styles.fieldError : ''}`}>
              <label className={styles.label} htmlFor="register-password">
                Contraseña
              </label>
              <div className={styles.inputWrapper}>
                <input
                  id="register-password"
                  className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                  type={mostrarPassword ? 'text' : 'password'}
                  placeholder=""
                  {...register('password')}
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  className={styles.toggle}
                  onClick={() => setMostrarPassword((prev) => !prev)}
                  aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {mostrarPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <p className={styles.error}>{errors.password.message}</p>}
            </div>

            <div
              className={`${styles.field} ${
                errors.password_confirmation ? styles.fieldError : ''
              }`}
            >
              <label className={styles.label} htmlFor="register-confirm">
                Confirmar contraseña
              </label>
              <div className={styles.inputWrapper}>
                <input
                  id="register-confirm"
                  className={`${styles.input} ${
                    errors.password_confirmation ? styles.inputError : ''
                  }`}
                  type={mostrarConfirmacion ? 'text' : 'password'}
                  placeholder=""
                  {...register('password_confirmation')}
                  aria-invalid={!!errors.password_confirmation}
                />
                <button
                  type="button"
                  className={styles.toggle}
                  onClick={() => setMostrarConfirmacion((prev) => !prev)}
                  aria-label={
                    mostrarConfirmacion ? 'Ocultar confirmación' : 'Mostrar confirmación'
                  }
                >
                  {mostrarConfirmacion ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password_confirmation && (
                <p className={styles.error}>{errors.password_confirmation.message}</p>
              )}
            </div>

            <div
              className={`${styles.field} ${errors.id_departamento ? styles.fieldError : ''}`}
            >
              <label className={styles.label} htmlFor="register-departamento">
                Departamento
              </label>
              <div className={styles.inputWrapper}>
                <select
                  id="register-departamento"
                  className={`${styles.input} ${
                    errors.id_departamento ? styles.inputError : ''
                  }`}
                  {...register('id_departamento')}
                  aria-invalid={!!errors.id_departamento}
                >
                  <option value="">Selecciona departamento</option>
                  {DEPARTAMENTOS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nombre}
                    </option>
                  ))}
                </select>
              </div>
              {errors.id_departamento && (
                <p className={styles.error}>{errors.id_departamento.message}</p>
              )}
            </div>

            <div
              className={`${styles.field} ${
                errors.documento_identidad ? styles.fieldError : ''
              }`}
            >
              <label className={styles.label} htmlFor="register-documento">
                Documento de identidad
              </label>
              <div className={styles.inputWrapper}>
                <input
                  id="register-documento"
                  className={`${styles.input} ${
                    errors.documento_identidad ? styles.inputError : ''
                  }`}
                  placeholder="Número de documento"
                  {...register('documento_identidad')}
                  aria-invalid={!!errors.documento_identidad}
                />
              </div>
              {errors.documento_identidad && (
                <p className={styles.error}>{errors.documento_identidad.message}</p>
              )}
            </div>

            <div className={`${styles.field} ${errors.telefono ? styles.fieldError : ''}`}>
              <label className={styles.label} htmlFor="register-telefono">
                Teléfono
              </label>
              <div className={styles.inputWrapper}>
                <input
                  id="register-telefono"
                  className={`${styles.input} ${errors.telefono ? styles.inputError : ''}`}
                  placeholder="Tu número de contacto"
                  {...register('telefono')}
                  aria-invalid={!!errors.telefono}
                  type="number"
                />
              </div>
              {errors.telefono && <p className={styles.error}>{errors.telefono.message}</p>}
            </div>

            <div
              className={`${styles.field} ${
                errors.id_pregunta_seguridad ? styles.fieldError : ''
              }`}
            >
              <label className={styles.label} htmlFor="register-pregunta">
                Pregunta de seguridad
              </label>
              <div className={styles.inputWrapper}>
                <select
                  id="register-pregunta"
                  className={`${styles.input} ${
                    errors.id_pregunta_seguridad ? styles.inputError : ''
                  }`}
                  {...register('id_pregunta_seguridad')}
                  aria-invalid={!!errors.id_pregunta_seguridad}
                >
                  <option value="">Selecciona una pregunta</option>
                  {PREGUNTAS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.texto}
                    </option>
                  ))}
                </select>
              </div>
              {errors.id_pregunta_seguridad && (
                <p className={styles.error}>{errors.id_pregunta_seguridad.message}</p>
              )}
            </div>

            <div
              className={`${styles.field} ${
                errors.respuesta_seguridad ? styles.fieldError : ''
              }`}
            >
              <label className={styles.label} htmlFor="register-respuesta">
                Respuesta de seguridad
              </label>
              <div className={styles.inputWrapper}>
                <input
                  id="register-respuesta"
                  className={`${styles.input} ${
                    errors.respuesta_seguridad ? styles.inputError : ''
                  }`}
                  placeholder="Escribe tu respuesta"
                  {...register('respuesta_seguridad')}
                  aria-invalid={!!errors.respuesta_seguridad}
                />
              </div>
              {errors.respuesta_seguridad && (
                <p className={styles.error}>{errors.respuesta_seguridad.message}</p>
              )}
            </div>

            {error && <p className={`${styles.error} ${styles.formError}`}>{error}</p>}

            <button type="submit" disabled={loading || isSubmitting} className={styles.primary}>
              {loading || isSubmitting ? 'Registrando...' : 'Crear cuenta'}
            </button>
          </form>
          <p className={styles.footer}>
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className={styles.link}>
              Inicia sesión
            </Link>
          </p>
          <p className={styles.terms}>
            Al crear una cuenta aceptas nuestros{' '}
            <a href="#" onClick={(e) => e.preventDefault()}>
              Términos de servicio
            </a>{' '}
            y{' '}
            <a href="#" onClick={(e) => e.preventDefault()}>
              Política de privacidad
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}