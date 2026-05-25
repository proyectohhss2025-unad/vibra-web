/**
 * API para gestionar actividades (activities)
 * Alineado con el backend vibra-api (NestJS) y el modelo Activity
 */

import { config } from '@/config/config';
import { Activity } from '@/models/activity.entity';

const environment = process.env.NODE_ENV || 'development';
const configAPI = {
    baseURL: config[environment].apiDashboard,
};

// ─── DTOs ────────────────────────────────────────────────────────────

export interface CreateActivityPayload {
    title: string;
    description?: string;
    emotion: string;
    difficulty?: number;
    isActive?: boolean;
    resources?: Activity['resources'];
    questions?: Activity['questions'];
    schedule?: Activity['schedule'];
    type?: 'reto' | 'evento_personal' | 'actividad_pares' | 'otro';
    tips?: { emoji: string; message: string; category?: string }[];
    games?: { type: string; config: Record<string, any>; order: number }[];
    createdBy?: string;
}

export interface UpdateActivityPayload extends Partial<CreateActivityPayload> {
    isActive?: boolean;
}

export interface TodayActivityResponse {
    activity: Activity | null;
    schedule: {
        date: string;
        status: 'active' | 'no_activity';
    };
}

// ─── Funciones API ────────────────────────────────────────────────────

/**
 * Obtiene todas las actividades con paginación
 * GET /api/activities/all?page=&limit=
 */
export const getAll = async (page: number, limit: number): Promise<{ docs: Activity[]; totalDocs: number }> => {
    try {
        const response = await fetch(`${configAPI.baseURL}/api/activities/all?page=${page}&limit=${limit}`);
        const data = await response.json();
        return {
            docs: data.docs || [],
            totalDocs: data.totalDocs || 0,
        };
    } catch (error) {
        console.error('Error al obtener actividades:', error);
        return { docs: [], totalDocs: 0 };
    }
};

/**
 * Obtiene una actividad por su ID
 * GET /api/activities/:id
 */
export const getActivityById = async (id: string): Promise<Activity | null> => {
    try {
        const response = await fetch(`${configAPI.baseURL}/api/activities/${id}`);
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error('Error al obtener actividad por ID:', error);
        return null;
    }
};

/**
 * Crea una nueva actividad
 * POST /api/activities
 */
export const createActivity = async (data: CreateActivityPayload): Promise<Activity | null> => {
    try {
        const body = {
            title: data.title,
            description: data.description,
            emotion: data.emotion,
            difficulty: data.difficulty ?? 3,
            isActive: data.isActive ?? true,
            resources: data.resources ?? [],
            questions: data.questions ?? [],
            schedule: data.schedule,
            type: data.type ?? 'evento_personal',
            tips: data.tips ?? [],
            games: data.games ?? [],
        };

        console.log('[API] createActivity payload:', JSON.stringify(body, null, 2));

        const response = await fetch(`${configAPI.baseURL}/api/activities`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error('[API] Error al crear actividad:', response.status, errorText);
            let cleanMsg: string;
            try {
                const parsed = JSON.parse(errorText);
                cleanMsg = parsed.message || parsed.error || errorText.slice(0, 300);
            } catch { cleanMsg = errorText.slice(0, 300); }
            throw new Error(`${cleanMsg}`);
        }
        const result = await response.json();
        console.log('[API] createActivity respuesta:', result?._id);
        return result;
    } catch (error) {
        console.error('[API] Error en createActivity:', error);
        throw error;
    }
};

/**
 * Actualiza una actividad existente
 * PUT /api/activities/:id
 */
