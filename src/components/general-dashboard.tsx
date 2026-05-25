'use client'

import { Metadata } from "next"

import { getCountAllNotifications } from "@/api/notification"
import { User } from "@/models/user.entity"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/registry/new-york/ui/card"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/registry/new-york/ui/hover-card"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/registry/new-york/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/registry/new-york/ui/tooltip"
import { AuthContext } from "@/services/auth"
import { useDevice } from "@/services/contexts/device-context"
import { useFilter } from "@/services/contexts/filter-context"
import { useTabs } from "@/services/contexts/tabs-context"
import { FORMAT_DATE_SHORT, LOCALE } from "@/utils/constants"
import { formatDate, getFirstAndLastDayOfYear, getYearCurrent } from "@/utils/dates"
import { formatToLocalCurrency } from "@/utils/money"
import { getSafeKeyFromStorage, getSafeKeyObjectFromStorage } from "@/utils/safe-token-storage"
import { Badge } from "@/registry/new-york/ui/badge"
import { CheckCheckIcon, CircleDollarSignIcon, HandCoins, NotebookTabsIcon, SquareArrowOutUpRightIcon, Wallet2Icon } from "lucide-react"
import { useRouter } from "next/router"
import { useContext, useEffect, useState } from "react"
import AnalyticsDashboard from "./analytics/analytics-dashboard"
import CalendarDateRangePicker from "./general-dashboard/date-range-picker"
import DropdownMenuButton from "./layouts/menu/dropdown-menu-button"
import ActivityDataPage from "./activity/data-page"
import ActivityComponent from "./activity/activity"
import { getCountAllParticipants } from "@/api/participant"
import { getCountAllUsers } from "@/api/user"
import { getCountAllPretest } from "@/api/preTest"
import UserDataPage from "./user/data-page"
import { getCountAllActivities, getCountByType, getTodayActivity, getTodayCompletionsCount } from "@/api/activity"

export const metadata: Metadata = {
    title: "Dashboard",
    description: "Example dashboard app built using the components.",
}

type Props = {
    setTab?: (path: string) => void;
}

