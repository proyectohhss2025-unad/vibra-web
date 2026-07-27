/**
 * API para gestionar Cursos (Courses)
 */

import { config } from '@/config/config';
import { Course, CoursePaginatedResponse } from '@/models/course.entity';

const environment = process.env.NODE_ENV || 'development';
const configAPI = {
    baseURL: config[environment].apiDashboard,
};

/**
 * Obtiene todos los cursos con paginación y filtros
 */
export const getAll = async (
    page: number = 1,
    rows: number = 10,
    companyId?: string,
    status?: boolean,
): Promise<CoursePaginatedResponse> => {
    try {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('rows', rows.toString());
        if (companyId) params.append('companyId', companyId);
        if (status !== undefined) params.append('status', status.toString());

        const response = await fetch(`${configAPI.baseURL}/api/courses?${params}`);
        const data = await response.json();
        return {
            data: data.courses || data.data || [],
            total: data.length || data.total || 0,
            page: data.page || page,
            rows: data.rows || rows,
        };
    } catch (error) {
        console.error('Error al obtener cursos:', error);
        return { data: [], total: 0, page, rows };
    }
};

/**
 * Obtiene un curso por su ID
 */
export const getCourseById = async (id: string): Promise<Course | null> => {
    try {
        const response = await fetch(`${configAPI.baseURL}/api/courses/${id}`);
        if (!response.ok) return null;
        const data = await response.json();
        return data.course || data;
    } catch (error) {
        console.error('Error al obtener curso por ID:', error);
        return null;
    }
};

/**
 * Crea un nuevo curso
 */
export const createCourse = async (data: Partial<Course>): Promise<Course> => {
    try {
        const response = await fetch(`${configAPI.baseURL}/api/courses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al crear curso');
        }
        const created = await response.json();
        return created.course || created;
    } catch (error) {
        console.error('Error al crear curso:', error);
        throw error;
    }
};

/**
 * Actualiza un curso existente
 */
export const updateCourse = async (id: string, data: Partial<Course>): Promise<Course> => {
    try {
        const response = await fetch(`${configAPI.baseURL}/api/courses/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al actualizar curso');
        }
        const updated = await response.json();
        return updated.course || updated;
    } catch (error) {
        console.error('Error al actualizar curso:', error);
        throw error;
    }
};

/**
 * Obtiene lista simple de cursos (para selectores)
 * GET /api/courses/list
 */
export const getSimpleCourseList = async (): Promise<{ _id: string; name: string }[]> => {
    try {
        const response = await fetch(`${configAPI.baseURL}/api/courses/list`);
        if (!response.ok) return [];
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error al obtener lista de cursos:', error);
        return [];
    }
};

/**
 * Obtiene el progreso de todos los cursos
 * GET /api/courses/progress
 */
export const getCourseProgress = async (): Promise<{ courseId: string; courseName: string; totalParticipants: number; activeParticipants: number; progressPercent: number }[]> => {
    try {
        const response = await fetch(`${configAPI.baseURL}/api/courses/progress`);
        if (!response.ok) return [];
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error al obtener progreso de cursos:', error);
        return [];
    }
};

/**
 * Obtiene los cursos asignados al docente autenticado.
 * GET /api/courses/my-courses
 */
export const getMyCourses = async (): Promise<{
  courses: any[];
  length: number;
}> => {
  try {
    const response = await fetch(`${configAPI.baseURL}/api/courses/my-courses`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      },
    });
    if (!response.ok) return { courses: [], length: 0 };
    const data = await response.json();
    return { courses: data.courses || [], length: data.length || 0 };
  } catch (error) {
    console.error('Error al obtener cursos del docente:', error);
    return { courses: [], length: 0 };
  }
};

/**
 * Obtiene los estudiantes de un curso con su progreso.
 * GET /api/courses/:courseId/students
 */
export const getCourseStudents = async (
  courseId: string,
): Promise<{ students: any[]; length: number }> => {
  try {
    const response = await fetch(
      `${configAPI.baseURL}/api/courses/${courseId}/students`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
      },
    );
    if (!response.ok) return { students: [], length: 0 };
    const data = await response.json();
    return { students: data.students || [], length: data.length || 0 };
  } catch (error) {
    console.error('Error al obtener estudiantes del curso:', error);
    return { students: [], length: 0 };
  }
};

/**
 * Obtiene estadísticas de progreso de un curso.
 * GET /api/courses/:courseId/progress
 */
export const getCourseProgressStats = async (
  courseId: string,
): Promise<any | null> => {
  try {
    const response = await fetch(
      `${configAPI.baseURL}/api/courses/${courseId}/progress`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
      },
    );
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error al obtener estadísticas del curso:', error);
    return null;
  }
};

/**
 * Elimina un curso (soft delete)
 */
export const deleteCourse = async (id: string, deletedBy: string = 'admin'): Promise<void> => {
    try {
        const response = await fetch(`${configAPI.baseURL}/api/courses/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deletedBy }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al eliminar curso');
        }
    } catch (error) {
        console.error('Error al eliminar curso:', error);
        throw error;
    }
};
