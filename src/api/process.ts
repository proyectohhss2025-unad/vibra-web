import { config } from '@/config/config';
import { Process } from '@/models/process.entity';
import { User } from '@/models/user.entity';
import { getSafeKeyObjectFromStorage } from '@/utils/safe-token-storage';
import axios from 'axios';
const environment = process.env.NODE_ENV || 'development';
const configAPI = {
    baseURL: config[environment].apiDashboard,
};

const user_: User = JSON.parse(getSafeKeyObjectFromStorage('user')) ?? {};

export const createProcess = async (process: Process) => {
    try {
        const process_ = {
            name: process.name,
            description: process.description,
            createdBy: user_?.name
        }
        const response = await axios.post(`${configAPI.baseURL}/api/process`, {
            ...process_,
            _id: process._id,
            editedBy: user_?.name
        });

        return response.data.process;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

export const getProcessById = async (id: string) => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/api/process/id`, {
            id,
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return response.data.process;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

export const getProcessByName = async (name: string) => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/api/process/name`, {
            name,
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return response.data.process;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

export const searchByQuery = async (query: string) => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/process/search?searchTerm=${query}`);

        return response.data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

export const getAll = async (currentPage: number, pageSize: number) => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/process/all?page=${currentPage}&rows=${pageSize}`);
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}
