import { config } from '@/config/config';
import axios from 'axios';

import { Role } from '@/models/role.entity';
import { User } from '@/models/user.entity';
import { getSafeKeyObjectFromStorage } from '@/utils/safe-token-storage';
import logger from '../config/logger-dev';

const environment = process.env.NODE_ENV || 'development';

const configAPI = {
    baseURL: config[environment].apiDashboard,
};

const user_: User = JSON.parse(getSafeKeyObjectFromStorage('user')) ?? {};

export const createRole = async (role: Role) => {
    try {
        const role_ = {
            name: role.name,
            description: role.description,
            permissionTemplate: role.permissionTemplate,
            isSuperAdmin: role.isSuperAdmin,
            isActive: role.isActive,
            createdBy: user_?.name
        }
        const response = await axios.post(`${configAPI.baseURL}/api/role`, {
            ...role_,
            _id: role._id,
            editedBy: user_?.name
        });

        return response.data.role;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const getRoleById = async (id: string) => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/id`, {
            id,
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return response.data.role;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const getRoleByName = async (name: string) => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/name`, {
            name,
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return response.data.role;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const searchByQuery = async (query: string) => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/role/search?searchTerm=${query}`);
        return response.data;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const getAllRolesByUser = async (userId: string) => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/userRole/byUser?userId=${userId}`);
        return response.data;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const getAllRoles = async (currentPage: number, pageSize: number) => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/roles?page=${currentPage}&rows=${pageSize}`);
        return response.data;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const getAllRolesByCategory = async (roleCategoryId: string, currentPage: number, pageSize: number) => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/roles/byCategory?roleCategoryId=${roleCategoryId}&page=${currentPage}&rows=${pageSize}`);
        return response.data;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const getAllCategories = async (currentPage: number, pageSize: number) => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/roleCategory/all?page=${currentPage}&rows=${pageSize}`);
        return response.data;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const updateStatusRole = async (roleId: string, isActive: boolean) => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/api/roles/status`, {
            _id: roleId,
            isActive,
            editedBy: user_?.name
        });

        return response.data.role;
    } catch (error) {
        logger.error('Error updating role status with error:', { error });
        return null;
    }
}

export const softDeleteRole = async (roleId: string) => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/api/roles/delete`, {
            _id: roleId,
            deleted: true,
            deletedBy: user_?.name
        });

        return response.data.role;
    } catch (error) {
        logger.error('Error deleting role with error:', { error });
        return null;
    }
}