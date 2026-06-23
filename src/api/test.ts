/**
 * API para gestionar los Tests (definiciones)
 * Usa api (axios con JWT interceptor) para todas las peticiones.
 */

import { Test, TestPaginatedResponse } from '@/models/test.entity';
import api from '@/api/axios-instance';

/**
 * Obtiene todos los tests con paginación y filtros
 */
export const getAll = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  category?: string,
): Promise<TestPaginatedResponse> => {
  try {
    const params: Record<string, string> = { page: page.toString(), limit: limit.toString() };
    if (search) params.search = search;
    if (category) params.category = category;

    const res = await api.get('/api/tests', { params });
    return {
      data: res.data?.data || [],
      total: res.data?.total || 0,
    };
  } catch (error) {
    console.error('Error al obtener tests:', error);
    return { data: [], total: 0 };
  }
};

/**
 * Obtiene un test por su ID
 */
export const getTestById = async (id: string): Promise<Test | null> => {
  try {
    const res = await api.get(`/api/tests/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error al obtener test por ID:', error);
    throw error;
  }
};

/**
 * Crea un nuevo test
 */
export const createTest = async (test: Omit<Test, '_id' | 'createdAt' | 'updatedAt'>): Promise<Test> => {
  try {
    const res = await api.post('/api/tests', test);
    return res.data;
  } catch (error: any) {
    console.error('Error al crear test:', error);
    throw new Error(error?.response?.data?.message || 'Error al crear test');
  }
};

/**
 * Actualiza un test existente
 */
export const updateTest = async (id: string, test: Partial<Test>): Promise<Test> => {
  try {
    const res = await api.put(`/api/tests/${id}`, test);
    return res.data;
  } catch (error: any) {
    console.error('Error al actualizar test:', error);
    throw new Error(error?.response?.data?.message || 'Error al actualizar test');
  }
};

/**
 * Elimina un test
 */
export const deleteTest = async (id: string): Promise<void> => {
  try {
    await api.delete(`/api/tests/${id}`);
  } catch (error: any) {
    console.error('Error al eliminar test:', error);
    throw new Error(error?.response?.data?.message || 'Error al eliminar test');
  }
};

/**
 * Activa o desactiva un test
 */
export const toggleTestStatus = async (id: string): Promise<Test> => {
  try {
    const res = await api.patch(`/api/tests/${id}/status`);
    return res.data;
  } catch (error: any) {
    console.error('Error al cambiar estado del test:', error);
    throw new Error(error?.response?.data?.message || 'Error al cambiar estado del test');
  }
};
