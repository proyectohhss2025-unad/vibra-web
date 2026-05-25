/**
 * Modelo de entidad para Course (Curso)
 * Corresponde a la colección 'courses' en MongoDB
 */

export interface Course {
    _id?: string;
    name: string;
    description?: string;
    companyId: string;
    /** Nombre resuelto de la institución (devuelto por la API) */
    companyName?: string;
    /** NIT resuelto de la institución */
    companyNit?: string;
    /** Email resuelto de la institución */
    companyEmail?: string;
    startDate?: string;
    endDate?: string;
    status?: boolean;
    instructorId?: string;
    /** Nombre resuelto del instructor (devuelto por la API) */
    instructorName?: string;
    /** Email resuelto del instructor */
    instructorEmail?: string;
    /** Documento resuelto del instructor */
    instructorDocument?: string;
    maxStudents?: number;
    category?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CoursePaginatedResponse {
    data: Course[];
    total: number;
    page: number;
    rows: number;
}
