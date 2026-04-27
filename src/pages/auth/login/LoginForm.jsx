import { useState } from 'react';
import { useAuth } from '../../../modules/auth/context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../../../modules/auth/validation/schemas';
import styles from './LoginForm.module.css';

export default function LoginForm({ onSuccess }) {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values) => {
    const result = await login(values.email, values.password);
    if (result.ok) {
      toast.success('Bienvenido');
      const userRole = Number(result.user?.id_rol);

      if (userRole === 1) {
        navigate('/administrador');
      } else if (userRole === 3) {
        navigate('/panel');
      } else {
        navigate('/');
      }
    } else {
      toast.error('Credenciales inválidas');
    }
  };

  return (
    <div className={styles.screen}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <div className={styles.brandIcon} aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
          <p className={styles.brandName}>COTIZACIÓN CON ESQUEMAS DE MEDIDAS</p>
        </div>
        <h1 className={styles.heading}>Bienvenido de vuelta</h1>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={`${styles.field} ${errors.email ? styles.fieldError : ''}`}>
            <label className={styles.label} htmlFor="login-email">
              Correo electrónico
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="login-email"
                className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                type="email"
                placeholder="Introduce tu correo electrónico"
                {...register('email')}
                aria-invalid={!!errors.email}
              />
            </div>
            {errors.email && <p className={styles.error}>{errors.email.message}</p>}
          </div>

          <div className={`${styles.field} ${errors.password ? styles.fieldError : ''}`}>
            <label className={styles.label} htmlFor="login-password">
              Contraseña
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="login-password"
                className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                type={mostrarPassword ? 'text' : 'password'}
                placeholder="Introduce tu contraseña"
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

          <Link to="/recuperar" className={styles.forgot}>
            ¿Olvidaste tu contraseña?
          </Link>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" disabled={loading || isSubmitting} className={styles.primary}>
            {loading || isSubmitting ? 'Entrando...' : 'Iniciar sesión'}
          </button>
        </form>
        <Link to="/register" className={styles.secondary}>
          Registrarse
        </Link>
      </div>
    </div>
  );
}