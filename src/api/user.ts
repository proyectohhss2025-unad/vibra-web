import { Gender } from '@/utils/enum';
import api from '@/api/axios-instance';

export const createUser = async (name: string, documentType: any, documentNumber: string, address: string, phoneNumber: string, email: string, username: string, role: any, company: any, gender: Gender, birthDate?: Date, password?: string) => {
    const res = await api.post('/api/users/create', {
        name, documentType, documentNumber, address, phoneNumber,
        email, username, role, company, gender, birthDate,
        ...(password ? { password } : {}),
    });
    return res.data;
}

export const updateUser = async (_id: string, name: string, documentType: any, documentNumber: string, address: string, phoneNumber: string, email: string, username: string, role: any, company: any, gender: Gender, birthDate?: Date, password?: string) => {
    const res = await api.post('/api/users', {
        _id, name, documentType, documentNumber, address, phoneNumber,
        email, username, role, company, gender, birthDate,
        ...(password ? { password } : {}),
    });
    return res.data;
}

export const getUserById = async (id: string) => {
    const res = await api.get(`/api/users/id/${id}`);
    return res.data;
}

export const getUserByName = async (name: string) => {
    const res = await api.post('/api/user/name', { name });
    return res.data?.user;
}

export const getAll = async (currentPage: number, pageSize: number) => {
    const res = await api.get('/api/users/allPaginate', {
        params: { page: currentPage, rows: pageSize },
    });
    return res.data;
}

/**
 * Busca usuarios por término (nombre, email, documento, username)
 * GET /api/users/search?searchTerm=xxx
 */
export const searchUsers = async (term: string): Promise<{ _id: string; name: string; username: string; email: string }[]> => {
    try {
        const res = await api.get('/api/users/search', { params: { searchTerm: term } });
        return res.data?.data || [];
    } catch (error) {
        console.error('Error searching users:', error);
        return [];
    }
}

/**
 * Busca usuarios por cualquier término (documento, nombre, email).
 * GET /api/users/search?searchTerm=
 */
export const searchByQuery = async (query: string): Promise<any[]> => {
    try {
        const res = await api.get('/api/users/search', { params: { searchTerm: query } });
        return res.data?.data || [];
    } catch (error) {
        console.error('Error searching users by query:', error);
        return [];
    }
}

export const getForgotPassword = async (email: string) => {
    try {
        const res = await api.post('/api/user/forgotPassword', { email });
        return res.data;
    } catch (error) {
        console.error('get forgot password error:', error);
        return null;
    }
}

export const searchDocentes = async (searchTerm: string) => {
    try {
        const res = await api.get('/api/users/search-by-role/docentes', {
            params: { searchTerm, limit: 10 },
        });
        return res.data;
    } catch (error) {
        console.error('Error buscando docentes:', error);
        return [];
    }
}

export const getCountAllUsers = async () => {
    try {
        const res = await api.get('/api/users/count-all-users');
        return res.data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
};

/**
 * Activa o desactiva un usuario
 * PATCH /api/users/active
 */
export const setUserActive = async (_id: string, active: boolean, editedBy: string) => {
    const res = await api.patch('/api/users/active', { _id, active, editedBy });
    return res.data;
};

/**
 * Obtiene estadísticas generales de usuarios para el dashboard:
 * total de usuarios + datos del último usuario registrado
 * GET /api/users/overview-stats
 */
export const getUsersOverview = async (): Promise<{
    count: number;
    lastRegisteredUser: {
        userId: string;
        name: string;
        username: string;
        email?: string;
        avatar?: string;
        role?: { _id: string; name: string } | null;
        company?: { _id: string; name: string } | null;
        documentNumber?: string;
        phoneNumber?: string;
        gender?: string;
        createdAt: string;
    } | null;
} | null> => {
    try {
        const res = await api.get('/api/users/overview-stats');
        return res.data;
    } catch (error) {
        console.error('Error al obtener overview stats de usuarios:', error);
        return null;
    }
};