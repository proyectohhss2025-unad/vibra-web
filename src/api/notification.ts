import { config } from '@/config/config';
import axios from 'axios';

import { Notification } from '@/models/notification.entity';
import { User } from '@/models/user.entity';
import { getSafeKeyObjectFromStorage } from '@/utils/safe-token-storage';
import logger from '../config/logger-dev';

const environment = process.env.NODE_ENV || 'development';

const configAPI = {
    baseURL: config[environment].apiDashboard,
};

const user_: User = JSON.parse(getSafeKeyObjectFromStorage('user')) ?? {};

export const createNotification = async (notification: Notification) => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/api/notification`, {
            _id: notification._id ?? null,
            title: notification.title,
            message: '',
            notificationType: notification.notificationType,
            isRead: false,
            user: user_,
            createdBy: user_?.name,
            editedBy: user_?.name
        });
        return response.data.notification;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const getNotificationById = async (id: string) => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/id`, {
            id,
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return response.data.notification;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const getNotificationByName = async (name: string) => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/name`, {
            name,
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return response.data.notification;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const searchByQuery = async (query: string) => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/search?searchTerm=${query}`);
        return response.data;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const getAllNotifications = async (currentPage: number, pageSize: number, title: string) => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/notifications/allByTitle?page=${currentPage}&rows=${pageSize}&title=${title}`);
        return response.data;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const getAll = async (currentPage: number, pageSize: number) => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/notifications/all?page=${currentPage}&rows=${pageSize}`);
        return response.data;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const markAsRead = async (id: string) => {
    try {
        const response = await axios.put(`${configAPI.baseURL}/api/notifications/read/${id}`, { editedBy: user_?.name });
        return response.data;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const getCountAllNotifications = async () => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/notifications/count-all-notifications`);
        return response.data;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const getCountAllNotificationsByDay = async () => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/notifications/count-all-notifications-by-day`);
        return response.data;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}