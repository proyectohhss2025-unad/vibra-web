/**
 * API para gestionar mensajes de contacto
 * Alineado con vibra-api ContactsController
 */

import { config } from '@/config/config';
import { Contact } from '@/models/contact.entity';
// Token stored in localStorage by AuthProvider (keys: 'token', 'otp', 'user')
function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
}

const environment = process.env.NODE_ENV || 'development';
const configAPI = {
    baseURL: config[environment].apiDashboard,
};

// ─── DTOs ────────────────────────────────────────────────────────────

export interface UpdateContactPayload {
    _id: string;
    status?: 'unread' | 'read' | 'in_progress' | 'resolved' | 'spam';
    notes?: string;
}

export interface ContactStats {
    total: number;
    unread: number;
    in_progress: number;
    resolved: number;
    spam: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────

function authHeaders(): Record<string, string> {
    const token = getToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
}

// ─── Funciones API ────────────────────────────────────────────────────

/**
 * Obtiene todos los mensajes de contacto con paginación y filtro
 * GET /api/contact/allPaginate?page=&limit=&status=
 */
export const getAll = async (
    page: number,
    limit: number,
    status?: string,
): Promise<{ data: Contact[]; total: number }> => {
    try {
        const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
        if (status && status !== 'all') params.append('status', status);
        const response = await fetch(
            `${configAPI.baseURL}/api/contact/allPaginate?${params}`,
            { headers: authHeaders() },
        );
        if (!response.ok) return { data: [], total: 0 };
        return await response.json();
    } catch (error) {
        console.error('Error al obtener mensajes de contacto:', error);
        return { data: [], total: 0 };
    }
};

/**
 * Obtiene un mensaje de contacto por ID
 * GET /api/contact/id/:id
 */
export const getById = async (id: string): Promise<Contact | null> => {
    try {
        const response = await fetch(`${configAPI.baseURL}/api/contact/id/${id}`, {
            headers: authHeaders(),
        });
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error('Error al obtener mensaje de contacto:', error);
        return null;
    }
};

/**
 * Actualiza estado/notas de un mensaje de contacto
 * POST /api/contact (con _id en el body)
 */
export const update = async (data: UpdateContactPayload): Promise<Contact | null> => {
    try {
        const response = await fetch(`${configAPI.baseURL}/api/contact`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error al actualizar mensaje:', response.status, errorText);
            throw new Error(`Error al actualizar mensaje (${response.status})`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error en update contacto:', error);
        throw error;
    }
};

/**
 * Obtiene estadísticas de mensajes de contacto
 * GET /api/contact/stats
 */
export const getStats = async (): Promise<ContactStats> => {
    try {
        const response = await fetch(`${configAPI.baseURL}/api/contact/stats`, {
            headers: authHeaders(),
        });
        if (!response.ok) return { total: 0, unread: 0, in_progress: 0, resolved: 0, spam: 0 };
        return await response.json();
    } catch (error) {
        console.error('Error al obtener estadísticas de contacto:', error);
        return { total: 0, unread: 0, in_progress: 0, resolved: 0, spam: 0 };
    }
};
