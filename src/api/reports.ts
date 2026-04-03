import { config } from '@/config/config';
import { Report } from '@/models/report.entity';
import { User } from '@/models/user.entity';
import { getSafeKeyObjectFromStorage } from '@/utils/safe-token-storage';
import axios from 'axios';
import logger from '../config/logger-dev';

const environment = process.env.NODE_ENV || 'development';
const configAPI = {
    baseURL: config[environment].apiDashboard,
};

const user_: User = JSON.parse(getSafeKeyObjectFromStorage('user')) ?? {};

export const createReport = async (report: Report) => {
    try {
        const report_ = {
            reportName: report.reportName,
            reportType: report.reportType,
            createdBy: user_?.name
        }
        const response = await axios.post(`${configAPI.baseURL}/api/report`, {
            ...report_,
            _id: report._id,
            editedBy: user_?.name
        });

        return response.data.report;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const getReportById = async (id: string) => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/api/report/id`, {
            id,
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return response.data.report;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const getReportByName = async (name: string) => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/api/report/name`, {
            name,
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return response.data.report;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const searchByQuery = async (query: string) => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/report/search?searchTerm=${query}`);

        return response.data;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const getAll = async (currentPage: number, pageSize: number) => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/report/all?page=${currentPage}&rows=${pageSize}`);
        return response.data;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}

export const getAllByDay = async (currentPage: number, pageSize: number) => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/report/allByDay?page=${currentPage}&rows=${pageSize}`);
        return response.data;
    } catch (error) {
        logger.error('Error:', error);
        return null;
    }
}
