'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { getMyCoursesEnrollments } from '@/api/enrollments';
import { MyCourse } from '@/models/enrollment.entity';
import {
  BookOpen,
  Loader2,
  Calendar,
  Tag,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  activo: {
    label: 'Activo',
    color: 'bg-green-100 text-green-800',
    icon: <CheckCircle className="h-4 w-4" />,
  },
  completado: {
    label: 'Completado',
    color: 'bg-blue-100 text-blue-800',
    icon: <CheckCircle className="h-4 w-4" />,
  },
  retirado: {
    label: 'Retirado',
    color: 'bg-gray-100 text-gray-800',
    icon: <AlertCircle className="h-4 w-4" />,
  },
};

const MyCoursesList: React.FC = () => {
  const [courses, setCourses] = useState<MyCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getMyCoursesEnrollments();
      setCourses(result.courses || []);
    } catch (error) {
      console.error('Error loading my courses:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <BookOpen className="h-12 w-12 mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          No tienes cursos asignados
        </h3>
        <p className="text-sm text-gray-500">
          Los cursos aparecerán aquí cuando un administrador o docente te inscriba.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mis Cursos</h1>
        <p className="text-sm text-gray-500 mt-1">
          {courses.length} curso{courses.length !== 1 ? 's' : ''} asignado
          {courses.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => {
          const status = statusConfig[course.status] || statusConfig.activo;
          return (
            <div
              key={course.enrollmentId}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-900 truncate">
                    {course.name}
                  </h3>
                  {course.category && (
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {course.category}
                    </p>
                  )}
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ml-2 ${status.color}`}
                >
                  {status.icon}
                  {status.label}
                </span>
              </div>

              {/* Description */}
              {course.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {course.description}
                </p>
              )}

              {/* Dates */}
              <div className="space-y-1.5 mt-auto">
                {course.startDate && (
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Inicio:{' '}
                    {new Date(course.startDate).toLocaleDateString('es-CO')}
                  </p>
                )}
                {course.endDate && (
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Fin:{' '}
                    {new Date(course.endDate).toLocaleDateString('es-CO')}
                  </p>
                )}
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Inscrito:{' '}
                  {new Date(course.enrolledAt).toLocaleDateString('es-CO')}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyCoursesList;
