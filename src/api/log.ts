import { config } from '@/config/config';
import { getSafeKeyFromStorage } from '@/utils/safe-token-storage';
import axios from 'axios';
const environment = process.env.NODE_ENV || 'development';

const configAPI = {
    baseURL: config[environment].apiDashboard,
};

/** Crea header de Authorization con el token JWT */
const authHeaders = () => {
    const token = getSafeKeyFromStorage('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const auditLogAction = async (user: string, action: string, entity: string, details: string, ip: string) => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/api/audit-logs`, {
            user: user,
            action,
            entity,
            details,
            ip
        });

        return response.data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
};

export const getAuditLogs = async (page = 1, limit = 50) => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/audit-logs?page=${page}&limit=${limit}`);

        return response.data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
};

export const getSearchAuditLogs = async (user_: any, action: any, entity: any, details: any, ip: any, from: any, to: any) => {
    try {
        const params = {
            user_,
            action,
            entity,
            details,
            ip,
            from,
            to
        };
        const response = await axios.get(`${configAPI.baseURL}/api/admin/search-log`, { params });

        return response.data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
};

export const getLogs = async (method: string, url: string, status: string, startTime: string, endTime: string, page = 1, limit = 100) => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/logger`, {
            headers: authHeaders(),
        });

        return response.data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
};


export const getLogsFiltered = async (method: string, url: string, status: string, startTime: string, endTime: string, page = 1, limit = 100) => {
    try {
        const params = {
            method,
            url,
            status,
            startTime,
            endTime,
            page,
            limit
        };
        const response = await axios.get(`${configAPI.baseURL}/api/logger/filtered`, {
            params,
            headers: authHeaders(),
        });

        return response.data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
};