/**
 * API para gestionar tareas programadas (cron jobs).
 * Alineado con el backend vibra-api (NestJS).
 */

import api from '@/api/axios-instance';
import { CronJob, JobTypeInfo, CronJobExecution, CreateCronJobPayload, UpdateCronJobPayload } from '@/models/cron-job.entity';

// ─── CRUD ────────────────────────────────────────────────────────────

export const getAll = async (page = 1, limit = 20): Promise<{ docs: CronJob[]; total: number; page: number; limit: number }> => {
  try {
    const res = await api.get('/api/cron-jobs', { params: { page, limit } });
    return res.data ?? { docs: [], total: 0, page: 1, limit: 20 };
  } catch (error) {
    console.error('Error al obtener jobs:', error);
    return { docs: [], total: 0, page: 1, limit: 20 };
  }
};

export const getById = async (id: string): Promise<CronJob | null> => {
  try {
    const res = await api.get(`/api/cron-jobs/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error al obtener job por ID:', error);
    return null;
  }
};

export const create = async (data: CreateCronJobPayload): Promise<CronJob | null> => {
  try {
    const res = await api.post('/api/cron-jobs', data);
    return res.data;
  } catch (error) {
    console.error('Error al crear job:', error);
    throw error;
  }
};

export const update = async (id: string, data: UpdateCronJobPayload): Promise<CronJob | null> => {
  try {
    const res = await api.put(`/api/cron-jobs/${id}`, data);
    return res.data;
  } catch (error) {
    console.error('Error al actualizar job:', error);
    throw error;
  }
};

export const remove = async (id: string): Promise<CronJob | null> => {
  try {
    const res = await api.delete(`/api/cron-jobs/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error al eliminar job:', error);
    throw error;
  }
};

// ─── CONTROL ─────────────────────────────────────────────────────────

export const toggle = async (id: string): Promise<CronJob | null> => {
  try {
    const res = await api.post(`/api/cron-jobs/${id}/toggle`);
    return res.data;
  } catch (error) {
    console.error('Error al cambiar estado del job:', error);
    throw error;
  }
};

export const executeNow = async (id: string): Promise<{ success: boolean; message: string; duration?: number } | null> => {
  try {
    const res = await api.post(`/api/cron-jobs/${id}/execute`);
    return res.data;
  } catch (error) {
    console.error('Error al ejecutar job:', error);
    return null;
  }
};

// ─── TIPOS DE JOB ────────────────────────────────────────────────────

export const getAvailableTypes = async (): Promise<JobTypeInfo[]> => {
  try {
    const res = await api.get('/api/cron-jobs/types/list');
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error('Error al obtener tipos de job:', error);
    return [];
  }
};

// ─── HISTORIAL ───────────────────────────────────────────────────────

export const getHistory = async (id: string, page = 1, limit = 20): Promise<{ docs: CronJobExecution[]; total: number; page: number; limit: number }> => {
  try {
    const res = await api.get(`/api/cron-jobs/${id}/history`, { params: { page, limit } });
    return res.data ?? { docs: [], total: 0, page: 1, limit: 20 };
  } catch (error) {
    console.error('Error al obtener historial:', error);
    return { docs: [], total: 0, page: 1, limit: 20 };
  }
};
