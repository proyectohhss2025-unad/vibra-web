/**
 * TeacherDashboardComponent — Panel de inicio para usuarios con rol Docente.
 *
 * Muestra información relevante para la gestión docente: cursos a cargo,
 * estudiantes, progreso y actividades pendientes.
 *
 * Routing: DashboardRouter → TeacherDashboardComponent (cuando roleName === 'Docente')
 */
'use client'

import { getMyCourses, getCourseStudents, getCourseProgressStats } from "@/api/course"
import { getActivitiesByMonth } from "@/api/activity"
import { AuthContext } from "@/services/auth"
import { useDevice } from "@/services/contexts/device-context"
import { useTabs } from "@/services/contexts/tabs-context"
import { useFilter } from "@/services/contexts/filter-context"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/registry/new-york/ui/card"
import { Badge } from "@/registry/new-york/ui/badge"
import {
    BookOpenCheck,
    ClipboardList,
    Users,
    GraduationCap,
} from "lucide-react"
import { useContext, useEffect, useRef, useState } from "react"
import {
    BarChart,
    Bar,
    XAxis,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts"
import { StatCardSkeleton } from "../ui/stat-card-skeleton"
import { ChartSkeleton } from "../ui/chart-skeleton"
import { ListSkeleton } from "../ui/list-skeleton"
import SafeAvatar from "../ui/safe-avatar"
import DropdownMenuButton from "../layouts/menu/dropdown-menu-button"

const MONTHS_SHORT = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
]

