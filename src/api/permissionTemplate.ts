import { config } from '@/config/config';
import axios from 'axios';

import { PermissionTemplate } from '@/models/permissionTemplate.entity';
import { User } from '@/models/user.entity';
import { getSafeKeyObjectFromStorage } from '@/utils/safe-token-storage';
const environment = process.env.NODE_ENV || 'development';

const configAPI = {
    baseURL: config[environment].apiDashboard,
};

const user_: User = JSON.parse(getSafeKeyObjectFromStorage('user')) ?? {};

export const createPermissionTemplate = async (permissionTemplate: PermissionTemplate & { permissions?: string[] }) => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/api/permission-templates`, {
            _id: permissionTemplate._id ?? null,
            name: permissionTemplate.name,
            description: permissionTemplate.description,
            isActive: permissionTemplate.isActive,
            permissions: permissionTemplate.permissions || [],
            createdBy: user_?.name,
            editedBy: user_?.name
        });

        return response.data.permissionTemplate;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

export const getPermissionTemplateById = async (id: string) => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/permission-templates/${id}`);
        // El API devuelve el objeto directamente (no envuelto en { permissionTemplate })
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

export const getPermissionTemplateByName = async (name: string) => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/name`, {
            name,
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return response.data.permissionTemplate;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

export const searchByQuery = async (query: string) => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/permission-templates/search?searchTerm=${query}`);
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

export const getAllPermissionTemplatesByUser = async (userId: string) => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/userPermissionTemplate/byUser?userId=${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

export const getAllPermissionTemplates = async (currentPage: number, pageSize: number) => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/permission-templates?page=${currentPage}&limit=${pageSize}`);
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

export const getAllPermissionTemplatesByCategory = async (permissionTemplateCategoryId: string, currentPage: number, pageSize: number) => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/permission-templates/byCategory?permissionTemplateCategoryId=${permissionTemplateCategoryId}&page=${currentPage}&rows=${pageSize}`);
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

export const getAllCategories = async (currentPage: number, pageSize: number) => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/permissionTemplateCategory/all?page=${currentPage}&rows=${pageSize}`);
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

export const updateStatusPermissionTemplate = async (permissionTemplateId: string, isActive: boolean) => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/api/permission-templates/status`, {
            _id: permissionTemplateId,
            isActive,
            editedBy: user_?.name
        });

        return response.data.permissionTemplate;
    } catch (error) {
        console.error('Error updating permission template status with error:', { error });
        return null;
    }
}

export const softDeletePermissionTemplate = async (permissionTemplateId: string) => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/api/permission-templates/delete`, {
            _id: permissionTemplateId,
            deleted: true,
            deletedBy: user_?.name
        });

        return response.data.permissionTemplate;
    } catch (error) {
        console.error('Error deleting permission template with error:', { error });
        return null;
    }
}

export const addPermissionToTemplate = async (permissionId: string, permissionTemplateId: string) => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/api/permission-templates/addPermission`, {
            permissionId,
            permissionTemplateId,
            editedBy: user_?.name
        });
        return response.data;
    } catch (error) {
        console.error('Error adding permission to template: ', { error });
        return null;
    }
}