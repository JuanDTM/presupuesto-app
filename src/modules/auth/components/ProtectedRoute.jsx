import React from 'react';
// Nota: requiere react-router-dom en el proyecto
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0) {
    const userRole = Number(user?.id_rol);

    if (!allowedRoles.includes(userRole)) {
      if (userRole === 1) return <Navigate to="/administrador" replace />;
      if (userRole === 3) return <Navigate to="/panel" replace />;
      return <Navigate to="/" replace />;
    }
  }

  return children;
}


