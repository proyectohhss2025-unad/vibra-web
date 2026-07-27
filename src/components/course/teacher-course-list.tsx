'use client';

import { getMyCourses } from '@/api/course';
import { useTabs } from '@/services/contexts/tabs-context';
import { BookOpen, Users, TrendingUp, Calendar, Clock } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import TeacherCourseDetail from './teacher-course-detail';

const TeacherCourseList: React.FC = () => {
  const { openTab } = useTabs();
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCourses = async () => {
    setIsLoading(true);
    try {
      const { courses: data } = await getMyCourses();
      setCourses(data);
    } catch (error) {
      console.error('Error loading teacher courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleViewCourse = (course: any) => {
    openTab(
      `/teacher/courses/${course._id}`,
      `Curso: ${course.name}`,
      <TeacherCourseDetail courseId={course._id} courseName={course.name} />,
    );
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mis Cursos</h1>
        <p className="text-gray-500 mt-1">
          Monitoree y revise el progreso de sus estudiantes por curso.
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No tienes cursos asignados
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Los cursos aparecerán aquí cuando un administrador te asigne como
            instructor.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course: any) => (
            <div
              key={course._id}
              onClick={() => handleViewCourse(course)}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {course.name}
                    </h3>
                    {course.category && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                        {course.category}
                      </span>
                    )}
                  </div>
                  <BookOpen className="h-8 w-8 text-blue-500 flex-shrink-0" />
                </div>

                {/* Description */}
                {course.description && (
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                    {course.description}
                  </p>
                )}

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Estudiantes</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {course.studentCount ?? '—'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Activos</p>
                      <p className="text-sm font-semibold text-green-600">
                        {course.activeStudents ?? '—'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Inicio</p>
                      <p className="text-sm text-gray-700 truncate">
                        {formatDate(course.startDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Capacidad</p>
                      <p className="text-sm text-gray-700">
                        {course.maxStudents ? `${course.maxStudents} cupos` : 'Ilimitado'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-3 bg-gray-50 rounded-b-lg border-t border-gray-100">
                <span className="text-sm font-medium text-blue-600 hover:text-blue-800">
                  Ver estudiantes →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherCourseList;
