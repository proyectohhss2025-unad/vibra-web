/**
 * API para gestionar Inscripciones (Enrollments)
 */

import { config } from '@/config/config';
import {
  Enrollment,
  StudentSearchResult,
  MyCourse,
  CreateEnrollmentResponse,
} from '@/models/enrollment.entity';

const environment = process.env.NODE_ENV || 'development';
const configAPI = {
  baseURL: config[environment].apiDashboard,
};

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
  'Content-Type': 'application/json',
});

/**
 * Inscribir uno o varios estudiantes en un curso.
 * POST /api/enrollments
 */
export const createEnrollments = async (
  courseId: string,
  studentIds: string[],
): Promise<CreateEnrollmentResponse | null> => {
  try {
    const response = await fetch(`${configAPI.baseURL}/api/enrollments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ courseId, studentIds }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al inscribir estudiantes');
    }
    return await response.json();
  } catch (error) {
    console.error('Error al inscribir estudiantes:', error);
    throw error;
  }
};

/**
 * Retirar un estudiante de un curso.
 * DELETE /api/enrollments/:id
 */
export const removeEnrollment = async (
  enrollmentId: string,
): Promise<{ message: string } | null> => {
  try {
    const response = await fetch(
      `${configAPI.baseURL}/api/enrollments/${enrollmentId}`,
      {
        method: 'DELETE',
        headers: getAuthHeaders(),
      },
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al retirar estudiante');
    }
    return await response.json();
  } catch (error) {
    console.error('Error al retirar estudiante:', error);
    throw error;
  }
};

/**
 * Obtener estudiantes inscritos en un curso.
 * GET /api/enrollments/course/:courseId
 */
export const getEnrollmentsByCourse = async (
  courseId: string,
  status?: string,
  search?: string,
): Promise<{ students: Enrollment[]; length: number }> => {
  try {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (search) params.append('search', search);

    const response = await fetch(
      `${configAPI.baseURL}/api/enrollments/course/${courseId}?${params}`,
      {
        headers: getAuthHeaders(),
      },
    );
    if (!response.ok) return { students: [], length: 0 };
    return await response.json();
  } catch (error) {
    console.error('Error al obtener inscritos del curso:', error);
    return { students: [], length: 0 };
  }
};

/**
 * Obtener los cursos del estudiante autenticado.
 * GET /api/enrollments/my-courses
 */
export const getMyCoursesEnrollments = async (): Promise<{
  courses: MyCourse[];
  length: number;
}> => {
  try {
    const response = await fetch(
      `${configAPI.baseURL}/api/enrollments/my-courses`,
      {
        headers: getAuthHeaders(),
      },
    );
    if (!response.ok) return { courses: [], length: 0 };
    return await response.json();
  } catch (error) {
    console.error('Error al obtener mis cursos:', error);
    return { courses: [], length: 0 };
  }
};

/**
 * Buscar estudiantes para inscribir en un curso.
 * GET /api/enrollments/search-students
 */
export const searchStudentsForEnrollment = async (
  q: string,
  excludeCourseId?: string,
): Promise<StudentSearchResult[]> => {
  try {
    const params = new URLSearchParams({ q });
    if (excludeCourseId) params.append('excludeCourseId', excludeCourseId);

    const response = await fetch(
      `${configAPI.baseURL}/api/enrollments/search-students?${params}`,
      {
        headers: getAuthHeaders(),
      },
    );
    if (!response.ok) return [];
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error al buscar estudiantes:', error);
    return [];
  }
};
