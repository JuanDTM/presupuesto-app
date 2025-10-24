import React from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './LogoutButton.module.css';

export default function LogoutButton({ children = 'Cerrar sesión' }) {
  const { logout } = useAuth();
  return (
    <button type="button" onClick={logout} className={styles.logoutButton}>
      {children}
    </button>
  );
}


