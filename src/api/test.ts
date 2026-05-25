/**
 * API para gestionar los Tests (definiciones)
 */

import { Test, TestPaginatedResponse } from '@/models/test.entity';
import { config } from '@/config/config';

const environment = process.env.NODE_ENV || 'development';
const configAPI = {
  baseURL: config[environment].apiDashboard,
};

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
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);
    if (category) params.append('category', category);

    const response = await fetch(`${configAPI.baseURL}/api/tests?${params}`);
    const data = await response.json();
    return {
      data: data.data || [],
      total: data.total || 0,
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
    const response = await fetch(`${configAPI.baseURL}/api/tests/${id}`);
    return await response.json();
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
    const response = await fetch(`${configAPI.baseURL}/api/tests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(test),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al crear test');
    }
    return await response.json();
  } catch (error) {
    console.error('Error al crear test:', error);
    throw error;
  }
};

/**
 * Actualiza un test existente
 */
export const updateTest = async (id: string, test: Partial<Test>): Promise<Test> => {
  try {
    const response = await fetch(`${configAPI.baseURL}/api/tests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(test),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al actualizar test');
    }
    return await response.json();
  } catch (error) {
    console.error('Error al actualizar test:', error);
    throw error;
  }
};

/**
 * Elimina un test
 */
export const deleteTest = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${configAPI.baseURL}/api/tests/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al eliminar test');
    }
  } catch (error) {
    console.error('Error al eliminar test:', error);
    throw error;
  }
};

/**
 * Activa o desactiva un test
 */
export const toggleTestStatus = async (id: string): Promise<Test> => {
  try {
    const response = await fetch(`${configAPI.baseURL}/api/tests/${id}/status`, {
      method: 'PATCH',
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al cambiar estado del test');
    }
    return await response.json();
  } catch (error) {
    console.error('Error al cambiar estado del test:', error);
    throw error;
  }
};
