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

export const createActivity = async (_id: string, name: string, description: string, status: string, startDate: Date, endDate: Date, assignedUsers: any[], priority: string, createdBy: string) => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/api/activities`, {
            _id: _id ?? null,
            name,
            description,
            status,
            startDate,
            endDate,
            assignedUsers,
            priority,
            createdBy,
            editedBy: createdBy
        });

        return response.data.activity;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const getActivityById = async (activityId: string) => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/api/activities/by-id`, {
            id: activityId,
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data?.activity;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const getActivityByName = async (name: string) => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/api/activities/by-name`, {
            body: {
                name,
            }
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return response.data.activity;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const searchByQuery = async (query: string) => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/activities/search?searchTerm=${query}`);

        return response.data;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const getAll = async (currentPage: number, pageSize: number) => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/activities/all?page=${currentPage}&rows=${pageSize}`);
        return response.data;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const getCountAllActivities = async () => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/activities/count-all-activities`);
        return response.data;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const updateActivityStatus = async (_id: string, status: string) => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/api/activities/update-status`, {
            _id,
            status,
            editedBy: user_?.name
        });

        return response.data.activity;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const assignUserToActivity = async (_id: string, userId: string) => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/api/activities/assign-user`, {
            _id,
            userId,
            editedBy: user_?.name
        });

        return response.data.activity;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}