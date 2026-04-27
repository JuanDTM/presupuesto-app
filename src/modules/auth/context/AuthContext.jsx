import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authRepository } from '../repository/authRepository';
import { setAuthToken } from '../../../lib/httpClient';

const AuthContext = createContext(null);

function getStoredJson(key) {
  const value = sessionStorage.getItem(key);
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function setStoredJson(key, value) {
  try {
    if (value === null || value === undefined) {
      sessionStorage.removeItem(key);
      return;
    }

    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredJson('user')); // { id, id_rol, terminos_condiciones }
  const [cliente, setCliente] = useState(() => getStoredJson('cliente')); // { id, nombre, estado }
  const [token, setToken] = useState(() => sessionStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  useEffect(() => {
    setStoredJson('user', user);
  }, [user]);

  useEffect(() => {
    setStoredJson('cliente', cliente);
  }, [cliente]);

  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      const { usuario, cliente: clienteArr, token: t } = await authRepository.login({ email, password });
      const nextUser = usuario || null;
      const nextCliente = clienteArr?.[0] || null;
      const nextToken = t || null;

      setStoredJson('user', nextUser);
      setStoredJson('cliente', nextCliente);
      setAuthToken(nextToken);

      setUser(nextUser);
      setCliente(nextCliente);
      setToken(nextToken);
      return { ok: true, user: usuario || null };
    } catch (e) {
      setError(e?.message || 'Error al iniciar sesión');
      return { ok: false, user: null };
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setError(null);
    setLoading(true);
    try {
      const { user: nuevo, token: t } = await authRepository.register(payload);
      const nextUser = nuevo
        ? { id: nuevo.id, id_rol: nuevo.id_rol, terminos_condiciones: nuevo.terminos_condiciones }
        : null;
      const nextToken = t || null;

      // Login automático tras registro
      setStoredJson('user', nextUser);
      setStoredJson('cliente', null);
      setAuthToken(nextToken);

      if (nextUser) setUser(nextUser);
      setCliente(null);
      setToken(nextToken);
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
    setStoredJson('user', null);
    setStoredJson('cliente', null);
    setAuthToken(null);
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


