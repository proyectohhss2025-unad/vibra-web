'use client';

import { getAll, deleteCourse } from '@/api/course';
import { Course } from '@/models/course.entity';
import { AuthContext } from '@/services/auth';
import { useTabs } from '@/services/contexts/tabs-context';
import { PlusCircleIcon, RefreshIcon } from '@heroicons/react/solid';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import ModalConfirm from '../layouts/modal/modal-confirm';
import Search from '../search/search';
import Pagination from '../ui/table/pagination';
import CurrentDateTime from '../utils/current-datetime';
import CourseFormPage from './course-form-page';
import '../../../app/globals.css';
import '../test/test.css';

const CourseListPage: React.FC = () => {
    const { token } = useContext(AuthContext);
    const router = useRouter();
    const { openTab, closeTab } = useTabs();

    const [data, setData] = useState<Course[]>([]);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; course: Course | null }>({
        show: false,
        course: null,
    });

    const loadData = async () => {
        setIsLoading(true);
        try {
            const response = await getAll(currentPage, pageSize);
            setData(response.data);
            setTotal(response.total);
        } catch (error) {
            console.error('Error loading courses:', error);
            toast.error('Error al cargar los cursos');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [currentPage, pageSize]);

    useEffect(() => {
        if (!token) router.push('/layout');
    }, [token, router]);

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        setCurrentPage(1);
    };

    useEffect(() => {
        if (searchTerm === '') return;
        const timer = setTimeout(() => loadData(), 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleNew = () => {
        openTab('/course/new', 'Nuevo curso', <CourseFormPage />);
    };

    const handleEdit = (course: Course) => {
        openTab(`/course/${course._id}`, `Editar: ${course.name}`, <CourseFormPage courseId={course._id} />);
    };

    const handleDeleteClick = (course: Course) => {
        setDeleteConfirm({ show: true, course });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteConfirm.course?._id) return;
        try {
            await deleteCourse(deleteConfirm.course._id);
            toast.success('Curso eliminado correctamente');
            setDeleteConfirm({ show: false, course: null });
            loadData();
        } catch (error) {
            toast.error('Error al eliminar el curso');
        }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit' });
    };

    return (
        <>
            <div className="hidden flex-col md:flex w-full mt-0">
                <div className="hidden flex-col w-full md:flex mt-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-3xl font-bold tracking-tight ml-3">Gestión de Cursos</h2>
                        <div className="flex items-center space-x-2">
                            <div className="bg-white rounded-md px-2 pl-2 mb-0 pb-1">
                                <CurrentDateTime />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-md w-full mt-3 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-xl font-semibold">Lista de Cursos</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Gestione los cursos educativos, asigne instituciones y configure fechas.
                            </p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Search
                                isOpen={false}
                                onClose={() => {}}
                                setData={(results: any) => setData(results)}
                                entity="course"
                                setIsLoading={setIsLoading}
                            >
                                <RefreshIcon
                                    className="h-7 w-7 text-blue-600 cursor-pointer hover:text-green-500"
                                    onClick={() => { setCurrentPage(1); loadData(); }}
                                />
                            </Search>
                            <button onClick={handleNew}
                                className="flex rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
                                <PlusCircleIcon className="h-5 w-8 text-white" />
                                Agregar Curso
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="uppercase tracking-wider border-b-2">
                                <tr>
                                    <th className="px-3 py-2">Nombre</th>
                                    <th className="px-3 py-2">Institución</th>
                                    <th className="px-3 py-2">Instructor</th>
                                    <th className="px-3 py-2">Categoría</th>
                                    <th className="px-3 py-2">Inicio</th>
                                    <th className="px-3 py-2">Fin</th>
                                    <th className="px-3 py-2">Estado</th>
                                    <th className="px-3 py-2">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="text-center py-8 text-gray-500">
                                            {isLoading ? 'Cargando...' : 'No hay cursos registrados'}
                                        </td>
                                    </tr>
                                )}
                                {data.map((course) => (
                                    <tr key={course._id} className="hover:bg-blue-50 border-b">
                                        <td className="px-3 py-2 font-medium">{course.name}</td>
                                        <td className="px-3 py-2">{course.companyName || course.companyId || '-'}</td>
                                        <td className="px-3 py-2">{course.instructorName || course.instructorId || '-'}</td>
                                        <td className="px-3 py-2">{course.category || '-'}</td>
                                        <td className="px-3 py-2">{formatDate(course.startDate)}</td>
                                        <td className="px-3 py-2">{formatDate(course.endDate)}</td>
                                        <td className="px-3 py-2">
                                            <span className={course.status !== false ? 'badge-active' : 'badge-inactive'}>
                                                {course.status !== false ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2">
                                            <div className="flex items-center space-x-2">
                                                <button onClick={() => handleEdit(course)}
                                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium" title="Editar">
                                                    ✏️
                                                </button>
                                                <button onClick={() => handleDeleteClick(course)}
                                                    className="text-red-500 hover:text-red-700 text-sm font-medium" title="Eliminar">
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        pageSize={pageSize}
                        totalItems={total}
                        onPageChange={setCurrentPage}
                        setPageSize={setPageSize}
                    />
                </div>
            </div>

            <ModalConfirm
                isOpen={deleteConfirm.show}
                onClose={() => setDeleteConfirm({ show: false, course: null })}
                onConfirm={handleDeleteConfirm}
                title="Eliminar Curso"
                message={`¿Está seguro de eliminar el curso "${deleteConfirm.course?.name}"? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                cancelText="Cancelar"
            />
        </>
    );
};

export default CourseListPage;
