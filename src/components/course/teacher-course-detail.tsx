'use client';

import { getCourseProgressStats } from '@/api/course';
import {
  Users,
  TrendingUp,
  Award,
  Star,
  Activity,
  UserPlus,
} from 'lucide-react';
import React, { useEffect, useState, useCallback } from 'react';
import AddStudentsModal from '@/components/enrollment/add-students-modal';
import EnrollmentStudentsTable from '@/components/enrollment/enrollment-students-table';
import { StatCardSkeleton } from '@/components/ui/stat-card-skeleton';

interface Props {
  courseId: string;
  courseName: string;
}

const TeacherCourseDetail: React.FC<Props> = ({ courseId, courseName }) => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const statsRes = await getCourseProgressStats(courseId);
      setStats(statsRes);
    } catch (error) {
      console.error('Error loading course data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadData();
  }, [courseId, loadData]);

  const handleEnrollmentChange = () => {
    setRefreshKey((k) => k + 1);
    loadData();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{courseName}</h1>
      </div>

      {/* Stats cards — skeleton mientras carga, cards reales cuando hay datos */}
      {isLoading ? (
        <StatCardSkeleton count={4} />
      ) : stats ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalStudents}
                </p>
                <p className="text-xs text-gray-500">Estudiantes</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {stats.activeStudents}
                </p>
                <p className="text-xs text-gray-500">Activos</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.avgPoints ?? 0}
                </p>
                <p className="text-xs text-gray-500">Promedio Puntos</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.completionRate ?? 0}%
                </p>
                <p className="text-xs text-gray-500">Tasa de actividad</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Level distribution */}
      {stats?.levelDistribution && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Distribución por nivel
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.levelDistribution).map(
              ([level, count]: [string, any]) => (
                <span
                  key={level}
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                >
                  <Star className="h-3.5 w-3.5 mr-1.5 text-yellow-500" />
                  {level}: {count}
                </span>
              ),
            )}
          </div>
        </div>
      )}

      {/* Enrollments section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Estudiantes inscritos
          </h3>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            Agregar estudiantes
          </button>
        </div>

        <EnrollmentStudentsTable
          courseId={courseId}
          refreshKey={refreshKey}
          onRefresh={handleEnrollmentChange}
        />
      </div>

      {/* Modal */}
      <AddStudentsModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        courseId={courseId}
        courseName={courseName}
        onSuccess={handleEnrollmentChange}
      />
    </div>
  );
};

export default TeacherCourseDetail;
