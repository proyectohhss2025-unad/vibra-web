import { config } from '@/config/config';
import axios from 'axios';

import { Notification } from '@/models/notification.entity';
import { User } from '@/models/user.entity';
import { getSafeKeyFromStorage, getSafeKeyObjectFromStorage } from '@/utils/safe-token-storage';
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
        const response = await axios.get(`${configAPI.baseURL}/api/notifications/all?page=${currentPage}&rows=${pageSize}`, {
        headers: {
            'Content-Type': 'application/json',
        },
        });
        return response.data;
        
    } catch (error) {
        logger.error('Error:', error);
        return { notifications: [], total: 0 };
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

/**
 * Gets unread notifications count for the current user
 * @returns The count of unread notifications or 0 if there was an error
 */
export const getUnreadCount = async () => {
  try {
    const token = getSafeKeyFromStorage('token');   
    if (!token) {
      logger.error('No token found in storage');
      return 0;
    }
    const response = await axios.get(`${configAPI.baseURL}/api/notifications/unread/count/1`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}), 
      },
    });
    return response.data;
  } catch (error) {
    logger.error('Error getting unread count:', error);
    return 0;
  }
};