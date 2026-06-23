import { config } from '@/config/config';
import { User } from '@/models/user.entity';
import { getSafeKeyObjectFromStorage } from '@/utils/safe-token-storage';
import axios from 'axios';
const environment = process.env.NODE_ENV || 'development';

const configAPI = {
    baseURL: config[environment].apiDashboard,
};

const user_: User = JSON.parse(getSafeKeyObjectFromStorage('user')) ?? {};

export const fileUpload = async (formData: any, inFolder: boolean) => {
    try {
        const response: any = await axios.post(`${configAPI.baseURL}${inFolder ? '/api' : '/api/gridfs'}/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

export const getFilesInGridfsById = async (crossingWithActivityLoadId: string) => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/gridfs/files`);
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

