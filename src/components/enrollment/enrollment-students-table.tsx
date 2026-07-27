'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  getEnrollmentsByCourse,
  removeEnrollment,
} from '@/api/enrollments';
import { Enrollment } from '@/models/enrollment.entity';
import { toast } from 'sonner';
import {
  Users,
  Search,
  X,
  UserMinus,
  Loader2,
  ChevronDown,
  ChevronUp,
  Mail,
  Calendar,
} from 'lucide-react';

interface Props {
  courseId: string;
  refreshKey?: number;
  onRefresh?: () => void;
}

const statusBadge = (status: string) => {
  switch (status) {
    case 'activo':
      return 'bg-green-100 text-green-800';
    case 'completado':
      return 'bg-blue-100 text-blue-800';
    case 'retirado':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const StudentRow: React.FC<{
  student: Enrollment;
  onRemove: (id: string) => void;
  isRemoving: boolean;
}> = ({ student, onRemove, isRemoving }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg bg-white hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Avatar */}
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-medium text-blue-600">
              {student.name?.charAt(0)?.toUpperCase() || '?'}
            </span>
          </div>
          {/* Info */}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {student.name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {student.documentNumber} • {student.email}
            </p>
          </div>
          {/* Status badge */}
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge(student.status)}`}
          >
            {student.status}
          </span>
        </div>

        <div className="flex items-center gap-2 ml-4">
          {/* Remove button (solo si activo) */}
          {student.status === 'activo' && (
            <button
              onClick={() => onRemove(student.enrollmentId)}
              disabled={isRemoving}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
              title="Retirar del curso"
            >
              {isRemoving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserMinus className="h-4 w-4" />
              )}
            </button>
          )}
          {/* Expand toggle */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Mail className="h-3 w-3" /> Email
              </p>
              <p className="text-sm font-medium text-gray-900 truncate">
                {student.email || '—'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Inscripción
              </p>
              <p className="text-sm font-medium text-gray-900">
                {student.enrolledAt
                  ? new Date(student.enrolledAt).toLocaleDateString('es-CO')
                  : '—'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Inscrito por</p>
              <p className="text-sm font-medium text-gray-900">
                {student.enrolledBy || '—'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const EnrollmentStudentsTable: React.FC<Props> = ({
  courseId,
  refreshKey = 0,
  onRefresh,
}) => {
  const [students, setStudents] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [removingId, setRemovingId] = useState<string | null>(null);

  const loadStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getEnrollmentsByCourse(courseId);
      setStudents(result.students || []);
    } catch (error) {
      console.error('Error loading enrollments:', error);
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadStudents();
  }, [courseId, refreshKey, loadStudents]);

  const handleRemove = async (enrollmentId: string) => {
    if (!confirm('¿Estás seguro de retirar a este estudiante del curso?')) {
      return;
    }

    setRemovingId(enrollmentId);
    try {
      await removeEnrollment(enrollmentId);
      toast.success('Estudiante retirado del curso');
      loadStudents();
      onRefresh?.();
    } catch (error: any) {
      toast.error(error?.message || 'Error al retirar estudiante');
    } finally {
      setRemovingId(null);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      !searchTerm ||
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.documentNumber?.includes(searchTerm),
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
        <Users className="mx-auto h-10 w-10 text-gray-400" />
        <h3 className="mt-3 text-sm font-medium text-gray-900">
          No hay estudiantes inscritos
        </h3>
        <p className="mt-1 text-sm text-gray-500">
           Usa el bot&oacute;n &ldquo;Agregar estudiantes&rdquo; para inscribir alumnos en este curso.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar inscrito por nombre, email o documento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-96 rounded-md border-0 py-2 pl-10 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Count */}
      <p className="text-sm text-gray-500 mb-3">
        {filteredStudents.length} estudiante
        {filteredStudents.length !== 1 ? 's' : ''}
        {searchTerm ? ' encontrados' : ''}
      </p>

      {/* List */}
      <div className="space-y-2">
        {filteredStudents.map((student) => (
          <StudentRow
            key={student.enrollmentId}
            student={student}
            onRemove={handleRemove}
            isRemoving={removingId === student.enrollmentId}
          />
        ))}
      </div>
    </div>
  );
};

export default EnrollmentStudentsTable;
