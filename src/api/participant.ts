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

export const createParticipant = async (participantData: any, managerData: any) => {
    try {
        const { participantID, participantName, participantNit, participantAddress, participantPhoneNumber, participantEmail, participantCreditLimit } = participantData;
        const response = await axios.post(`${configAPI.baseURL}/api/participant`, {
            _id: participantID ?? null,
            name: participantName,
            nit: participantNit,
            address: participantAddress,
            phoneNumber: participantPhoneNumber,
            email: participantEmail,
            managerData,
            updatedBy: user_.name,
            creditLimit: participantCreditLimit
        });

        return response.data.participant;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const getParticipantById = async (id: string) => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/api/participant/id`, {
            id,
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return response.data.participant;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const getParticipantByName = async (name: string) => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/api/name`, {
            name,
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return response.data.participant;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const searchParticipantsByQuery = async (query: string) => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/participant/search?searchTerm=${query}`);
        if (response.data?.participants?.length > 0) {
            return response.data?.participants;
        } else {
            return {
                participants: [{
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

export const getAllParticipants = async (currentPage: number, pageSize: number) => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/participants?page=${currentPage}&rows=${pageSize}`);
        return response.data;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const getCountAllParticipants = async () => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/participants/count-all-participants`);
        return response.data;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const setParticipantActive = async (_id: string, active: boolean, createdBy: string) => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/api/participant/setActive`, {
            _id,
            active,
            editedBy: createdBy
        });

        return response.data.customer;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const getTopParticipants = async (limit: number, startDate?: string, endDate?: string) => {
    try {
        const params: any = { limit };
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        const response = await axios.get(`${configAPI.baseURL}/api/participant`, { params });
        return response.data;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}
