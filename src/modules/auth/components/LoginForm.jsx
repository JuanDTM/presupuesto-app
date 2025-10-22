import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../validation/schemas';
import styles from './AuthForm.module.css';

export default function LoginForm({ onSuccess }) {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values) => {
    const ok = await login(values.email, values.password);
    if (ok) {
      toast.success('Bienvenido');
      navigate('/');
    } else {
      toast.error('Credenciales inválidas');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.container}>
      <h2 className={styles.heading}>Iniciar sesión</h2>
      <div className={styles.field}>
        <label className={styles.label}>Email</label>
        <input className={styles.input} type="email" {...register('email')} aria-invalid={!!errors.email} />
        {errors.email && <p className={styles.error}>{errors.email.message}</p>}
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Contraseña</label>
        <input className={styles.input} type="password" {...register('password')} aria-invalid={!!errors.password} />
        {errors.password && <p className={styles.error}>{errors.password.message}</p>}
      </div>
      {error && <p className={styles.error}>{error}</p>}
      <button type="submit" disabled={loading || isSubmitting} className={styles.button}>
        {loading || isSubmitting ? 'Entrando...' : 'Entrar'}
      </button>
      <div style={{ marginTop: 12, display: 'flex', gap: 12, justifyContent: 'space-between' }}>
        <Link to="/register">Crear cuenta</Link>
        <Link to="/recuperar">¿Olvidaste tu contraseña?</Link>
      </div>
    </form>
  );
}


