/**
 * API para gestionar emociones (emotions)
 * Alineado con vibra-api (NestJS) y la colección emotions
 */

import { config } from '@/config/config';
import { Emotion } from '@/models/emotion.entity';

const environment = process.env.NODE_ENV || 'development';
const configAPI = {
    baseURL: config[environment].apiDashboard,
};

// ─── DTOs ────────────────────────────────────────────────────────────

export interface CreateEmotionPayload {
    id?: string;
    name: string;
    description?: string;
    orientationNote?: string;
    icono: string;
    percentNote?: number;
    category?: 'Positiva' | 'Negativa' | 'Neutra' | 'Basica' | 'Compleja';
    intensity?: number;
}

export interface UpdateEmotionPayload extends Partial<CreateEmotionPayload> {
    isActive?: boolean;
}

// ─── Funciones API ────────────────────────────────────────────────────

/**
 * Obtiene todas las emociones con paginación
 * GET /api/emotions?page=&limit=
 */
export const getAll = async (page: number, limit: number): Promise<{ data: Emotion[]; total: number }> => {
    try {
        const response = await fetch(`${configAPI.baseURL}/api/emotions?page=${page}&limit=${limit}`);
        if (!response.ok) return { data: [], total: 0 };
        return await response.json();
    } catch (error) {
        console.error('Error al obtener emociones:', error);
        return { data: [], total: 0 };
    }
};

/**
 * Obtiene una emoción por su ID
 * GET /api/emotions/:id
 */
export const getById = async (id: string): Promise<Emotion | null> => {
    try {
        const response = await fetch(`${configAPI.baseURL}/api/emotions/${id}`);
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error('Error al obtener emoción por ID:', error);
        return null;
    }
};

/**
 * Crea una nueva emoción
 * POST /api/emotions
 */
export const create = async (data: CreateEmotionPayload): Promise<Emotion | null> => {
    try {
        const response = await fetch(`${configAPI.baseURL}/api/emotions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error al crear emoción:', response.status, errorText);
            throw new Error(`Error al crear emoción (${response.status}): ${errorText.slice(0, 300)}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error en create emoción:', error);
        throw error;
    }
};

/**
 * Actualiza una emoción existente
 * PUT /api/emotions/:id
 */
export const update = async (id: string, data: UpdateEmotionPayload): Promise<Emotion | null> => {
    try {
        const response = await fetch(`${configAPI.baseURL}/api/emotions/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error al actualizar emoción:', response.status, errorText);
            throw new Error(`Error al actualizar emoción (${response.status}): ${errorText.slice(0, 300)}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error en update emoción:', error);
        throw error;
    }
};

/**
 * Cambia el estado activo/inactivo (soft delete / restore)
 * DELETE /api/emotions/:id
 */
export const toggleActive = async (id: string): Promise<Emotion | null> => {
    try {
        const response = await fetch(`${configAPI.baseURL}/api/emotions/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error('Error al cambiar estado de emoción:', error);
        return null;
    }
};

/**
 * Obtiene una emoción por nombre exacto
 * GET /api/emotions/by-name/:name
 */
export const getByName = async (name: string): Promise<Emotion | null> => {
    try {
        const response = await fetch(`${configAPI.baseURL}/api/emotions/by-name/${encodeURIComponent(name)}`);
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error('Error al obtener emoción por nombre:', error);
        return null;
    }
};

// ─── Funciones de Analítica ───────────────────────────────────────────

/**
 * Obtiene la distribución de emociones registradas (para gráfica donut)
 * GET /api/emotions/distribution?startDate=&endDate=&courseId=
 */
export const getEmotionDistribution = async (
    startDate?: string,
    endDate?: string,
    courseId?: string,
): Promise<{ name: string; value: number; icono: string }[]> => {
    try {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (courseId) params.append('courseId', courseId);
        const queryStr = params.toString();
        const url = `${configAPI.baseURL}/api/emotions/distribution${queryStr ? `?${queryStr}` : ''}`;
        const response = await fetch(url);
        if (!response.ok) return [];
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error al obtener distribución de emociones:', error);
        return [];
    }
};

/**
 * Obtiene la evolución temporal de emociones registradas por día
 * GET /api/emotions/evolution?days=&startDate=&endDate=&courseId=
 */
export const getEmotionEvolution = async (
    days: number = 30,
    startDate?: string,
    endDate?: string,
    courseId?: string,
): Promise<{ date: string; count: number }[]> => {
    try {
        const params = new URLSearchParams({ days: days.toString() });
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (courseId) params.append('courseId', courseId);
        const response = await fetch(`${configAPI.baseURL}/api/emotions/evolution?${params}`);
        if (!response.ok) return [];
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error al obtener evolución de emociones:', error);
        return [];
    }
};
