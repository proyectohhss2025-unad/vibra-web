import { config } from '@/config/config';
import { Report } from '@/models/report.entity';
import { User } from '@/models/user.entity';
import { getSafeKeyObjectFromStorage } from '@/utils/safe-token-storage';
import axios from 'axios';
import api from '@/api/axios-instance';
const environment = process.env.NODE_ENV || 'development';
const configAPI = {
    baseURL: config[environment].apiDashboard,
};

const user_: User = JSON.parse(getSafeKeyObjectFromStorage('user')) ?? {};

// ─── Legacy report CRUD (user-submitted reports) ──────────────────────

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
        console.error('Error:', error);
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
        console.error('Error:', error);
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
        console.error('Error:', error);
        return null;
    }
}

export const searchByQuery = async (query: string) => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/report/search?searchTerm=${query}`);

        return response.data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

export const getAll = async (currentPage: number, pageSize: number) => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/report/all?page=${currentPage}&rows=${pageSize}`);
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

export const getAllByDay = async (currentPage: number, pageSize: number) => {
    try {
        const response = await axios.get(`${configAPI.baseURL}/api/report/allByDay?page=${currentPage}&rows=${pageSize}`);
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

// ─── Analytics Reports API (vibra-152) ─────────────────────────────────

export interface ReportsFilters {
    dateFrom?: string;
    dateTo?: string;
    emotionId?: string;
    courseId?: string;
    userId?: string;
    activityId?: string;
    limit?: number;
    page?: number;
    pageSize?: number;
    search?: string;
    granularity?: 'day' | 'week' | 'month';
}

const API_PREFIX = '/api/reports';

export const getKpiReport = (filters: ReportsFilters) =>
    api.get(`${API_PREFIX}/kpi`, { params: filters }).then(r => r.data);

export const getByActivityReport = (filters: ReportsFilters) =>
    api.get(`${API_PREFIX}/by-activity`, { params: filters }).then(r => r.data);

export const getByUserReport = (filters: ReportsFilters) =>
    api.get(`${API_PREFIX}/by-user`, { params: filters }).then(r => r.data);

export const getByEmotionReport = (filters: ReportsFilters) =>
    api.get(`${API_PREFIX}/by-emotion`, { params: filters }).then(r => r.data);

export const getTrendReport = (filters: ReportsFilters & { granularity?: 'day' | 'week' | 'month' }) =>
    api.get(`${API_PREFIX}/trend`, { params: filters }).then(r => r.data);

export const getScoresReport = (filters: ReportsFilters) =>
    api.get(`${API_PREFIX}/scores`, { params: filters }).then(r => r.data);

export const getUserProfile = (userId: string) =>
    api.get(`${API_PREFIX}/user-profile/${userId}`).then(r => r.data);
