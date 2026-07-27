/**
 * Modelo de entidad para Enrollment (Inscripción)
 * Corresponde a la colección 'enrollments' en MongoDB
 */

export interface Enrollment {
  _id: string;
  enrollmentId: string;
  userId: string;
  name: string;
  email: string;
  username: string;
  documentNumber: string;
  avatar: string;
  isActive: boolean;
  status: 'activo' | 'completado' | 'retirado';
  enrolledAt: string;
  enrolledBy: string;
}

export interface StudentSearchResult {
  _id: string;
  name: string;
  email: string;
  documentNumber: string;
  username: string;
  avatar: string;
}

export interface MyCourse {
  enrollmentId: string;
  courseId: string;
  name: string;
  description?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  status: string;
  enrolledAt: string;
}

export interface CreateEnrollmentResponse {
  message: string;
  created: Array<{
    _id: string;
    userId: string;
    name: string;
    email: string;
    documentNumber: string;
    status: string;
    createdAt: string;
  }>;
  skipped: string[];
  errors: Array<{ id: string; reason: string }>;
}