const TeacherDashboardComponent: React.FC = () => {
    const { resolvedPermissions } = useContext(AuthContext)
    const { isMobile } = useDevice()
    const { openTab } = useTabs()
    const { yearFilter, dateInitFilter, dateEndFilter } = useFilter()

    // ─── Estados ────────────────────────────────────────────────────
    const [courses, setCourses] = useState<any[]>([])
    const [selectedCourseId, setSelectedCourseId] = useState<string>('')
    const [students, setStudents] = useState<any[]>([])
    const [courseProgress, setCourseProgress] = useState<any>(null)
    const [chartData, setChartData] = useState<{ month: string; completadas: number }[]>([])

    // ─── Loading states ─────────────────────────────────────────────
    const [showCardsSkeleton, setShowCardsSkeleton] = useState(true)
    const [showChartSkeleton, setShowChartSkeleton] = useState(true)
    const [showStudentsSkeleton, setShowStudentsSkeleton] = useState(true)
    const cardLoadsDone = useRef(0)

    const onCardLoaded = () => {
        cardLoadsDone.current = Math.min(cardLoadsDone.current + 1, 2)
        if (cardLoadsDone.current >= 2) setShowCardsSkeleton(false)
    }

    // ─── Efectos ────────────────────────────────────────────────────
    // Cargar cursos del docente
    useEffect(() => {
        getMyCourses().then((data) => {
            const courseList = data.courses || []
            setCourses(courseList)
            if (courseList.length > 0 && !selectedCourseId) {
                setSelectedCourseId(courseList[0]._id)
            }
        })
        .finally(onCardLoaded)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Cargar actividades por mes
    useEffect(() => {
        const year = yearFilter || new Date().getFullYear()
        getActivitiesByMonth(year, selectedCourseId || undefined)
            .then((result) => {
                const mapped = result.map((r: any) => ({
                    month: MONTHS_SHORT[r.month - 1] || `M${r.month}`,
                    completadas: r.count,
                }))
                setChartData(mapped)
            })
            .catch(() => setChartData([]))
            .finally(() => setShowChartSkeleton(false))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCourseId, yearFilter])

    // Cargar estudiantes y progreso del curso seleccionado
    useEffect(() => {
        if (!selectedCourseId) {
            setShowStudentsSkeleton(false)
            onCardLoaded()
            return
        }
        setShowStudentsSkeleton(true)
        Promise.all([
            getCourseStudents(selectedCourseId),
            getCourseProgressStats(selectedCourseId),
        ])
            .then(([studentsData, progressData]) => {
                setStudents(studentsData?.students || [])
                setCourseProgress(progressData)
            })
            .catch(() => {
                setStudents([])
                setCourseProgress(null)
            })
            .finally(() => {
                setShowStudentsSkeleton(false)
                onCardLoaded()
            })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCourseId])

    // ─── Handlers ───────────────────────────────────────────────────
    const handleCourseChange = (option: any) => {
        if (!option) {
            setSelectedCourseId('')
            return
        }
        setSelectedCourseId(option.value)
    }

    const courseOptions = [
        { label: 'Todos los cursos', value: '', icon: 'CheckIcon', description: '' },
        ...courses.map((c: any) => ({
            label: c.name || 'Curso',
            value: c._id,
            icon: 'CheckIcon',
            description: c.companyName || '',
        })),
    ]

    const selectedCourseLabel =
        courseOptions.find((o) => o.value === selectedCourseId)?.label ||
        'Todos los cursos'

    // Totales agregados
    const totalCourses = courses.length
    const totalStudents = students.length

    // ─── Render ─────────────────────────────────────────────────────
    return (
        <>
            {isMobile && (
                <div className="grid grid-cols">
                    <div className="grid gap-4">
                        <h2 className="text-xl font-bold tracking-tight px-2 pt-2">
                            Panel Docente
                        </h2>
                        {showCardsSkeleton ? (
                            <StatCardSkeleton count={3} className="grid-cols-1" />
                        ) : (
                            <div className="grid gap-4">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Cursos activos
                                        </CardTitle>
                                        <BookOpenCheck className="h-5 w-5 text-gray-500" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{totalCourses}</div>
                                        <p className="text-xs text-muted-foreground">
                                            Cursos a tu cargo
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Estudiantes
                                        </CardTitle>
                                        <Users className="h-5 w-5 text-gray-500" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{totalStudents}</div>
                                        <p className="text-xs text-muted-foreground">
                                            En el curso seleccionado
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Pendientes
                                        </CardTitle>
                                        <ClipboardList className="h-5 w-5 text-gray-500" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {courseProgress?.pendingActivities ?? 0}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Actividades por revisar
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {!isMobile && (
                <div className="hidden flex-col md:flex w-full">
                    <div className="flex-1 space-y-4 pt-1 mx-2 mb-4">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <GraduationCap className="h-7 w-7 text-blue-600" />
                                <h2 className="text-3xl font-bold tracking-tight">
                                    Panel Docente
                                </h2>
                                <Badge
                                    variant="secondary"
                                    className="text-xs font-normal ml-2"
                                >
                                    {resolvedPermissions?.role?.name || 'Docente'}
                                </Badge>
                            </div>
                            <div className="flex items-center space-x-2">
                                <DropdownMenuButton
                                    label={selectedCourseLabel}
                                    options={courseOptions}
                                    renderOption={({ label }: any) => label}
                                    onSelect={handleCourseChange}
                                    valueSelected={selectedCourseId}
                                    className="bg-white x-0 py-2 text-sm max-w-xs"
                                />
                            </div>
                        </div>

                        {/* Cards */}
                        {showCardsSkeleton ? (
                            <StatCardSkeleton count={3} className="grid-cols-2 md:grid-cols-2 lg:grid-cols-3" />
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                <Card className="bg-white rounded-md">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-md font-normal">
                                            Cursos activos
                                        </CardTitle>
                                        <BookOpenCheck className="h-6 w-6 text-gray-500" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{totalCourses}</div>
                                        <p className="text-xs text-muted-foreground">
                                            Cursos a tu cargo
                                        </p>
                                        {courses.length > 0 && (
                                            <div className="border-t border-gray-100 pt-2 mt-2">
                                                <p className="text-xs text-gray-500 truncate">
                                                    {courses.map((c: any) => c.name).join(', ')}
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card className="bg-white rounded-md">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-md font-normal">
                                            Estudiantes
                                        </CardTitle>
                                        <Users className="h-6 w-6 text-gray-500" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {totalStudents}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {selectedCourseId
                                                ? `En el curso seleccionado`
                                                : 'En todos tus cursos'}
                                        </p>
                                        {courseProgress?.averageScore && (
                                            <div className="border-t border-gray-100 pt-2 mt-2">
                                                <p className="text-xs text-gray-500">
                                                    Puntaje promedio:{' '}
                                                    <span className="font-semibold">
                                                        {Math.round(courseProgress.averageScore)}
                                                    </span>
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card className="bg-white rounded-md">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-md font-normal">
                                            Pendientes
                                        </CardTitle>
                                        <ClipboardList className="h-6 w-6 text-gray-500" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {courseProgress?.pendingActivities ?? 0}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Actividades por revisar
                                        </p>
                                        {courseProgress?.completedActivities !== undefined && (
                                            <div className="border-t border-gray-100 pt-2 mt-2">
                                                <p className="text-xs text-gray-500">
                                                    Completadas:{' '}
                                                    <span className="font-semibold">
                                                        {courseProgress.completedActivities}
                                                    </span>
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Sección inferior */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                            {/* Gráfico + Top estudiantes */}
                            <Card className="col-span-4 bg-white rounded-md">
                                <CardHeader className="pb-2">
                                    <CardTitle>
                                        <p>Progreso de actividades</p>
                                    </CardTitle>
                                    <CardDescription>
                                        Actividades completadas por mes
                                        {selectedCourseId &&
                                            ` — ${selectedCourseLabel}`}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {showChartSkeleton ? (
                                        <ChartSkeleton />
                                    ) : chartData.length > 0 ? (
                                        <div className="h-[180px] mb-4">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart
                                                    data={chartData}
                                                    margin={{ top: 5, right: 5, left: -15, bottom: 0 }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                    <XAxis
                                                        dataKey="month"
                                                        tick={{ fontSize: 11 }}
                                                        axisLine={false}
                                                        tickLine={false}
                                                    />
                                                    <RechartsTooltip
                                                        content={({ active, payload }) => {
                                                            if (!active || !payload?.length) return null
                                                            const d = payload[0].payload
                                                            return (
                                                                <div className="bg-white border rounded-md shadow-md px-3 py-2 text-xs space-y-1">
                                                                    <p className="font-medium text-gray-700">
                                                                        {d.month}
                                                                    </p>
                                                                    <p>
                                                                        <span className="text-blue-600 font-semibold">
                                                                            {d.completadas}
                                                                        </span>{' '}
                                                                        actividades completadas
                                                                    </p>
                                                                </div>
                                                            )
                                                        }}
                                                    />
                                                    <Bar
                                                        dataKey="completadas"
                                                        name="Completadas"
                                                        fill="#3b82f6"
                                                        radius={[4, 4, 0, 0]}
                                                        maxBarSize={32}
                                                    />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    ) : (
                                        <div className="h-[120px] flex items-center justify-center">
                                            <p className="text-sm text-muted-foreground">
                                                No hay datos para mostrar
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Últimos estudiantes activos */}
                            <Card className="col-span-3 bg-white rounded-md">
                                <CardHeader className="pb-3">
                                    <CardTitle>Estudiantes</CardTitle>
                                    <CardDescription className="text-sm">
                                        {selectedCourseId
                                            ? `Últimos estudiantes del curso`
                                            : 'Selecciona un curso para ver estudiantes'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="max-h-[260px] overflow-y-auto">
                                    {!selectedCourseId ? (
                                        <p className="text-sm text-muted-foreground text-center py-8">
                                            Usa el filtro de curso para ver estudiantes
                                        </p>
                                    ) : showStudentsSkeleton ? (
                                        <ListSkeleton rows={5} />
                                    ) : students.length === 0 ? (
                                        <p className="text-sm text-muted-foreground text-center py-8">
                                            No hay estudiantes en este curso
                                        </p>
                                    ) : (
                                        <ul className="space-y-3">
                                            {students.slice(0, 8).map((s: any, i: number) => (
                                                <li
                                                    key={s._id || i}
                                                    className="flex items-center gap-3 border-b border-gray-100 pb-2 last:border-0"
                                                >
                                                    <SafeAvatar
                                                        avatar={s.avatar}
                                                        name={s.nickname || s.name || 'Estudiante'}
                                                        className="w-8 h-8"
                                                        gradient="from-blue-400 to-purple-500"
                                                        ringHover=""
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">
                                                            {s.nickname || s.name || 'Estudiante'}
                                                        </p>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            {s.level && (
                                                                <span className="uppercase font-medium text-[10px] px-1.5 py-0.5 rounded bg-gray-100">
                                                                    {s.level}
                                                                </span>
                                                            )}
                                                            <span>{s.points ?? 0} pts</span>
                                                            {s.completedActivities !== undefined && (
                                                                <>
                                                                    <span>·</span>
                                                                    <span>{s.completedActivities} acts.</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {s.averageScore && (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs flex-shrink-0"
                                                        >
                                                            {Math.round(s.averageScore)}%
                                                        </Badge>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default TeacherDashboardComponent
