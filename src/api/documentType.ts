import { config } from '@/config/config';
import { DocumentType } from '@/models/documentType.entity';
import { User } from '@/models/user.entity';
import { getSafeKeyObjectFromStorage } from '@/utils/safe-token-storage';
import axios from 'axios';
const environment = process.env.NODE_ENV || 'development';

const configAPI = {
    baseURL: config[environment].apiDashboard,
};

const user_: User = JSON.parse(getSafeKeyObjectFromStorage('user')) ?? {};

export const createDocumentType = async (documentType: DocumentType) => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/api/documentType`, {
            _id: documentType._id ?? null,
            title: documentType.name,
            description: documentType.description,
            createdBy: user_?.name,
            editedBy: user_?.name
        });
        return response.data.documentType;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

export const getDocumentTypeById = async (id: string) => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/id`, {
            id,
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data.documentType;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

export const getDocumentTypeByName = async (name: string) => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/name`, {
            name,
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data.documentType;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

export const searchByQuery = async (query: string) => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/search?searchTerm=${query}`);
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

export const getAllDocumentTypes = async (currentPage: number, pageSize: number) => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/document-types/all?page=${currentPage}&rows=${pageSize}`);
        console.log("response.data:",response.data);
        return {
            documentTypes: response.data
        };
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

export const getAllByCategory = async (categoryDocumentTypeId: string) => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/documentType/allByCategory?categoryDocumentTypeId=${categoryDocumentTypeId}`);
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}