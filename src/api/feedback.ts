import { config } from '@/config/config';
import { Feedback } from '@/models/feedback.entity';
import { User } from '@/models/user.entity';
import { getSafeKeyFromStorage, getSafeKeyObjectFromStorage } from '@/utils/safe-token-storage';
import axios from 'axios';
const environment = process.env.NODE_ENV || 'development';

const configAPI = {
    baseURL: config[environment].apiDashboard,
};

const user_: User = JSON.parse(getSafeKeyObjectFromStorage('user')) ?? {};

export const createFeedback = async (feedback: Feedback) => {
    try {
        const feedback_ = {
            title: feedback.title,
            description: feedback.description,
            isFeature: feedback.isFeature,
            isSupport: feedback.isSupport,
            createdBy: user_?.name
        }
        const response = await axios.post(`${configAPI.baseURL}/api/feedback`, {
            ...feedback_,
            _id: feedback._id ?? null,
            editedBy: user_?.name
        });

        return response.data.feedback;

    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

export const getFeedbackById = async (id: string) => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/id`, {
            id,
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return response.data.feedback;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

export const getFeedbackByName = async (name: string) => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/name`, {
            name,
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return response.data.feedback;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

export const searchByQuery = async (query: string) => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/feedback/search?searchTerm=${query}`);
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

export const getAllFeedbacks = async (currentPage: number, pageSize: number) => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/feedback/all?page=${currentPage}&rows=${pageSize}`);
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

export const getAllFeedbacksByCategory = async (feedbackCategoryId: string, currentPage: number, pageSize: number) => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/feedback/byCategory?feedbackCategoryId=${feedbackCategoryId}&page=${currentPage}&rows=${pageSize}`);
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

export const getAllCategories = async (currentPage: number, pageSize: number) => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/feedbackCategory/all?page=${currentPage}&rows=${pageSize}`);
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

export const getAllFeedbacksByUser = async (userId: string, currentPage: number, pageSize: number) => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/userFeedback/byUser?userId=${userId}&page=${currentPage}&rows=${pageSize}`);
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

export const updateStatusFeedback = async (feedbackId: string, isActive: boolean) => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/api/feedback/status`, {
            _id: feedbackId,
            isActive,
            editedBy: user_?.name
        });

        return response.data;
    } catch (error) {
        console.error('Error updating feedback status with error:', { error });
        return null;
    }
}

export const addFeedbackToUser = async (feedbackId: string, userId: string, isActive: boolean) => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/api/userFeedback`, {
            feedbackId: feedbackId,
            userId: userId,
            isActive,
            createdBy: user_?.name
        });

        return response.data.userFeedback;
    } catch (error) {
        console.error('Error assigning feedback to user with error:', { error });
        throw error;
    }
}

export const softDeleteFeedback = async (feedbackId: string) => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/api/feedback/delete`, {
            _id: feedbackId,
            deleted: true,
            deletedBy: user_?.name
        });

        return response.data.feedback;
    } catch (error) {
        console.error('Error deleting feedback with error:', { error });
        return null;
    }
}

export const convertFeedbackToIdea = async (
    id: string,
    payload: {
        title?: string;
        description?: string;
        priority?: string;
        tags?: string[];
    },
): Promise<{ success: boolean; ideaId: string; idea: any } | null> => {
    try {
        const token = getSafeKeyFromStorage('token');
        const response = await fetch(`${configAPI.baseURL}/api/feedback/${id}/convert-to-idea`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al convertir feedback');
        }

        return await response.json();
    } catch (error) {
        console.error('Error converting feedback to idea:', error);
        return null;
    }
}