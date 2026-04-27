import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PublicOnlyRoute({ children }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return children;
  }

  const userRole = Number(user?.id_rol);
  if (userRole === 1) return <Navigate to="/administrador" replace />;
  if (userRole === 3) return <Navigate to="/panel" replace />;

  return <Navigate to="/" replace />;
}


