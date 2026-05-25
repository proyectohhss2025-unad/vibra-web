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

export const createCompany = async (companyData: any, managerData: any) => {
    try {
        const {
            companyID,
            companySlogan,
            companyName,
            companyNit,
            companyAddress,
            companyPhoneNumber,
            companyEmail,
            companyUserAdmin,
            companyBillingRangeNumber,
            companyIsMain
        } = companyData;
        const objData = {
            name: companyName,
            nit: companyNit,
            slogan: companySlogan,
            address: companyAddress,
            phoneNumber: companyPhoneNumber,
            email: companyEmail,
            managerData,
            createdBy: user_.name,
            editedBy: user_.name,
            userAdmin: companyUserAdmin,
            seriesCurrentBillingRange: companyBillingRangeNumber,
            isMain: companyIsMain
        };

        const response = await axios.post(`${configAPI.baseURL}/api/company`, {
            ...objData,
            _id: companyID
        });

        return response.data.company;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const getCompanyById = async (id: string) => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/api/company/id`, {
            id,
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return response.data.company;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const getCompanyByName = async (name: string) => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/api/name`, {
            name,
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return response.data.company;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

/**
 * Busca compañías por término (nombre, nit, email, etc.)
 * Endpoint: GET /api/company/search?searchTerm=&page=1&rows=10
 */
export const searchCompanies = async (searchTerm: string) => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/company/search`, {
            params: { searchTerm, page: 1, rows: 10 },
        });
        // El backend retorna { data: [...], total: N }
        return response.data?.data || response.data || [];
    } catch (error) {
        logger.error('Error buscando compañías:', error);
        return [];
    }
}

export const searchByQuery = async (query: string) => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/company/search?searchTerm=${query}`);
        if (response.data?.companys?.length > 0) {
            return response.data?.companys;
        } else {
            return {
                companys: [{
                    _id: '',
                    name: undefined,
                    nit: query,
                    address: '',
                    phoneNumber: '',
                    email: '',
                    createdAt: new Date(Date.now()),
                    createdBy: '',
                    creditLimit: 0
                }]
            };
        }
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const getAllCompanies = async (currentPage: number, pageSize: number) => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/company?page=${currentPage}&rows=${pageSize}`);
        return response.data;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const getMainCompany = async () => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/company/main`);
        return response.data;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const setActive = async (_id: string, active: boolean, createdBy: string) => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/api/company/setActive`, {
            _id,
            active,
            editedBy: createdBy
        });

        return response.data.company;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}