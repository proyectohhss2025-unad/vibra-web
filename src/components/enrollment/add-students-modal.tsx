'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Modal from '@/components/layouts/modal/modal';
import { searchStudentsForEnrollment, createEnrollments } from '@/api/enrollments';
import { StudentSearchResult } from '@/models/enrollment.entity';
import { toast } from 'sonner';
import { Search, X, Check, User, Loader2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseName: string;
  onSuccess: () => void;
}

const AddStudentsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  courseId,
  courseName,
  onSuccess,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<StudentSearchResult[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = useCallback(async (term: string) => {
    if (term.length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    try {
      const data = await searchStudentsForEnrollment(term, courseId);
      setResults(data);
    } catch (error) {
      console.error('Error searching students:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      handleSearch(searchTerm);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchTerm, handleSearch]);

  const toggleStudent = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    if (selectedIds.size === 0) {
      toast.error('Selecciona al menos un estudiante');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createEnrollments(courseId, Array.from(selectedIds));
      if (result) {
        const createdCount = result.created?.length || 0;
        const skippedCount = result.skipped?.length || 0;
        toast.success(
          `${createdCount} estudiante(s) inscrito(s) exitosamente` +
            (skippedCount > 0 ? ` (${skippedCount} ya estaban inscritos)` : ''),
        );
        setSelectedIds(new Set());
        setSearchTerm('');
        setResults([]);
        setHasSearched(false);
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      toast.error(error?.message || 'Error al inscribir estudiantes');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSearchTerm('');
    setResults([]);
    setSelectedIds(new Set());
    setHasSearched(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} classSize="max-w-2xl">
      <div className="p-2">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Agregar estudiantes al curso
        </h3>
        <p className="text-sm text-gray-500 mb-4">{courseName}</p>

        {/* Buscador */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, documento o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border-0 py-2.5 pl-10 pr-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm"
            autoFocus
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

        {/* Resultados */}
        <div className="min-h-[200px] max-h-[350px] overflow-y-auto border border-gray-200 rounded-lg">
          {isSearching ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              <span className="ml-2 text-sm text-gray-500">Buscando...</span>
            </div>
          ) : !hasSearched ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <Search className="h-8 w-8 mb-2" />
              <p className="text-sm">Escribe al menos 2 caracteres para buscar</p>
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <User className="h-8 w-8 mb-2" />
              <p className="text-sm">No se encontraron estudiantes</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {results.map((student) => (
                <label
                  key={student._id}
                  className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                    selectedIds.has(student._id)
                      ? 'bg-blue-50 hover:bg-blue-100'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(student._id)}
                    onChange={() => toggleStudent(student._id)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-blue-600">
                      {student.name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {student.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {student.documentNumber} • {student.email}
                    </p>
                  </div>
                  {selectedIds.has(student._id) && (
                    <Check className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  )}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            {selectedIds.size > 0
              ? `${selectedIds.size} estudiante(s) seleccionado(s)`
              : 'Ningún estudiante seleccionado'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleClose}
              type="button"
              className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={selectedIds.size === 0 || isSubmitting}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting
                ? 'Inscribiendo...'
                : `Inscribir (${selectedIds.size})`}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AddStudentsModal;