const GeneralDashboardComponent: React.FC<Props> = ({ setTab }) => {
    const user_: User = JSON.parse(getSafeKeyObjectFromStorage('user')) ?? {};
    const participantSelected: any = JSON.parse(getSafeKeyObjectFromStorage('participantSelected')) ?? JSON.parse(getSafeKeyObjectFromStorage('participantSelected')) ?? {};

    const { token } = useContext(AuthContext);
    const { activeParticipant, refreshData } = useTabs();
    const { isMobile, isTablet } = useDevice();
    const { setYearFilter, yearFilter, setDateEndFilter, setDateInitFilter, participantFilter, contractFilter, epsIpsFilter, dateInitFilter, dateEndFilter } = useFilter();

    const [percentTotalParticipants, setPercentTotalParticipants] = useState<number>(0);
    const [totalParticipants, setTotalParticipants] = useState<number>(0);
    const [percentTotalActivities, setPercentTotalActivities] = useState<number>(0);
    const [totalActivities, setTotalActivities] = useState<number>(0);
    const [percentTotalUsers, setPercentTotalUsers] = useState<number>(0);
    const [totalUsers, setTotalUsers] = useState<number>();
    const [totalCompletionsToday, setTotalCompletionsToday] = useState<number>(0);
    const [totalActiveRetos, setTotalActiveRetos] = useState<number>(0);
    const [percentTotalInPretest, setPercentTotalInPretest] = useState<number>(0);
    const [totalInPretest, setTotalInPretest] = useState<number>(0);
    //const [totalActivities, setTotalActivities] = useState<number>(0);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [isRange, setIsRange] = useState<boolean>(true);
    const [selectedDate, setSelectedDate] = useState<any>();
    const [yearsOptions, setYearsOptions] = useState<any>([
        { _id: '1', name: '2014', value: '1', label: '2014', icon: 'CheckIcon', description: '' },
        { _id: '2', name: '2015', value: '2', label: '2015', icon: 'CheckIcon', description: '' },
        { _id: '3', name: '2016', value: '3', label: '2016', icon: 'CheckIcon', description: '' },
        { _id: '4', name: '2017', value: '4', label: '2017', icon: 'CheckIcon', description: '' },
        { _id: '5', name: '2018', value: '5', label: '2018', icon: 'CheckIcon', description: '' },
        { _id: '6', name: '2019', value: '6', label: '2019', icon: 'CheckIcon', description: '' },
        { _id: '7', name: '2020', value: '7', label: '2020', icon: 'CheckIcon', description: '' },
        { _id: '8', name: '2021', value: '8', label: '2021', icon: 'CheckIcon', description: '' },
        { _id: '9', name: '2022', value: '9', label: '2022', icon: 'CheckIcon', description: '' },
        { _id: '10', name: '2023', value: '10', label: '2023', icon: 'CheckIcon', description: '' },
        { _id: '11', name: '2024', value: '11', label: '2024', icon: 'CheckIcon', description: '' },
        { _id: '12', name: '2025', value: '12', label: '2025', icon: 'CheckIcon', description: '' },
        { _id: '13', name: '2026', value: '13', label: '2026', icon: 'CheckIcon', description: '' },
        { _id: '14', name: '2027', value: '14', label: '2027', icon: 'CheckIcon', description: '' },
        { _id: '15', name: '2028', value: '15', label: '2028', icon: 'CheckIcon', description: '' },
        { _id: '16', name: '2029', value: '16', label: '2029', icon: 'CheckIcon', description: '' },
        { _id: '17', name: '2030', value: '17', label: '2030', icon: 'CheckIcon', description: '' }
    ]);
    const [todayActivityStatus, setTodayActivityStatus] = useState<'loading' | 'active' | 'no_activity'>('loading');
    const [totalNotifications, setTotalNotifications] = useState<string | null>(null);
    const [labelData, setLabelData] = useState<any>();
    const router = useRouter();
    const { openTab } = useTabs();

    useEffect(() => {
        setYearFilter(Number(getSafeKeyFromStorage('yearFilter')) ?? getYearCurrent());
    }, [yearFilter]);

    useEffect(() => {
        getCountAllActivities()
            .then(data => {
                setTotalActivities(data?.count ?? 0);
            });
        getTodayCompletionsCount()
            .then(data => {
                setTotalCompletionsToday(data?.count ?? 0);
            });
        getCountByType('reto')
            .then(data => {
                setTotalActiveRetos(data?.count ?? 0);
            });
    }, []);

    useEffect(() => {
        getTodayActivity()
            .then(data => {
                setTodayActivityStatus(data?.schedule?.status === 'active' ? 'active' : 'no_activity');
            })
            .catch(() => setTodayActivityStatus('no_activity'));
    }, []);

    useEffect(() => {
        getCountAllNotifications()
            .then(data => {
                setTotalNotifications(data?.countNotifications);
            });
    }, []);

    useEffect(() => {
        getCountAllParticipants()
            .then(data => {
                if (data) setTotalParticipants(data.count);
            });
    }, []);
    
    useEffect(() => {
        getCountAllUsers()
            .then(data => {
                setTotalUsers(data);
            });
    }, []);
    
    useEffect(() => {
        getCountAllPretest()
            .then(data => {
                setTotalInPretest(data);
            });
    }, []);

    useEffect(() => {
        setLabelData(dataLabel_());
    }, [dateInitFilter, dateEndFilter]);

    useEffect((): any => {
        // Validar autenticación, ignorando cambios de refreshData (que es para tabs hijas)
        if (!user_?._id || !token) {
            router.push('/layout');
            return;
        }
    }, [user_?._id, token]);

    useEffect((): any => {
        if (!user_?._id || !token) {
            router.push('/layout');
        }
    }, [user_?._id, token]);

    const renderOption = ({ label }) => label;
    const dataLabel_ = () => {
        return (
            <div>
                <p>Año: {yearFilter} </p>
                <p>Fecha Inicio: {formatDate(dateInitFilter, FORMAT_DATE_SHORT)}</p>
                <p>Fecha Fin: {formatDate(dateEndFilter, FORMAT_DATE_SHORT)}</p>
                <p>Usuarios: {participantFilter?.label}</p>
            </div>
        )
    }

    const handleChangeSelectedYear = (option: any) => {
        if (!option) {
            return;
        }
        setSelectedYear(option?.name);
        setYearFilter(Number(option?.name));

        const { firstDay, lastDay } = getFirstAndLastDayOfYear(option?.name);
        setDateInitFilter(firstDay ?? new Date());
        setDateEndFilter(lastDay ?? new Date());

        localStorage.setItem('date', option?.name);
        localStorage.setItem('dateFilterFrom', formatDate(firstDay, FORMAT_DATE_SHORT));
        localStorage.setItem('dateFilterTo', formatDate(lastDay, FORMAT_DATE_SHORT));
    };

    const handleDoubleClick = (event: React.MouseEvent) => {
        setIsRange(false);
    };

    const handleDoubleClickRange = (event: React.MouseEvent) => {
        setIsRange(true);
    };

    const setSelectedDate_ = (value: any) => {
        //console.log("value from:", formatDate(value?.from, FORMAT_DATE_MEDIUM));
        //console.log("value to:", formatDate(value?.to, FORMAT_DATE_MEDIUM));
        setDateInitFilter(value?.from);
        setDateEndFilter(value?.to);
        setSelectedDate(value);
    };

    return (
        <>
            {isMobile && <div className="grid grid-cols">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    {todayActivityStatus === 'no_activity' && (
                        <div className="col-span-full mb-2">
                            <Badge
                                variant="destructive"
                                className="w-full cursor-pointer py-2 text-xs gap-1.5"
                                onClick={() => openTab(
                                    `/Actividad`,
                                    "Nueva actividad",
                                    <ActivityComponent />
                                )}
                            >
                                <span>⚠ Sin actividad para hoy — Crear actividad →</span>
                            </Badge>
                        </div>
                    )}
                    {todayActivityStatus === 'active' && (
                        <div className="col-span-full mb-2">
                            <Badge variant="secondary" className="w-full text-xs gap-1">
                                ✅ Actividad de hoy asignada
                            </Badge>
                        </div>
                    )}
                    <Card className="bg-white rounded-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total actividades
                            </CardTitle>
                            <Wallet2Icon className="h-7 w-7 text-gray-500 hover:text-gray-700" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {totalActivities ?? 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Actividades creadas
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white rounded-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total participantes
                            </CardTitle>
                            <CheckCheckIcon className="h-7 w-7 text-gray-500 hover:text-gray-700" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {totalParticipants ?? 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Participantes registrados
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white rounded-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total usuarios
                            </CardTitle>
                            <HandCoins className="h-7 w-7 text-gray-500 hover:text-gray-700" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {totalUsers ?? 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Usuarios del sistema
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white rounded-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Completaciones hoy
                            </CardTitle>
                            <NotebookTabsIcon className="h-7 w-7 text-gray-500 hover:text-gray-700" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {totalCompletionsToday}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Actividades completadas hoy
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white rounded-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Retos activos
                            </CardTitle>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                className="h-6 w-6 text-muted-foreground"
                            >
                                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                            </svg>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {totalActiveRetos}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Retos disponibles
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>}
            {!isMobile && <div className="hidden flex-col md:flex w-full">
                <div className="flex-1 space-y-4 pt-1 mx-2 mb-4">
                    <div className="flex items-center justify-between space-y-0 mb-0">
                        <h2 className="text-3xl font-bold tracking-tight ml-4">Panel general </h2>
                        <div className="flex items-center space-x-2">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div onDoubleClick={handleDoubleClick}>
                                            <DropdownMenuButton
                                                label={`${selectedYear}`}
                                                options={yearsOptions}
                                                renderOption={renderOption}
                                                onSelect={handleChangeSelectedYear}
                                                className={`${isRange ? 'bg-gray-300' : 'bg-white'} x-0 py-2 mt-0 max-w-2xl text-sm`}
                                                valueSelected={selectedYear}
                                                disabled={isRange}
                                            />
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>
                                            {isRange && 'Doble click para activar el filtro.'}
                                            {!isRange && 'Filtro activado, seleccione para cargar datos de un año especifico'}
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div onDoubleClick={handleDoubleClickRange}>
                                            <CalendarDateRangePicker disabled={!isRange} setIsRange={setIsRange} setSelectedDate={setSelectedDate_} />
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>
                                            {isRange && 'Doble click para activar el filtro.'}
                                            {!isRange && 'Filtro activado, seleccione para cargar datos de un rango especifico de fechas'}
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            {/*<TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <DocumentReportIcon className="h-7 w-7 text-gray-500 hover:text-gray-700 cursor-pointer" />
                                        <ActivitySheet />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Descargar un reporte general segun el filtro actual .</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>*/}
                        </div>
                    </div>
                    <Tabs defaultValue="overview" className="space-y-5 mt-0">
                        <TabsList className="bg-white rounded-md">
                            <TabsTrigger value="overview" className="hover:text-gray-700 data-[state=active]:bg-gray-100">
                                Principal
                            </TabsTrigger>
                            <TabsTrigger value="analytics" className="hover:text-gray-700 data-[state=active]:bg-gray-100" >
                                Gráficas, Analítica
                            </TabsTrigger>
                            {/*<DataGeneral />*/}
                        </TabsList>
                        <TabsContent value="overview" className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                                <Card className="bg-white rounded-md">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-md font-normal">
                                            Total actividades
                                        </CardTitle>
                                        <Wallet2Icon onClick={() => {
                                            openTab(
                                                `/Actividades`,
                                                "Actividades",
                                                <ActivityDataPage />
                                            );
                                        }} className="h-7 w-7 text-gray-500 hover:text-gray-700 cursor-pointer" />
                                    </CardHeader>
                                    {todayActivityStatus === 'no_activity' && (
                                        <div className="px-6 pb-1">
                                            <Badge
                                                variant="destructive"
                                                className="w-full cursor-pointer py-1.5 text-xs gap-1.5"
                                                onClick={() => openTab(
                                                    `/Actividad`,
                                                    "Nueva actividad",
                                                    <ActivityComponent />
                                                )}
                                            >
                                                <span>⚠ Sin actividad para hoy — Crear actividad →</span>
                                            </Badge>
                                        </div>
                                    )}
                                    {todayActivityStatus === 'active' && (
                                        <div className="px-6 pb-1">
                                            <Badge variant="secondary" className="w-full text-xs gap-1">
                                                ✅ Actividad de hoy asignada
                                            </Badge>
                                        </div>
                                    )}
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {totalActivities ?? 0}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Actividades creadas en el sistema
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-white rounded-md">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-md font-normal">
                                            Total participantes
                                        </CardTitle>
                                        <CheckCheckIcon className="h-7 w-7 text-gray-500 hover:text-gray-700" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-xl font-bold">
                                            {totalParticipants ?? 0}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Participantes registrados
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-white rounded-md">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-md font-normal">
                                            Total usuarios
                                        </CardTitle>
                                        <HandCoins onClick={() => {
                                            openTab(
                                                `/Total de Usuarios`,
                                                "Total de Usuarios",
                                                <UserDataPage />
                                            );
                                        }} className="h-7 w-7 text-gray-500 hover:text-gray-700 cursor-pointer" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-xl font-bold">
                                            {totalUsers ?? 0}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Usuarios del sistema
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-white rounded-md">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-md font-normal">
                                            Completaciones hoy
                                        </CardTitle>
                                        <NotebookTabsIcon className="h-7 w-7 text-gray-500 hover:text-gray-700" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-xl font-bold">
                                            {totalCompletionsToday}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Actividades completadas hoy
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-white rounded-md">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-md font-normal">
                                            Retos activos
                                        </CardTitle>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            className="h-6 w-6 text-muted-foreground"
                                        >
                                            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                                        </svg>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-xl font-bold">
                                            {totalActiveRetos}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Retos grupales disponibles
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                                <Card className="col-span-4 bg-white rounded-md">
                                    <CardHeader>
                                        <CardTitle>
                                            <div className="flex items-center justify-between">
                                                <p>Información general</p>
                                                <SquareArrowOutUpRightIcon onClick={() => {
                                                    /*openTab(
                                                        `/InformacionGeneral`,
                                                        "Información general",
                                                        <ParticipantDashboardMini />
                                                    );*/
                                                }} className="h-5 w-5 text-gray-500 hover:text-gray-700 cursor-pointer" />
                                            </div>
                                        </CardTitle>
                                        <CardDescription>
                                            Cantidad de actividades generadas por mes en el año {selectedYear}.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pl-2">
                                        {/*<ParticipantDashboardMini />*/}
                                    </CardContent>
                                </Card>
                                <Card className="col-span-3 bg-white rounded-md">
                                    <CardHeader>
                                        <CardTitle>Acciones recientes</CardTitle>
                                        <CardDescription className="text-sm">
                                            Se han gestionado {totalActivities} actividades este mes.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                        <TabsContent value="analytics" className="space-y-4 w-full">
                            <AnalyticsDashboard />
                        </TabsContent>

                    </Tabs>
                </div>
            </div>}
        </>
    )
}

export default GeneralDashboardComponent;
