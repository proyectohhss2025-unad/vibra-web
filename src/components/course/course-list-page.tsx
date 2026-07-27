'use client';

import { getAll, deleteCourse } from '@/api/course';
import { Course } from '@/models/course.entity';
import { useTabs } from '@/services/contexts/tabs-context';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Edit, Trash2, Users } from 'lucide-react';
import ListPageLayout from '@/components/ui/list-page-layout';
import CourseFormPage from './course-form-page';
import TeacherCourseDetail from './teacher-course-detail';

const CourseListPage: React.FC = () => {
    const router = useRouter();
    const { openTab, refreshData } = useTabs();

    const [data, setData] = useState<Course[]>([]);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);
    const [isLoading, setIsLoading] = useState(false);
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
    useEffect(() => { loadData(); }, [refreshData]);

    const handleNew = () => {
        openTab('/course/new', 'Nuevo curso', <CourseFormPage />);
    };

    const handleEdit = (course: Course) => {
        openTab(`/course/${course._id}`, `Editar: ${course.name}`, <CourseFormPage courseId={course._id} />);
    };

    const handleDeleteClick = (course: Course) => {
        setDeleteConfirm({ show: true, course });
    };

    const handleManageStudents = (course: Course) => {
        openTab(
            `/course/${course._id}/students`,
            `Estudiantes: ${course.name}`,
            <TeacherCourseDetail courseId={course._id!} courseName={course.name} />,
        );
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
        <ListPageLayout
            title="Gestión de Cursos"
            subtitle="Gestione los cursos educativos, asigne instituciones y configure fechas."
            data={data}
            total={total}
            currentPage={currentPage}
            pageSize={pageSize}
            isLoading={isLoading}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            onRefresh={() => { setCurrentPage(1); loadData(); }}
            onAdd={handleNew}
            addLabel="Agregar Curso"
            searchEntity="courses"
            onSearchData={(results) => setData(results as Course[])}
            onSearchLoading={setIsLoading}
            emptyMessage="No hay cursos registrados"
            columns={[
                { key: 'name', label: 'Nombre', render: (c: Course) => c.name, className: 'min-w-[180px]' },
                { key: 'company', label: 'Institución', render: (c) => c.companyName || c.companyId || '-', className: 'w-full' },
                { key: 'instructor', label: 'Instructor', render: (c) => c.instructorName || c.instructorId || '-', className: 'w-28' },
                { key: 'category', label: 'Categoría', render: (c) => c.category || '-', className: 'w-24' },
                { key: 'startDate', label: 'Inicio', render: (c) => formatDate(c.startDate), className: 'w-20' },
                { key: 'endDate', label: 'Fin', render: (c) => formatDate(c.endDate), className: 'w-24' },
                {
                    key: 'status',
                    label: 'Estado',
                    render: (c) => (
                        <span className={c.status !== false ? 'badge-active' : 'badge-inactive'}>
                            {c.status !== false ? 'Activo' : 'Inactivo'}
                        </span>
                    ),
                    className: 'w-16 text-center',
                },
            ]}
            rowKey={(c) => c._id!}
            actions={[
                { icon: <Edit className="w-4 h-4" />, tooltip: 'Editar', onClick: handleEdit, color: 'text-blue-600' },
                {
                    icon: <Users className="w-4 h-4" />,
                    tooltip: 'Estudiantes',
                    onClick: handleManageStudents,
                    color: 'text-green-600 hover:text-green-800',
                },
                {
                    icon: <Trash2 className="w-4 h-4" />,
                    tooltip: 'Eliminar',
                    onClick: handleDeleteClick,
                    color: 'text-red-500 hover:text-red-700',
                },
            ]}
            deleteConfirm={
                deleteConfirm.show
                    ? {
                          show: true,
                          title: 'Eliminar Curso',
                          message: `¿Está seguro de eliminar el curso "${deleteConfirm.course?.name}"? Esta acción no se puede deshacer.`,
                          variant: 'danger',
                          onConfirm: handleDeleteConfirm,
                          onClose: () => setDeleteConfirm({ show: false, course: null }),
                      }
                    : null
            }
        />
    );
};

export default CourseListPage;
