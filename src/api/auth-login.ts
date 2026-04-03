import { config } from '@/config/config';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';

import logger from '../config/logger-dev';

const environment = process.env.NODE_ENV || 'development';

const configAPI = {
    baseURL: config[environment].apiDashboard,
};

export const authLogin = async (username: string, password: string): Promise<any> => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/api/auth/login`, {
            username,
            password,
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        console.log('Response:', response.data);
        return response.data;
    } catch (error) {
        logger.error('Error:', { error });
        return null;
    }
};

export const authLogout = async (userId: string): Promise<any> => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/api/auth/logout`, {
            userId,
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return response.data;
    } catch (error) {
        logger.error('Error:', { error });
        return null;
    }
};

export const verifyJwtToken = async (token: string): Promise<any> => {
    try {
        const decodedToken: any = jwt.decode(token, {});
        return decodedToken;
    } catch (error) {
        return null;
    }
}


