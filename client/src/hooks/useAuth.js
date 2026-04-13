import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adbmx_token');
    const savedUser = localStorage.getItem('adbmx_user');
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('adbmx_token');
        localStorage.removeItem('adbmx_user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        localStorage.setItem('adbmx_token', response.data.token);
        localStorage.setItem('adbmx_user', JSON.stringify(response.data.user));
        setUser(response.data.user);
        return { success: true };
      }
      return { success: false, error: response.data.error };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error de conexion con el servidor' 
      };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('adbmx_token');
    localStorage.removeItem('adbmx_user');
    setUser(null);
  }, []);

  const updateUser = useCallback((userData) => {
    localStorage.setItem('adbmx_user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  return { user, login, logout, updateUser, loading };
};
