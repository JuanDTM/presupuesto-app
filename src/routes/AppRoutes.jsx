import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../modules/auth/components/ProtectedRoute';
import PublicOnlyRoute from '../modules/auth/components/PublicOnlyRoute';
import LoginForm from '../pages/auth/login/LoginForm';
import RegisterForm from '../pages/auth/register/RegisterForm';
import RecoverPassword from '../pages/auth/recover/RecoverPassword';
import LogoutButton from '../modules/auth/components/LogoutButton';
import ComponenteEjesNodos from '../components/ComponenteEjesNodos';
import VentanaInicio from '../pages/home/VentanaInicio';
import styles from './AppRoutes.module.css';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Ventana de inicio pública en la raíz */}
      <Route path="/" element={<VentanaInicio />} />

      {/* Rutas públicas (solo para usuarios no autenticados) */}
      <Route path="/login" element={<PublicOnlyRoute><LoginForm /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><RegisterForm /></PublicOnlyRoute>} />
      <Route path="/recuperar" element={<PublicOnlyRoute><RecoverPassword /></PublicOnlyRoute>} />

      {/* Rutas protegidas: solo usuarios autenticados */}
      <Route
        path="/panel"
        element={
          <ProtectedRoute>
            <div className={styles.mainLayout}>
              <header className={styles.header}>
                <div className={styles.headerContent}>
                  <h1 className={styles.title}>
                    <span className={styles.titleIcon}>📐</span>
                    Editor de Planos y Presupuestos
                  </h1>
                  <div className={styles.headerActions}>
                    <LogoutButton />
                  </div>
                </div>
              </header>
              <ComponenteEjesNodos />
            </div>
          </ProtectedRoute>
        }
      />

      {/* Rutas no existentes redirigen al inicio */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}