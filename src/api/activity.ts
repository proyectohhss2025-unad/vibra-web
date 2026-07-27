/**
 * API para gestionar actividades (activities)
 * Alineado con el backend vibra-api (NestJS) y el modelo Activity
 */

import { Activity } from '@/models/activity.entity';
import api from '@/api/axios-instance';

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

export const getAll = async (page: number, limit: number): Promise<{ docs: Activity[]; totalDocs: number }> => {
    try {
        const res = await api.get('/api/activities/all', { params: { page, limit } });
        return {
            docs: res.data?.docs || [],
            totalDocs: res.data?.totalDocs || 0,
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
        const res = await api.get(`/api/activities/${id}`);
        return res.data;
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
    const res = await api.post('/api/activities', body);
    return res.data;
};

/**
 * Actualiza una actividad existente
 * PUT /api/activities/:id
 */
export const updateActivity = async (id: string, data: UpdateActivityPayload): Promise<Activity | null> => {
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

    const res = await api.put(`/api/activities/${id}`, body);
    return res.data;
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
export const getCountAllActivities = async (dateInit?: string, dateEnd?: string): Promise<{ count: number } | null> => {
    try {
        const params: Record<string, string> = {};
        if (dateInit) params.dateInit = dateInit;
        if (dateEnd) params.dateEnd = dateEnd;
        const res = await api.get('/api/activities/count-all-activities', { params });
        return res.data;
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
        const res = await api.get('/api/activities/daily/current');
        return res.data;
    } catch (error) {
        console.error('Error al obtener actividad del día:', error);
        return null;
    }
};

export const checkActivityDate = async (date: string, excludeId?: string): Promise<boolean> => {
    try {
        const params: Record<string, string> = { date };
        if (excludeId) params.excludeId = excludeId;
        const res = await api.get('/api/activities/check-date', { params });
        return res.data?.exists ?? false;
    } catch (error) {
        console.error('Error al verificar fecha:', error);
        return false;
    }
};

export const getActivitiesByMonth = async (year?: number, courseId?: string): Promise<{ month: number; count: number }[]> => {
    try {
        const params: Record<string, string> = { year: (year ?? new Date().getFullYear()).toString() };
        if (courseId) params.courseId = courseId;
        const res = await api.get('/api/activities/by-month', { params });
        return Array.isArray(res.data) ? res.data : [];
    } catch (error) {
        console.error('Error al obtener actividades por mes:', error);
        return [];
    }
};

/**
 * Obtiene actividades CREADAS agrupadas por mes
 * GET /api/activities/created-by-month
 */
export const getCreatedActivitiesByMonth = async (year?: number): Promise<{ month: number; count: number }[]> => {
    try {
        const params: Record<string, string> = { year: (year ?? new Date().getFullYear()).toString() };
        const res = await api.get('/api/activities/created-by-month', { params });
        return Array.isArray(res.data) ? res.data : [];
    } catch (error) {
        console.error('Error al obtener actividades creadas por mes:', error);
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
        const res = await api.get('/api/activities/count-by-type', { params: { type } });
        return res.data;
    } catch (error) {
        console.error('Error al obtener conteo por tipo:', error);
        return null;
    }
};

export interface ActivitiesOverviewResponse {
    totalCount: number;
    retosCount: number;
    lastActivity: {
        id: string;
        title: string;
        type: string;
        difficulty: number;
        emotionName?: string | null;
        scheduleDate?: string | null;
        createdAt: string;
    } | null;
    lastReto: {
        id: string;
        title: string;
        type: string;
        difficulty: number;
        scheduleDate?: string | null;
        createdAt: string;
    } | null;
}

export const getActivitiesOverview = async (): Promise<ActivitiesOverviewResponse | null> => {
    try {
        const res = await api.get('/api/activities/overview-stats');
        return res.data;
    } catch (error) {
        console.error('Error al obtener overview de actividades:', error);
        return null;
    }
};

export interface TodayCompletionsResponse {
    count: number;
    lastCompletion?: {
        completionId: string;
        participantId: string;
        participantNickname: string;
        participantAvatar?: string;
        participantLevel: string;
        participantPoints: number;
        activityTitle: string;
        achievedScore: number;
        plannedScore: number;
        completedAt: string;
    } | null;
}

export const getTodayCompletionsCount = async (): Promise<TodayCompletionsResponse | null> => {
    try {
        const res = await api.get('/api/activity-completions/today-count');
        return res.data;
    } catch (error) {
        console.error('Error al obtener completaciones de hoy:', error);
        return null;
    }
};

/**
 * Obtiene las respuestas de usuarios para una actividad
 * GET /api/activities/:id/responses
 */
export const getActivityResponses = async (
    activityId: string,
    page = 1,
    limit = 10,
    userId?: string,
    dateFrom?: string,
    dateTo?: string,
): Promise<{ data: any[]; total: number }> => {
    try {
        const params: Record<string, any> = { page, limit };
        if (userId) params.userId = userId;
        if (dateFrom) params.dateFrom = dateFrom;
        if (dateTo) params.dateTo = dateTo;
        const res = await api.get(`/api/activities/${activityId}/responses`, { params });
        return res.data;
    } catch (error) {
        console.error('Error al obtener respuestas de actividad:', error);
        return { data: [], total: 0 };
    }
};

/**
 * Obtiene los usuarios que han respondido una actividad (para filtros)
 * GET /api/activities/:id/response-users
 */
export const getActivityResponseUsers = async (activityId: string): Promise<any[]> => {
    try {
        const res = await api.get(`/api/activities/${activityId}/response-users`);
        return Array.isArray(res.data) ? res.data : [];
    } catch (error) {
        console.error('Error al obtener usuarios de respuestas:', error);
        return [];
    }
};

/** @deprecated Usar createActivity con objeto en su lugar */
export const createActivityLegacy = async (_id: string, name: string, description: string, status: string, startDate: Date, endDate: Date, assignedUsers: any[], priority: string, createdBy: string) => {
    console.warn('createActivityLegacy está obsoleto, usar createActivity(data)');
    return createActivity({ title: name, description: '', emotion: '', createdBy });
};
