/**
 * API para gestionar participantes (participants)
 * Alineado con vibra-api (NestJS) y la colección participants
 */

import { config } from '@/config/config';

const environment = process.env.NODE_ENV || 'development';
const configAPI = {
    baseURL: config[environment].apiDashboard,
};

// ─── Tipos ────────────────────────────────────────────────────────────

export interface ParticipantResponse {
    _id: string;
    /** Nuevo: userId del User asociado */
    userId?: string;
    /** Nuevo: nickname del participante */
    nickname?: string;
    /** Legacy: nombre comercial (ahora opcional) */
    name?: string;
    /** Legacy: NIT (ahora opcional) */
    nit?: string;
    /** Nuevo: puntos acumulados */
    points?: number;
    /** Nuevo: nivel (bronce/plata/oro/platino/diamante) */
    level?: string;
    /** Nuevo: racha actual de días */
    currentStreak?: number;
    /** Nuevo: récord de racha */
    maxStreak?: number;
    /** Nuevo: total de actividades completadas */
    totalActivitiesCompleted?: number;
    /** Nuevo: última fecha de actividad */
    lastActivityDate?: string;
    /** Nuevo: curso actual */
    currentCourse?: string;
    /** Legacy */
    address?: string;
    phoneNumber?: string;
    email?: string;
    avatar?: string;
    isActive?: boolean;
    /** Legacy comercial */
    creditLimit?: number;
    managerData?: {
        name: string;
        document: string;
        documentType: string;
        email: string;
        phoneNumber: string;
    };
    createdAt?: string;
    createdBy?: string;
}

export interface CreateParticipantPayload {
    userId: string;
    nickname: string;
    avatar?: string;
    currentCourse?: string;
    preferences?: { language: string; notifications: boolean };
}

export interface UpdateParticipantPayload {
    _id: string;
    nickname?: string;
    avatar?: string;
    points?: number;
    currentCourse?: string;
    isActive?: boolean;
    preferences?: { language: string; notifications: boolean };
}

// ─── Funciones API ────────────────────────────────────────────────────

/**
 * Obtiene todos los participantes con paginación
 * GET /api/participants?page=&rows=
 */
export const getAll = async (page: number, rows: number): Promise<{ participants: ParticipantResponse[]; count: number }> => {
    try {
        const response = await fetch(`${configAPI.baseURL}/api/participants?page=${page}&rows=${rows}`);
        if (!response.ok) return { participants: [], count: 0 };
        return await response.json();
    } catch (error) {
        console.error('Error al obtener participantes:', error);
        return { participants: [], count: 0 };
    }
};

/**
 * Obtiene un participante por su ID
 * GET /api/participants/:id
 */
export const getById = async (id: string): Promise<ParticipantResponse | null> => {
    try {
        const response = await fetch(`${configAPI.baseURL}/api/participants/${id}`);
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error('Error al obtener participante:', error);
        return null;
    }
};

/**
 * Obtiene un participante por userId (User)
 * GET /api/participants/by-user/:userId
 */
export const getByUserId = async (userId: string): Promise<ParticipantResponse | null> => {
    try {
        const response = await fetch(`${configAPI.baseURL}/api/participants/by-user/${userId}`);
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error('Error al obtener participante por userId:', error);
        return null;
    }
};

/**
 * Crea un nuevo participante
 * POST /api/participants
 */
export const create = async (data: CreateParticipantPayload): Promise<ParticipantResponse | null> => {
    try {
        const response = await fetch(`${configAPI.baseURL}/api/participants`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Error al crear (${response.status}): ${text.slice(0, 300)}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error en create participante:', error);
        throw error;
    }
};

/**
 * Actualiza un participante existente
 * POST /api/participants/update
 */
export const update = async (data: UpdateParticipantPayload): Promise<ParticipantResponse | null> => {
    try {
        const response = await fetch(`${configAPI.baseURL}/api/participants/update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Error al actualizar (${response.status}): ${text.slice(0, 300)}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error en update participante:', error);
        throw error;
    }
};

/**
 * Elimina (soft delete) un participante
 * POST /api/participants/delete
 */
export const remove = async (id: string): Promise<ParticipantResponse | null> => {
    try {
        const response = await fetch(`${configAPI.baseURL}/api/participants/delete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ _id: id }),
        });
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error('Error al eliminar participante:', error);
        return null;
    }
};

/**
 * Obtiene el conteo total de participantes
 * GET /api/participants/count-all-participants
 */
export const getCountAll = async (): Promise<{ count: number } | null> => {
    try {
        const response = await fetch(`${configAPI.baseURL}/api/participants/count-all-participants`);
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error('Error al contar participantes:', error);
        return null;
    }
};

/**
 * Busca participantes por texto
 * GET /api/participants/search?searchTerm=
 */
export const search = async (query: string): Promise<ParticipantResponse[]> => {
    try {
        const response = await fetch(`${configAPI.baseURL}/api/participants/search?searchTerm=${encodeURIComponent(query)}`);
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error('Error al buscar participantes:', error);
        return [];
    }
};

// ─── Alias de compatibilidad ─────────────────────────────────────────

/** @deprecated Usar getAll() */
export const getAllParticipants = async (page: number, rows: number) => getAll(page, rows);

/** @deprecated Usar getCountAll() */
export const getCountAllParticipants = async () => getCountAll();

/** @deprecated Usar search() */
export const searchParticipantsByQuery = async (query: string): Promise<any[]> => {
    try {
        const response = await fetch(`${configAPI.baseURL}/api/participants/search?searchTerm=${encodeURIComponent(query)}`);
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error('Error al buscar participantes:', error);
        return [];
    }
};

/** @deprecated Usar getTopParticipants del chart directamente */
export const getTopParticipants = async (limit: number, startDate?: string, endDate?: string) => {
    try {
        const params = new URLSearchParams({ limit: String(limit) });
        if (startDate) params.set('startDate', startDate);
        if (endDate) params.set('endDate', endDate);
        const response = await fetch(`${configAPI.baseURL}/api/participants/filter?${params}`);
        if (!response.ok) return { participants: [], count: 0 };
        return await response.json();
    } catch (error) {
        console.error('Error al obtener top participantes:', error);
        return { participants: [], count: 0 };
    }
};
