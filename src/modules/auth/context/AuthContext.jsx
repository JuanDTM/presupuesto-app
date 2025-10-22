import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authRepository } from '../repository/authRepository';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { id, id_rol, terminos_condiciones }
  const [cliente, setCliente] = useState(null); // { id, nombre, estado }
  const [token, setToken] = useState(() => sessionStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) sessionStorage.setItem('token', token);
    else sessionStorage.removeItem('token');
  }, [token]);

  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      const { usuario, cliente: clienteArr, token: t } = await authRepository.login({ email, password });
      setUser(usuario || null);
      setCliente(clienteArr?.[0] || null);
      setToken(t || null);
      return true;
    } catch (e) {
      setError(e?.message || 'Error al iniciar sesión');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setError(null);
    setLoading(true);
    try {
      const { user: nuevo, token: t } = await authRepository.register(payload);
      // Login automático tras registro
      if (nuevo) {
        setUser({ id: nuevo.id, id_rol: nuevo.id_rol, terminos_condiciones: nuevo.terminos_condiciones });
      }
      setCliente(null);
      setToken(t || null);
      return true;
    } catch (e) {
      setError(e?.message || 'Error al registrar');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try { await authRepository.logout(); } catch {}
    setUser(null);
    setCliente(null);
    setToken(null);
  };

  const value = useMemo(() => ({
    user,
    cliente,
    token,
    isAuthenticated: !!token,
    loading,
    error,
    login,
    register,
    logout,
  }), [user, cliente, token, loading, error]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);


