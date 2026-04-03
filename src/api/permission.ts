import { config } from '@/config/config';
import { Permission } from '@/models/permission.entity';
import { User } from '@/models/user.entity';
import { getSafeKeyObjectFromStorage } from '@/utils/safe-token-storage';
import axios from 'axios';
import logger from '../config/logger-dev';

const environment = process.env.NODE_ENV || 'development';

const configAPI = {
    baseURL: config[environment].apiDashboard,
};

const user_: User = JSON.parse(getSafeKeyObjectFromStorage('user')) ?? {};

export const createPermission = async (permission: Permission) => {
    try {
        const permission_ = {
            name: permission.name,
            description: permission.description,
            isActive: permission.isActive,
            permissionCategory: permission.permissionCategory?._id,
            createdBy: user_?.name
        }
        const response = await axios.post(`${configAPI.baseURL}/api/permissions`, {
            ...permission_,
            editedBy: user_?.name,
            _id: permission._id ?? null,
        });

        return response.data.permission;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const getPermissionById = async (id: string) => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/id`, {
            id,
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return response.data.permission;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const getPermissionByName = async (name: string) => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/name`, {
            name,
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return response.data.permission;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const searchByQuery = async (query: string) => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/permissions/search?searchTerm=${query}`);
        return response.data;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const getAllPermissions = async (currentPage: number, pageSize: number) => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/permissions/all?page=${currentPage}&rows=${pageSize}`);
        return response.data;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const getAllPermissionsByCategory = async (permissionCategoryId: string, currentPage: number, pageSize: number) => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/permissions/byCategory?permissionCategoryId=${permissionCategoryId}&page=${currentPage}&rows=${pageSize}`);
        return response.data;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const getAllCategories = async (currentPage: number, pageSize: number) => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/permissionCategory/all?page=${currentPage}&rows=${pageSize}`);
        return response.data;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const getAllPermissionsByUser = async (userId: string, currentPage: number, pageSize: number) => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/user-permissions/user/${userId}`);
        return response.data;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const updateStatusPermission = async (permissionId: string, isActive: boolean) => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/api/permission/status`, {
            _id: permissionId,
            isActive,
            editedBy: user_?.name
        });

        return response.data;
    } catch (error) {
        logger.error('Error updating permission status with error:', { error });
        return null;
    }
}

export const addPermissionToUser = async (permissionId: string, userId: string, isActive: boolean) => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/api/userPermission`, {
            permissionId: permissionId,
            userId: userId,
            isActive,
            createdBy: user_?.name
        });

        return response.data;
    } catch (error) {
        logger.error('Error assigning permission to user with error:', { error });
        throw error;
    }
}

export const softDeletePermission = async (permissionId: string) => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/api/permission/delete`, {
            _id: permissionId,
            deleted: true,
            deletedBy: user_?.name
        });

        return response.data.permission;
    } catch (error) {
        logger.error('Error deleting permission with error:', { error });
        return null;
    }
}

export const softDeletePermissionToTemplate = async (permissionId: string, userId: string) => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/api/permissionTemplate/sofDelete`, {
            permissionId,
            userId,
            deleted: true,
            deletedBy: user_?.name
        });

        return response.data;
    } catch (error) {
        logger.error('Error deleting permission template assignment with error:', { error });
        return null;
    }
}