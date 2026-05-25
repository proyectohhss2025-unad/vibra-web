'use client';

import { createCourse, getCourseById, updateCourse } from '@/api/course';
import { searchCompanies } from '@/api/company';
import { searchDocentes } from '@/api/user';
import { Course } from '@/models/course.entity';
import SearchableSelect from '@/components/forms/searchable-select';
import { useTabs } from '@/services/contexts/tabs-context';
import { ArrowCircleLeftIcon, SaveAsIcon } from '@heroicons/react/outline';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface CourseFormPageProps {
    courseId?: string;
}

const CourseFormPage: React.FC<CourseFormPageProps> = ({ courseId: propCourseId }) => {
    const router = useRouter();
    const { closeTabWithRefresh, closeTab, refreshData } = useTabs();

    const resolvedCourseId = propCourseId || (router.query._id as string);
    const isEditing = !!resolvedCourseId;
    const currentTabId = resolvedCourseId ? `/course/${resolvedCourseId}` : '/course/new';

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [companyId, setCompanyId] = useState('');
    const [selectedCompany, setSelectedCompany] = useState<{ _id: string; name: string; nit?: string; email?: string } | null>(null);
    const [category, setCategory] = useState('');
    const [instructorId, setInstructorId] = useState('');
    const [selectedInstructor, setSelectedInstructor] = useState<{ _id: string; name: string; documentNumber?: string; email?: string } | null>(null);
    const [maxStudents, setMaxStudents] = useState<number>(0);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [status, setStatus] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (isEditing && resolvedCourseId) {
            setIsLoading(true);
            getCourseById(resolvedCourseId)
                .then((course) => {
                    if (course) {
                        setName(course.name || '');
                        setDescription(course.description || '');
                        setCompanyId(course.companyId || '');
                        setCategory(course.category || '');
                        setInstructorId(course.instructorId || '');
                        setMaxStudents(course.maxStudents || 0);
                        setStartDate(course.startDate ? new Date(course.startDate).toISOString().split('T')[0] : '');
                        setEndDate(course.endDate ? new Date(course.endDate).toISOString().split('T')[0] : '');
                        setStatus(course.status !== false);
                        // Preseleccionar institución con datos resueltos
                        if (course.companyId && course.companyName) {
                            setSelectedCompany({
                                _id: course.companyId,
                                name: course.companyName,
                                nit: course.companyNit || '',
                                email: course.companyEmail || '',
                            });
                        }
                        // Preseleccionar instructor con datos resueltos
                        if (course.instructorId && course.instructorName) {
                            setSelectedInstructor({
                                _id: course.instructorId,
                                name: course.instructorName,
                                documentNumber: course.instructorDocument || '',
                                email: course.instructorEmail || '',
                            });
                        }
                    }
                })
                .catch(() => setError('Error al cargar el curso'))
                .finally(() => setIsLoading(false));
        }
    }, [resolvedCourseId, isEditing]);

    const validate = (): boolean => {
        if (!name.trim()) { setError('El nombre es obligatorio'); return false; }
        if (!companyId.trim()) { setError('La institución es obligatoria'); return false; }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            const payload: Partial<Course> = {
                name: name.trim(),
                description: description.trim() || undefined,
                companyId: companyId.trim(),
                category: category.trim() || undefined,
                instructorId: instructorId.trim() || undefined,
                maxStudents: maxStudents || undefined,
                startDate: startDate ? new Date(startDate).toISOString() : undefined,
                endDate: endDate ? new Date(endDate).toISOString() : undefined,
                status,
            };

            if (isEditing) {
                await updateCourse(resolvedCourseId, payload);
                toast.success('Curso actualizado exitosamente');
            } else {
                await createCourse(payload);
                toast.success('Curso creado exitosamente');
            }
            setSuccess(isEditing ? 'Curso actualizado exitosamente' : 'Curso creado exitosamente');
            setTimeout(() => closeTabWithRefresh(currentTabId, refreshData), 1500);
        } catch (err: any) {
            setError(err.message || 'Error al guardar el curso');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        closeTab(currentTabId);
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">Cargando...</div>;

    return (
        <div className="w-full">
            {!success && (
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="hidden md:flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold tracking-tight">
                            {isEditing ? 'Editar curso' : 'Nuevo curso'}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)}
                                className="w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                                placeholder="Nombre del curso" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                            <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)}
                                className="w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                                placeholder="Descripción del curso" />
                        </div>
                        <div>
                            <SearchableSelect
                                label="Institución"
                                placeholder="Buscar institución por nombre, nit o email..."
                                searchFn={searchCompanies}
                                renderOption={(c) => (
                                    <div>
                                        <div className="font-medium text-sm">{c.name}</div>
                                        <div className="text-xs text-gray-500">{c.nit} &middot; {c.email}</div>
                                    </div>
                                )}
                                getOptionValue={(c) => c._id}
                                value={companyId}
                                onChange={(val) => setCompanyId(val)}
                                initialSelectedItem={selectedCompany}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                            <input type="text" value={category} onChange={e => setCategory(e.target.value)}
                                className="w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                                placeholder="Ej: Matemáticas, Ciencias" />
                        </div>
                        <div>
                            <SearchableSelect
                                label="Instructor"
                                placeholder="Buscar instructor por nombre, email o documento..."
                                searchFn={searchDocentes}
                                renderOption={(u) => (
                                    <div>
                                        <div className="font-medium text-sm">{u.name}</div>
                                        <div className="text-xs text-gray-500">{u.documentNumber} &middot; {u.email}</div>
                                    </div>
                                )}
                                getOptionValue={(u) => u._id}
                                value={instructorId}
                                onChange={(val) => setInstructorId(val)}
                                initialSelectedItem={selectedInstructor}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Máx. estudiantes</label>
                            <input type="number" min={0} value={maxStudents} onChange={e => setMaxStudents(Number(e.target.value))}
                                className="w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de inicio</label>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                                className="w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de fin</label>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                                className="w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm" />
                        </div>
                        <div className="flex items-center">
                            <label className="flex items-center gap-2 text-sm text-gray-700">
                                <input type="checkbox" checked={status} onChange={e => setStatus(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600" />
                                Curso activo
                            </label>
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-md bg-red-50 p-3 mt-4">
                            <p className="text-sm font-medium text-red-800">{error}</p>
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-4 mt-6">
                        <button onClick={handleCancel} type="button"
                            className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 rounded-md px-4 py-2 text-sm font-medium text-gray-700">
                            <ArrowCircleLeftIcon className="h-5 w-5" />
                            Cancelar
                        </button>
                        <button type="submit" disabled={isSubmitting}
                            className={`inline-flex items-center gap-2 ${isSubmitting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-500'} text-white rounded-md px-4 py-2 text-sm font-medium`}>
                            <SaveAsIcon className="h-5 w-5" />
                            {isSubmitting ? 'Guardando...' : 'Guardar curso'}
                        </button>
                    </div>
                </form>
            )}

            {success && (
                <div className="flex flex-col items-center justify-center py-8">
                    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-lg font-medium text-gray-900">{success}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseFormPage;
