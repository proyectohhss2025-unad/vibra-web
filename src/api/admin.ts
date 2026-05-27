import { config } from '@/config/config';
import { User } from '@/models/user.entity';
import { getSafeKeyFromStorage, getSafeKeyObjectFromStorage } from '@/utils/safe-token-storage';
import axios from 'axios';
import logger from '../config/logger-dev';

const environment = process.env.NODE_ENV || 'development';

const configAPI = {
    baseURL: config[environment].apiDashboard,
};
const user_: User = JSON.parse(getSafeKeyObjectFromStorage('user')) ?? {};

export const startGenerateBackups = async () => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/api/admin/startGenerateBackups`, {
            user_,
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return response.data;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const startGenerateNotification = async () => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/api/admin/startGenerateNotification`, {
            user_,
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return response.data;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const deleteAllDocumentsByTest = async () => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/api/admin/deleteAllDocumentsByTest`, {
            name,
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return response.data;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const getAvailableTags = async (): Promise<string[]> => {
    try {
        const token = getSafeKeyFromStorage('token');
        const response = await fetch(`${configAPI.baseURL}/api/admin/ideas-tags`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) return [];
        const data = await response.json();
        return data.tags || [];
    } catch (error) {
        logger.error('Error fetching available tags:', error);
        return [];
    }
};

export const getIdeasStatus = async (): Promise<{
    ideasPath: string;
    resolvedPath: string;
    fileExists: boolean;
    totalIdeas: number;
    lastModified: string | null;
} | null> => {
    try {
        const token = getSafeKeyFromStorage('token');
        const response = await fetch(`${configAPI.baseURL}/api/admin/ideas-status`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        logger.error('Error fetching ideas status:', error);
        return null;
    }
}