import { useState, useCallback } from 'react';
import api from '../lib/api';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const get = useCallback(async (url, params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(url, { params });
      return response.data;
    } catch (err) {
      const message = err.response?.data?.error || 'Error al obtener datos';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const post = useCallback(async (url, data = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(url, data);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.error || 'Error al guardar datos';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const put = useCallback(async (url, data = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(url, data);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.error || 'Error al actualizar datos';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const del = useCallback(async (url) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.delete(url);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.error || 'Error al eliminar datos';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, get, post, put, del, setError };
};
