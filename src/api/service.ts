import { config } from '@/config/config';
import axios from 'axios';

const environment = process.env.NODE_ENV || 'development';

const configAPI = {
    baseURL: config[environment].apiDashboard,
};

export const createService = async (_id: string, name: string, documentType: any, documentNumber: string, address: string, phoneNumber: string, email: string, servicename: string, role: any, company: any) => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/api/service`, {
            _id: _id ?? null,
            name,
            documentType,
            documentNumber,
            address,
            phoneNumber,
            email,
            servicename,
            role,
            company
        });

        return response.data.service;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

export const getServiceById = async (id: string) => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/api/service/id`, {
            id,
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return response.data.service;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

export const getServiceByName = async (name: string) => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/api/service/name`, {
            name,
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return response.data.service;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

export const searchServiceByQuery = async (query: string) => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/service/search?searchTerm=${query}`);
        if (response.data?.services?.length > 0) {
            return response.data?.services;
        } else {
            return {
                participants: [{}]
            };
        }
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

export const getAll = async (currentPage: number, pageSize: number) => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/service/all?page=${currentPage}&rows=${pageSize}`);
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

export const getForgotPassword = async (email: string) => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/api/service/forgotPassword`, {
            email
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('get forgot password error:', error);
        return null;
    }
}