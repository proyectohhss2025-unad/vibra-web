import { config } from '@/config/config';
import { User } from '@/models/user.entity';
import { getSafeKeyObjectFromStorage } from '@/utils/safe-token-storage';
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