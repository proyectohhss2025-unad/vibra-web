import { config } from '@/config/config';
import axios from 'axios';

import logger from '../config/logger-dev';

const environment = process.env.NODE_ENV || 'development';

const configAPI = {
    baseURL: config[environment].apiDashboard,
};

// const user_: User = JSON.parse(getSafeKeyObjectFromStorage('user')) ?? {};

export const searchByQuery = async (query: string, entity: string) => {
    try {
        const queryCast: string = query == '' ? query = 'all' : query;
        const response = await axios.get(`${configAPI.baseURL}/api/${entity}/search?searchTerm=${queryCast}`);
        if (response.data) return response.data;
        return {
            data: [
                {
                    name: 'Not found',
                }
            ]
        };
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}
