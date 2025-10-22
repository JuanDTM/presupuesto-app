import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function LogoutButton({ children = 'Cerrar sesión' }) {
  const { logout } = useAuth();
  return (
    <button type="button" onClick={logout}>{children}</button>
  );
}


