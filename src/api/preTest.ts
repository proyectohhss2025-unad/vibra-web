/**
 * API para gestionar los preTest
 */

import { PreTestResponse } from '@/models/preTest.entity';
import { config } from '@/config/config';

const environment = process.env.NODE_ENV || 'development';
const configAPI = {
    baseURL: config[environment].apiDashboard,
};

/**
 * Obtiene todos los preTest con paginación
 * @param page Número de página
 * @param rows Número de filas por página
 * @returns Lista de preTest y total de documentos
 */
export const getAll = async (page: number, rows: number): Promise<{ preTests: PreTestResponse[]; count: number }> => {
    try {
        const response = await fetch(`${configAPI.baseURL}/api/pretests?page=${page}&limit=${rows}`);
        const data = await response.json();
        return {
            preTests: data.data || [],
            count: data.total || 0
        };
    } catch (error) {
        console.error('Error al obtener preTests:', error);
        return {
            preTests: [],
            count: 0
        };
    }
};

/**
 * Obtiene todos los pre-tests de un usuario por su ID (ObjectId como string).
 * GET /api/pretests/search/user/:userId
 * Permiso requerido: P-EST-006
 *
 * NOTA: En MongoDB los pretests almacenan el _id del usuario como string
 * en el campo userId. Pasar el _id (ObjectId), NO el documentNumber.
 */
export const getByUserId = async (
  userId: string,
): Promise<any[]> => {
  try {
    const response = await fetch(
      `${configAPI.baseURL}/api/pretests/search/user/${userId}`,
    );
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : data?.data || data?.pretests || [];
  } catch (error) {
    console.error('Error al obtener pre-tests por usuario:', error);
    return [];
  }
};

export const getCountAllPretest = async () => {
    try {
        const response = await fetch(`${configAPI.baseURL}/api/pretests/count-all-pretests`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al obtener preTests:', error);
        return null;
    }
}

/**
 * Obtiene un preTest por su ID
 * @param id ID del preTest
 * @returns Datos del preTest
 */
export const getPreTestById = async (id: string) => {
    try {
        const response = await fetch(`${configAPI.baseURL}/api/pretests/${id}`);
        return await response.json();
    } catch (error) {
        console.error('Error al obtener preTest por ID:', error);
        throw error;
    }
};

/**
 * Crea o actualiza un preTest
 * @param id ID del preTest (opcional, para actualización)
 * @param title Título del preTest
 * @param description Descripción del preTest
 * @param questions Preguntas del preTest
 * @param difficulty Dificultad del preTest
 * @param timeLimit Tiempo límite para completar el test (en minutos)
 * @param passingScore Puntaje mínimo para aprobar (porcentaje)
 * @param category Categoría del preTest
 * @param tags Etiquetas del preTest
 * @param createdBy Usuario que crea el preTest
 * @returns Datos del preTest creado o actualizado
 */
export const createPreTest = async (
    id: string,
    title: string,
    description: string,
    questions: any[],
    difficulty: number,
    timeLimit: number,
    passingScore: number,
    category: string,
    tags: string[],
    createdBy: string
) => {
    try {
        const method = id ? 'PUT' : 'POST';
        const url = id
            ? `${configAPI.baseURL}/api/preTests/${id}`
            : `${configAPI.baseURL}/api/preTests`;

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title,
                description,
                questions,
                difficulty,
                timeLimit,
                passingScore,
                category,
                tags,
                createdBy,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }),
        });

        return await response.json();
    } catch (error) {
        console.error('Error al crear/actualizar preTest:', error);
        throw error;
    }
};

/**
 * Actualiza el estado de un preTest
 * @param id ID del preTest
 * @param status Nuevo estado ("true" o "false")
 * @returns Datos del preTest actualizado
 */
export const updatePreTestStatus = async (id: string, status: string) => {
    try {
        const response = await fetch(`${configAPI.baseURL}/api/preTests/${id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                isActive: status === 'true',
                updatedAt: new Date()
            }),
        });

        return await response.json();
    } catch (error) {
        console.error('Error al actualizar estado del preTest:', error);
        throw error;
    }
};

/**
 * Obtiene respuestas de un test específico con paginación
 * GET /api/pretests/by-test/:testId?page=1&limit=10
 */
export const getByTestId = async (
    testId: string,
    page = 1,
    limit = 10,
    userId?: string,
    dateFrom?: string,
    dateTo?: string,
): Promise<{ data: any[]; total: number }> => {
    try {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (userId) params.set('userId', userId);
        if (dateFrom) params.set('dateFrom', dateFrom);
        if (dateTo) params.set('dateTo', dateTo);
        const response = await fetch(`${configAPI.baseURL}/api/pretests/by-test/${testId}?${params.toString()}`);
        return await response.json();
    } catch (error) {
        console.error('Error al obtener respuestas por test:', error);
        return { data: [], total: 0 };
    }
};