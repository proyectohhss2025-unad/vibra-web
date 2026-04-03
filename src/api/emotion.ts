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

export const createEmotion = async (_id: string, name: string, description: string, category: string, intensity: number, createdBy: string) => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/api/emotion`, {
            _id,
            name,
            description,
            category,
            intensity,
            createdBy,
            editedBy: createdBy
        });

        return response.data.emotion;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const getEmotionById = async (emotionId: string) => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/api/emotion/by-id`, {
            id: emotionId,
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data?.emotion;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const getEmotionByName = async (name: string) => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/api/emotion/by-name`, {
            body: {
                name,
            }
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return response.data.emotion;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const searchByQuery = async (query: string) => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/emotion/search?searchTerm=${query}`);

        return response.data;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const getAllEmotions = async (currentPage: number, pageSize: number) => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/emotion/all?page=${currentPage}&rows=${pageSize}`);
        return response.data;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const getAllEmotionsByCategory = async (category: string, currentPage: number, pageSize: number) => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/emotion/byCategory?category=${category}&page=${currentPage}&rows=${pageSize}`);
        return response.data;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const setActive = async (_id: string, active: boolean, createdBy: string) => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/api/emotion/setActive`, {
            _id,
            active,
            editedBy: createdBy
        });

        return response.data.emotion;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const deleteEmotion = async (_id: string) => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/api/emotion/delete`, {
            _id,
            deleted: true,
            deletedBy: user_?.name
        });

        return response.data.emotion;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}