export const updateActivity = async (id: string, data: UpdateActivityPayload): Promise<Activity | null> => {
    try {
        const body: Record<string, any> = {};
        if (data.title !== undefined) body.title = data.title;
        if (data.description !== undefined) body.description = data.description;
        if (data.emotion !== undefined) body.emotion = data.emotion;
        if (data.difficulty !== undefined) body.difficulty = data.difficulty;
        if (data.isActive !== undefined) body.isActive = data.isActive;
        if (data.resources !== undefined) body.resources = data.resources;
        if (data.questions !== undefined) body.questions = data.questions;
        if (data.schedule !== undefined) body.schedule = data.schedule;
        if (data.type !== undefined) body.type = data.type;
        if (data.tips !== undefined) body.tips = data.tips;
        if (data.games !== undefined) body.games = data.games;

        console.log('[API] updateActivity payload:', JSON.stringify(body, null, 2));

        const response = await fetch(`${configAPI.baseURL}/api/activities/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error('[API] Error al actualizar actividad:', response.status, errorText);
            let cleanMsg: string;
            try {
                const parsed = JSON.parse(errorText);
                cleanMsg = parsed.message || parsed.error || errorText.slice(0, 300);
            } catch { cleanMsg = errorText.slice(0, 300); }
            throw new Error(`${cleanMsg}`);
        }
        const result = await response.json();
        console.log('[API] updateActivity respuesta:', result?._id);
        return result;
    } catch (error) {
        console.error('[API] Error en updateActivity:', error);
        throw error; // Lanzar para que el formulario lo capture
    }
};

/**
 * Cambia el estado activo/inactivo de una actividad
 * PUT /api/activities/:id
 * Envía todos los campos requeridos por el backend DTO
 */
export const updateActivityStatus = async (id: string, isActive: boolean, activity?: Activity): Promise<Activity | null> => {
    // El backend requiere emotion, title, resources, questions (DTO validation)
    // Si tenemos la actividad completa, enviamos todo para evitar 400
    if (activity) {
        const emotionId = typeof activity.emotion === 'object' && activity.emotion !== null
            ? (activity.emotion as any)._id ?? ''
            : activity.emotion ?? '';
        return updateActivity(id, {
            title: activity.title,
            description: activity.description,
            emotion: emotionId,
            difficulty: activity.difficulty,
            isActive,
            resources: activity.resources ?? [],
            questions: activity.questions ?? [],
            schedule: activity.schedule,
            type: (activity as any).type,
        });
    }
    // Fallback: solo cambia estado (puede fallar si el backend valida DTO completo)
    return updateActivity(id, { isActive });
};

/**
 * Obtiene el conteo total de actividades
 * GET /api/activities/count-all-activities
 */
export const getCountAllActivities = async (): Promise<{ count: number } | null> => {
    try {
        const response = await fetch(`${configAPI.baseURL}/api/activities/count-all-activities`);
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error('Error al obtener conteo de actividades:', error);
        return null;
    }
};

/**
 * Obtiene la actividad configurada para el día de hoy
 * GET /api/activities/daily/current
 */
export const getTodayActivity = async (): Promise<TodayActivityResponse | null> => {
    try {
        const response = await fetch(`${configAPI.baseURL}/api/activities/daily/current`);
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error('Error al obtener actividad del día:', error);
        return null;
    }
};

/**
 * Obtiene actividades completadas agrupadas por mes
 * GET /api/activities/by-month?year=&courseId=
 */
export const getActivitiesByMonth = async (year?: number, courseId?: string): Promise<{ month: number; count: number }[]> => {
    try {
        const y = year ?? new Date().getFullYear();
        const params = new URLSearchParams({ year: y.toString() });
        if (courseId) params.append('courseId', courseId);
        const response = await fetch(`${configAPI.baseURL}/api/activities/by-month?${params}`);
        if (!response.ok) return [];
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error al obtener actividades por mes:', error);
        return [];
    }
};

// ─── Funciones legacy (mantenidas para compatibilidad) ─────────────────

/**
 * Obtiene el conteo de actividades por tipo
 * GET /api/activities/count-by-type?type=reto
 */
export const getCountByType = async (type: string): Promise<{ count: number } | null> => {
    try {
        const response = await fetch(`${configAPI.baseURL}/api/activities/count-by-type?type=${type}`);
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error('Error al obtener conteo por tipo:', error);
        return null;
    }
};

/**
 * Obtiene el conteo de completaciones registradas hoy
 * GET /api/activity-completions/today-count
 */
export const getTodayCompletionsCount = async (): Promise<{ count: number } | null> => {
    try {
        const response = await fetch(`${configAPI.baseURL}/api/activity-completions/today-count`);
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error('Error al obtener completaciones de hoy:', error);
        return null;
    }
};

/** @deprecated Usar createActivity con objeto en su lugar */
export const createActivityLegacy = async (_id: string, name: string, description: string, status: string, startDate: Date, endDate: Date, assignedUsers: any[], priority: string, createdBy: string) => {
    console.warn('createActivityLegacy está obsoleto, usar createActivity(data)');
    return createActivity({ title: name, description, emotion: '', createdBy });
};
