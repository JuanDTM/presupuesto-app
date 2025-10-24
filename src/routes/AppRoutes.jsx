import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../modules/auth/components/ProtectedRoute';
import PublicOnlyRoute from '../modules/auth/components/PublicOnlyRoute';
import LoginForm from '../modules/auth/components/LoginForm';
import RegisterForm from '../modules/auth/components/RegisterForm';
import RecoverPassword from '../modules/auth/components/RecoverPassword';
import LogoutButton from '../modules/auth/components/LogoutButton';
import ComponenteEjesNodos from '../components/ComponenteEjesNodos';
import styles from './AppRoutes.module.css';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicOnlyRoute><LoginForm /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><RegisterForm /></PublicOnlyRoute>} />
      <Route path="/recuperar" element={<PublicOnlyRoute><RecoverPassword /></PublicOnlyRoute>} />

      <Route
        path="/"
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

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}


