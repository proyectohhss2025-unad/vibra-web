import { config } from '@/config/config';
import { User } from '@/models/user.entity';
import { getSafeKeyObjectFromStorage } from '@/utils/safe-token-storage';
import api from '@/api/axios-instance';
import logger from '../config/logger-dev';

const environment = process.env.NODE_ENV || 'development';
const configAPI = {
    baseURL: config[environment].apiDashboard,
};
const user_: User = JSON.parse(getSafeKeyObjectFromStorage('user')) ?? {};

export const createConfig = async (_id: string, name: string, flag: boolean, allowedUsers: any, disallowedUsers: any, description: string, createdBy: string) => {
    try {
        const response = await api.post(`${configAPI.baseURL}`, {
            _id,
            name,
            flag,
            allowedUsers,
            disallowedUsers,
            description,
            createdBy,
            editedBy: createdBy
        });

        return response.data.config;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const getConfigById = async (configId: string) => {
    try {
        const response = await api.post(`${configAPI.baseURL}/api/config/by-id`, {
            id: configId,
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data?.config;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const getConfigByName = async (name: string) => {
    try {
        const response = await api.post(`${configAPI.baseURL}/api/config/by-name`, {
            body: {
                name,
            }
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return response.data.config;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const hasAccessToConfig = async (configId: string, userId: string) => {
    try {
        const response = await api.post(`${configAPI.baseURL}/api/config/validate-user`, {
            configId,
            userId
        });
        return response.data.allowed;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const searchByQuery = async (query: string) => {
    try {
        const response = await api.get(`${configAPI.baseURL}/api/config/search?searchTerm=${query}`);

        return response.data;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const getAll = async (currentPage: number, pageSize: number) => {
    try {
        const response = await api.get(`${configAPI.baseURL}/api/config/api/user/all?page=${currentPage}&rows=${pageSize}`);
        return response.data;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const getAllFlags = async (currentPage: number, pageSize: number) => {
    try {
        const response = await api.get(`${configAPI.baseURL}/api/config/flags?page=${currentPage}&rows=${pageSize}`);
        return response.data;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const setActive = async (_id: string, active: boolean, createdBy: string) => {
    try {
        const response = await api.post(`${configAPI.baseURL}/api/config/setActive`, {
            _id,
            active,
            editedBy: createdBy
        });

        return response.data.config;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const setChangeStatusConfig = async (_id: string, active: boolean) => {
    try {
        const response = await api.post(`${configAPI.baseURL}/api/config/setChangeStatusConfig`, {
            _id,
            active,
            editedBy: user_?.name
        });

        return response.data.config;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}