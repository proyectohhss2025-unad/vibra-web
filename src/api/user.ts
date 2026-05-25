import { config } from '@/config/config';
import { Gender } from '@/utils/enum';
import axios from 'axios';
import logger from '../config/logger-dev';

const environment = process.env.NODE_ENV || 'development';

const configAPI = {
    baseURL: config[environment].apiDashboard,
};

export const createUser = async (_id: string, name: string, documentType: any, documentNumber: string, address: string, phoneNumber: string, email: string, username: string, role: any, company: any, gender: Gender, birthDate: Date) => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/api/user`, {
            _id: _id ?? null,
            name,
            documentType,
            documentNumber,
            address,
            phoneNumber,
            email,
            username,
            role,
            company,
            gender,
            birthDate
        });

        return response.data.user;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const getUserById = async (id: string) => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/users/id/${id}`);

        return response.data;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const getUserByName = async (name: string) => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/api/user/name`, {
            name,
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return response.data.user;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const searchByQuery = async (query: string) => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/user/search?searchTerm=${query}`);
        if (response.data?.customers?.length > 0) {
            return response.data?.customers;
        } else {
            return {
                participants: [{
                    _id: '',
                    name: undefined,
                    nit: query,
                    address: '',
                    phoneNumber: '',
                    email: '',
                    createdAt: new Date(Date.now()),
                    createdBy: '',
                    creditLimit: 0
                }]
            };
        }
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const getAll = async (currentPage: number, pageSize: number) => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/users/allPaginate?page=${currentPage}&rows=${pageSize}`);
        return response.data;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const getForgotPassword = async (email: string) => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/api/user/forgotPassword`, {
            email
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        logger.error('get forgot password error:', error);
        return null;
    }
}

/**
 * Busca usuarios con rol docente por nombre, email, documento o username
 */
export const searchDocentes = async (searchTerm: string) => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/users/search-by-role/docentes`, {
            params: { searchTerm, limit: 10 },
        });
        return response.data;
    } catch (error) {
        logger.error('Error buscando docentes:', error);
        return [];
    }
}

export const getCountAllUsers = async () => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/users/count-all-users`);
        return response.data;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}