'use client'

import { Metadata } from "next"

import { getCountAllNotifications, getAll } from "@/api/notification"
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
import { getAvatarUrl } from "@/utils/avatar"
import SafeAvatar from "./ui/safe-avatar"
import { formatToLocalCurrency } from "@/utils/money"
import { getSafeKeyFromStorage, getSafeKeyObjectFromStorage } from "@/utils/safe-token-storage"
import { Badge } from "@/registry/new-york/ui/badge"
import { CheckCheckIcon, CircleDollarSignIcon, HandCoins, NotebookTabsIcon, Users, Wallet2Icon } from "lucide-react"
import { useRouter } from "next/router"
import { useContext, useEffect, useRef, useState } from "react"
import { BarChart, Bar, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import AnalyticsDashboard from "./analytics/analytics-dashboard"
import CalendarDateRangePicker from "./general-dashboard/date-range-picker"
import DropdownMenuButton from "./layouts/menu/dropdown-menu-button"
import ActivityDataPage from "./activity/data-page"
import ActivityComponent from "./activity/activity"
import { getParticipantsOverview, getLeaderboard } from "@/api/participant"
import ParticipantProfile from "./participant/participant-profile"
import { getCountAllUsers, getUsersOverview } from "@/api/user"
import { getCountAllPretest } from "@/api/preTest"
import UserDataPage from "./user/data-page"
import { getCountAllActivities, getCountByType, getActivitiesOverview, getTodayActivity, getTodayCompletionsCount, getActivitiesByMonth, getCreatedActivitiesByMonth } from "@/api/activity"
import { StatCardSkeleton } from "./ui/stat-card-skeleton"
import { ChartSkeleton } from "./ui/chart-skeleton"
import { ListSkeleton } from "./ui/list-skeleton"

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
    const [lastParticipant, setLastParticipant] = useState<any>(null);
    const [percentTotalActivities, setPercentTotalActivities] = useState<number>(0);
    const [totalActivities, setTotalActivities] = useState<number>(0);
    const [percentTotalUsers, setPercentTotalUsers] = useState<number>(0);
    const [totalUsers, setTotalUsers] = useState<number>();
    const [lastRegisteredUser, setLastRegisteredUser] = useState<any>(null);
    const [totalCompletionsToday, setTotalCompletionsToday] = useState<number>(0);
    const [lastTodayCompletion, setLastTodayCompletion] = useState<any>(null);
    const [totalActiveRetos, setTotalActiveRetos] = useState<number>(0);
    const [lastActivity, setLastActivity] = useState<any>(null);
    const [lastReto, setLastReto] = useState<any>(null);
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
    const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
    const [monthlyActivities, setMonthlyActivities] = useState<{ month: string; count: number }[]>([]);
    const [monthlyCreated, setMonthlyCreated] = useState<{ month: string; count: number }[]>([]);
    const [topParticipants, setTopParticipants] = useState<any[]>([]);
    const [labelData, setLabelData] = useState<any>();
    const router = useRouter();
    const { openTab } = useTabs();

    // Loading states para skeletons del dashboard
    const [showCardsSkeleton, setShowCardsSkeleton] = useState(true);
    const [showChartsSkeleton, setShowChartsSkeleton] = useState(true);
    const [showNotifSkeleton, setShowNotifSkeleton] = useState(true);
    const cardLoadsDone = useRef(0);
    const chartLoadsDone = useRef(0);

    const onCardLoaded = () => {
        cardLoadsDone.current = Math.min(cardLoadsDone.current + 1, 4);
        if (cardLoadsDone.current >= 4) setShowCardsSkeleton(false);
    };

    const onChartLoaded = () => {
        chartLoadsDone.current = Math.min(chartLoadsDone.current + 1, 3);
        if (chartLoadsDone.current >= 3) setShowChartsSkeleton(false);
    };

    useEffect(() => {
        const saved = Number(getSafeKeyFromStorage('yearFilter'));
        if (saved) setYearFilter(saved);
        else setYearFilter(getYearCurrent());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getTodayStr = () => {
        return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
    };

    const safeISO = (d: Date | undefined | null) => {
        if (!d) return undefined;
        try { return d.toISOString(); } catch { return undefined; }
    };

    const refreshCounts = (from?: Date | null, to?: Date | null) => {
        const dateInit = safeISO(from) || getTodayStr() + 'T00:00:00.000Z';
        const dateEnd = safeISO(to) || getTodayStr() + 'T23:59:59.999Z';
        return Promise.all([
            getCountAllActivities(dateInit, dateEnd)
                .then(data => setTotalActivities(data?.count ?? 0)),
            getTodayCompletionsCount()
                .then(data => {
                    setTotalCompletionsToday(data?.count ?? 0);
                    setLastTodayCompletion(data?.lastCompletion ?? null);
                }),
            getCountByType('reto')
                .then(data => setTotalActiveRetos(data?.count ?? 0)),
        ]);
    };

    useEffect(() => {
        refreshCounts(dateInitFilter, dateEndFilter)
            .finally(onCardLoaded);
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
        getAll(1, 5)
            .then(data => {
                if (data?.notifications) setRecentNotifications(data.notifications);
            })
            .catch(() => {})
            .finally(() => setShowNotifSkeleton(false));
    }, []);

    const MONTHS_SHORT = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

    useEffect(() => {
        getActivitiesByMonth(selectedYear)
            .then((result) => {
                const mapped = result.map((r: any) => ({
                    month: MONTHS_SHORT[r.month - 1] || `M${r.month}`,
                    count: r.count,
                }));
                setMonthlyActivities(mapped);
            })
            .catch(() => setMonthlyActivities([]))
            .finally(onChartLoaded);
    }, [selectedYear]);

    useEffect(() => {
        getCreatedActivitiesByMonth(selectedYear)
            .then((result) => {
                const mapped = result.map((r: any) => ({
                    month: MONTHS_SHORT[r.month - 1] || `M${r.month}`,
                    count: r.count,
                }));
                setMonthlyCreated(mapped);
            })
            .catch(() => setMonthlyCreated([]))
            .finally(onChartLoaded);
    }, [selectedYear]);

    useEffect(() => {
        getLeaderboard(5)
            .then(data => {
                if (data?.leaderboard) setTopParticipants(data.leaderboard);
            })
            .catch(() => setTopParticipants([]))
            .finally(onChartLoaded);
    }, []);

    useEffect(() => {
        getParticipantsOverview()
            .then(data => {
                if (data) {
                    setTotalParticipants(data.count ?? 0);
                    setLastParticipant(data.lastParticipant ?? null);
                }
            })
            .finally(onCardLoaded);
    }, []);

    useEffect(() => {
        getUsersOverview()
            .then(data => {
                if (data) {
                    setTotalUsers(data.count ?? 0);
                    setLastRegisteredUser(data.lastRegisteredUser ?? null);
                }
            })
            .finally(onCardLoaded);
    }, []);

    useEffect(() => {
        getActivitiesOverview()
            .then(data => {
                if (data) {
                    setLastActivity(data.lastActivity ?? null);
                    setLastReto(data.lastReto ?? null);
                }
            })
            .finally(onCardLoaded);
    }, []);

    useEffect(() => {
        getCountAllPretest()
            .then(data => {
                setTotalInPretest(data);
            });
    }, []);

    const formatFilterDate = (date: any): string => {
        if (!date) return 'Sin filtro';
        try {
            return formatDate(date, FORMAT_DATE_SHORT);
        } catch {
            return 'Fecha inválida';
        }
    };

    useEffect(() => {
        setLabelData(dataLabel_());
    }, [yearFilter, dateInitFilter, dateEndFilter, participantFilter]);

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
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500 w-20">Año:</span>
                    <span className="text-sm font-semibold text-gray-800">{yearFilter || 'Todos'}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500 w-20">Desde:</span>
                    <span className="text-sm text-gray-800">{formatFilterDate(dateInitFilter)}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500 w-20">Hasta:</span>
                    <span className="text-sm text-gray-800">{formatFilterDate(dateEndFilter)}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500 w-20">Usuario:</span>
                    <span className="text-sm text-gray-800">{participantFilter?.label || 'Todos'}</span>
                </div>
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
        refreshCounts(firstDay, lastDay);

        localStorage.setItem('date', option?.name);
        localStorage.setItem('dateFilterFrom', formatDate(firstDay, FORMAT_DATE_SHORT));
        localStorage.setItem('dateFilterTo', formatDate(lastDay, FORMAT_DATE_SHORT));
    };

    const handleDoubleClick = (event: React.MouseEvent) => {
        setIsRange(false);
        // Establecer las fechas al año seleccionado actualmente
        const year = selectedYear || getYearCurrent();
        const { firstDay, lastDay } = getFirstAndLastDayOfYear(String(year));
        setDateInitFilter(firstDay ?? new Date());
        setDateEndFilter(lastDay ?? new Date());
        refreshCounts(firstDay, lastDay);
    };

    const handleDoubleClickRange = (event: React.MouseEvent) => {
        setIsRange(true);
        // Establecer las fechas al mes actual
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        setDateInitFilter(firstDay);
        setDateEndFilter(lastDay);
        refreshCounts(firstDay, lastDay);
    };

    const setSelectedDate_ = (value: any) => {
        setDateInitFilter(value?.from);
        setDateEndFilter(value?.to);
        setSelectedDate(value);
        refreshCounts(value?.from, value?.to);
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
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                            <CardTitle className="text-sm font-medium">
                                Total actividades
                            </CardTitle>
                            <Wallet2Icon className="h-7 w-7 text-gray-500 hover:text-gray-700" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {totalActivities ?? 0}
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                                Actividades creadas
                            </p>
                            {lastActivity ? (
                                <div className="border-t border-gray-100 pt-2 mt-1">
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                                        Última creada
                                    </p>
                                    <div className="flex items-start gap-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold truncate text-gray-800">
                                                {lastActivity.title || 'Sin título'}
                                            </p>
                                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
                                                <span className="capitalize">{lastActivity.type?.replace('_', ' ') || 'actividad'}</span>
                                                {lastActivity.difficulty && (
                                                    <>
                                                        <span>·</span>
                                                        <span>{'⭐'.repeat(lastActivity.difficulty)}</span>
                                                    </>
                                                )}
                                                {lastActivity.emotionName && (
                                                    <>
                                                        <span>·</span>
                                                        <span>{lastActivity.emotionName}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="border-t border-gray-100 pt-2 mt-1">
                                    <p className="text-[10px] text-gray-400 italic">
                                        Sin actividades aún
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    <Card className="bg-white rounded-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                            <CardTitle className="text-sm font-medium">
                                Total participantes
                            </CardTitle>
                            <CheckCheckIcon className="h-7 w-7 text-gray-500 hover:text-gray-700" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {totalParticipants ?? 0}
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                                Participantes registrados
                            </p>
                            {lastParticipant ? (
                                <div className="border-t border-gray-100 pt-2 mt-1">
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                                        Último en participar
                                    </p>
                                    <div
                                        className="flex items-center gap-2 cursor-pointer"
                                        onClick={() => {
                                            openTab(
                                                `/Participante/${lastParticipant.participantId}`,
                                                lastParticipant.nickname || 'Participante',
                                                <ParticipantProfile
                                                    participantId={lastParticipant.participantId}
                                                    nickname={lastParticipant.nickname}
                                                    avatar={lastParticipant.avatar}
                                                    level={lastParticipant.level}
                                                    points={lastParticipant.points}
                                                    currentStreak={lastParticipant.currentStreak}
                                                    maxStreak={lastParticipant.maxStreak}
                                                    totalActivitiesCompleted={lastParticipant.totalActivitiesCompleted}
                                                    course={lastParticipant.course}
                                                    lastParticipation={lastParticipant.lastParticipation}
                                                />
                                            );
                                        }}
                                    >
                                        <SafeAvatar
                                            avatar={lastParticipant.avatar}
                                            name={lastParticipant.nickname || 'Participante'}
                                            className="w-7 h-7"
                                            gradient="from-blue-400 to-purple-500"
                                            ringHover="hover:ring-blue-300"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold truncate text-gray-800">
                                                {lastParticipant.nickname || 'Participante'}
                                            </p>
                                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                                {lastParticipant.level && (
                                                    <span className="uppercase font-medium px-1 py-0.5 rounded bg-gray-100">
                                                        {lastParticipant.level}
                                                    </span>
                                                )}
                                                <span>{lastParticipant.points ?? 0} pts</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="border-t border-gray-100 pt-2 mt-1">
                                    <p className="text-[10px] text-gray-400 italic">
                                        Sin participaciones aún
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    <Card className="bg-white rounded-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                            <CardTitle className="text-sm font-medium">
                                Total usuarios
                            </CardTitle>
                            <HandCoins className="h-7 w-7 text-gray-500 hover:text-gray-700" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {totalUsers ?? 0}
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                                Usuarios del sistema
                            </p>
                            <TooltipProvider>
                                {lastRegisteredUser ? (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="border-t border-gray-100 pt-2 mt-1 cursor-help">
                                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                                                    Último registro
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <SafeAvatar
                                                        avatar={lastRegisteredUser.avatar}
                                                        name={lastRegisteredUser.name || lastRegisteredUser.username || 'Usuario'}
                                                        className="w-7 h-7"
                                                        gradient="from-emerald-400 to-teal-500"
                                                        ringHover="hover:ring-emerald-300"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-semibold truncate text-gray-800">
                                                            {lastRegisteredUser.name || lastRegisteredUser.username || 'Usuario'}
                                                        </p>
                                                        <p className="text-[10px] text-muted-foreground truncate">
                                                            {lastRegisteredUser.role?.name || 'Sin rol'}
                                                            {lastRegisteredUser.createdAt && (
                                                                <> · {new Date(lastRegisteredUser.createdAt).toLocaleDateString(LOCALE, {
                                                                    day: '2-digit',
                                                                    month: 'short',
                                                                })}
                                                                </>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom" align="start" className="w-56 p-3 bg-white shadow-xl border rounded-lg">
                                            <div className="space-y-2 text-xs">
                                                <p className="font-semibold text-gray-800 text-sm">
                                                    {lastRegisteredUser.name || lastRegisteredUser.username}
                                                </p>
                                                <div className="border-t border-gray-100" />
                                                <div className="grid grid-cols-1 gap-1.5 text-gray-600">
                                                    {lastRegisteredUser.username && (
                                                        <p><span className="text-gray-400">Usuario:</span> @{lastRegisteredUser.username}</p>
                                                    )}
                                                    {lastRegisteredUser.email && (
                                                        <p><span className="text-gray-400">Email:</span> {lastRegisteredUser.email}</p>
                                                    )}
                                                    {lastRegisteredUser.role?.name && (
                                                        <p><span className="text-gray-400">Rol:</span> {lastRegisteredUser.role.name}</p>
                                                    )}
                                                    {lastRegisteredUser.company?.name && (
                                                        <p><span className="text-gray-400">Empresa:</span> {lastRegisteredUser.company.name}</p>
                                                    )}
                                                    {lastRegisteredUser.createdAt && (
                                                        <p><span className="text-gray-400">Registro:</span> {new Date(lastRegisteredUser.createdAt).toLocaleDateString(LOCALE, {
                                                            day: '2-digit',
                                                            month: 'long',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                ) : (
                                    <div className="border-t border-gray-100 pt-2 mt-1">
                                        <p className="text-[10px] text-gray-400 italic">
                                            Sin usuarios registrados
                                        </p>
                                    </div>
                                )}
                            </TooltipProvider>
                        </CardContent>
                    </Card>
                    <Card className="bg-white rounded-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                            <CardTitle className="text-sm font-medium">
                                Completaciones hoy
                            </CardTitle>
                            <NotebookTabsIcon className="h-7 w-7 text-gray-500 hover:text-gray-700" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {totalCompletionsToday}
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                                Actividades completadas hoy
                            </p>
                            <TooltipProvider>
                                {lastTodayCompletion ? (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="border-t border-gray-100 pt-2 mt-1 cursor-help">
                                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                                                    Último en completar
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <SafeAvatar
                                                        avatar={lastTodayCompletion.participantAvatar}
                                                        name={lastTodayCompletion.participantNickname || 'Participante'}
                                                        className="w-7 h-7"
                                                        gradient="from-orange-400 to-pink-500"
                                                        ringHover="hover:ring-orange-300"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-semibold truncate text-gray-800">
                                                            {lastTodayCompletion.participantNickname || 'Participante'}
                                                        </p>
                                                        <p className="text-[10px] text-muted-foreground truncate">
                                                            🎯 {lastTodayCompletion.achievedScore}/{lastTodayCompletion.plannedScore}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom" align="start" className="w-56 p-3 bg-white shadow-xl border rounded-lg">
                                            <div className="space-y-2 text-xs">
                                                <div className="flex items-center gap-2">
                                                    <SafeAvatar
                                                        avatar={lastTodayCompletion.participantAvatar}
                                                        name={lastTodayCompletion.participantNickname || 'Participante'}
                                                        className="w-8 h-8"
                                                        gradient="from-orange-400 to-pink-500"
                                                    />
                                                    <div>
                                                        <p className="font-semibold text-gray-800">{lastTodayCompletion.participantNickname}</p>
                                                        {lastTodayCompletion.participantLevel && (
                                                            <p className="text-gray-500 uppercase text-[10px]">{lastTodayCompletion.participantLevel}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="border-t border-gray-100" />
                                                <p><span className="text-gray-400">Actividad:</span> {lastTodayCompletion.activityTitle}</p>
                                                <p><span className="text-gray-400">Puntaje:</span> 🎯 {lastTodayCompletion.achievedScore}/{lastTodayCompletion.plannedScore}</p>
                                                <p><span className="text-gray-400">Puntos del participante:</span> {lastTodayCompletion.participantPoints}</p>
                                                {lastTodayCompletion.completedAt && (
                                                    <p><span className="text-gray-400">Completado:</span> {new Date(lastTodayCompletion.completedAt).toLocaleDateString(LOCALE, {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}</p>
                                                )}
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                ) : (
                                    <div className="border-t border-gray-100 pt-2 mt-1">
                                        <p className="text-[10px] text-gray-400 italic">
                                            Sin completaciones hoy
                                        </p>
                                    </div>
                                )}
                            </TooltipProvider>
                        </CardContent>
                    </Card>
                    <Card className="bg-white rounded-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
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
                            <p className="text-xs text-muted-foreground mb-2">
                                Retos grupales disponibles
                            </p>
                            {lastReto ? (
                                <div className="border-t border-gray-100 pt-2 mt-1">
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                                        Último reto
                                    </p>
                                    <div className="flex items-start gap-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold truncate text-gray-800">
                                                {lastReto.title || 'Sin título'}
                                            </p>
                                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
                                                {lastReto.difficulty && (
                                                    <span>{'⭐'.repeat(lastReto.difficulty)}</span>
                                                )}
                                                {lastReto.scheduleDate && (
                                                    <>
                                                        {lastReto.difficulty && <span>·</span>}
                                                        <span>📅 {new Date(lastReto.scheduleDate).toLocaleDateString(LOCALE, { day: '2-digit', month: 'short' })}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="border-t border-gray-100 pt-2 mt-1">
                                    <p className="text-[10px] text-gray-400 italic">
                                        Sin retos aún
                                    </p>
                                </div>
                            )}
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
                                            <CalendarDateRangePicker
                                                disabled={!isRange}
                                                setIsRange={setIsRange}
                                                setSelectedDate={setSelectedDate_}
                                                externalDateFrom={dateInitFilter ? formatDate(dateInitFilter, 'YYYY-MM-DD') : null}
                                                externalDateTo={dateEndFilter ? formatDate(dateEndFilter, 'YYYY-MM-DD') : null}
                                                onYearSelected={(year) => {
                                                    setSelectedYear(year);
                                                    setYearFilter(year);
                                                }}
                                            />
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
                            {showCardsSkeleton ? (
                                <StatCardSkeleton count={5} className="grid-cols-2 md:grid-cols-2 lg:grid-cols-5" />
                            ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                                <Card className="bg-white rounded-md">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
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
                                        <div className="text-xl font-bold">
                                            {totalActivities ?? 0}
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-3">
                                            Actividades creadas en el sistema
                                        </p>
                                        <TooltipProvider>
                                            {lastActivity ? (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="border-t border-gray-100 pt-3 mt-1 cursor-help">
                                                            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                                                Última creada
                                                            </p>
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-semibold truncate text-gray-800">
                                                                        {lastActivity.title || 'Sin título'}
                                                                    </p>
                                                                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                                                        <span className="capitalize">{lastActivity.type?.replace('_', ' ') || 'actividad'}</span>
                                                                        {lastActivity.difficulty && (
                                                                            <span>{'⭐'.repeat(lastActivity.difficulty)}</span>
                                                                        )}
                                                                        {lastActivity.emotionName && (
                                                                            <>
                                                                                <span>·</span>
                                                                                <span>{lastActivity.emotionName}</span>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="bottom" align="start" className="w-64 p-4 bg-white shadow-xl border rounded-lg">
                                                        <div className="space-y-2 text-xs">
                                                            <p className="font-semibold text-gray-800 text-sm">{lastActivity.title}</p>
                                                            <div className="border-t border-gray-100" />
                                                            <p><span className="text-gray-400">Tipo:</span> <span className="capitalize">{lastActivity.type?.replace('_', ' ')}</span></p>
                                                            {lastActivity.difficulty && (
                                                                <p><span className="text-gray-400">Dificultad:</span> {'⭐'.repeat(lastActivity.difficulty)} ({lastActivity.difficulty}/5)</p>
                                                            )}
                                                            {lastActivity.emotionName && (
                                                                <p><span className="text-gray-400">Emoción:</span> {lastActivity.emotionName}</p>
                                                            )}
                                                            {lastActivity.scheduleDate && (
                                                                <p><span className="text-gray-400">Fecha programada:</span> {new Date(lastActivity.scheduleDate).toLocaleDateString(LOCALE, { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                                            )}
                                                            <p><span className="text-gray-400">Creada:</span> {new Date(lastActivity.createdAt).toLocaleDateString(LOCALE, { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                                        </div>
                                                    </TooltipContent>
                                                </Tooltip>
                                            ) : (
                                                <div className="border-t border-gray-100 pt-3 mt-1">
                                                    <p className="text-[11px] text-gray-400 italic">
                                                        Sin actividades aún
                                                    </p>
                                                </div>
                                            )}
                                        </TooltipProvider>
                                    </CardContent>
                                </Card>
                                <Card className="bg-white rounded-md">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                                        <CardTitle className="text-md font-normal">
                                            Total participantes
                                        </CardTitle>
                                        <CheckCheckIcon className="h-7 w-7 text-gray-500 hover:text-gray-700" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-xl font-bold">
                                            {totalParticipants ?? 0}
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-3">
                                            Participantes registrados
                                        </p>
                                        {lastParticipant ? (
                                            <div className="border-t border-gray-100 pt-3 mt-1">
                                                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                                    Último en participar
                                                </p>
                                                <div className="flex items-center gap-2.5">
                                                    <HoverCard>
                                                        <HoverCardTrigger asChild>
                                                            <div
                                                                className="cursor-pointer"
                                                                onClick={() => {
                                                                    openTab(
                                                                        `/Participante/${lastParticipant.participantId}`,
                                                                        lastParticipant.nickname || 'Participante',
                                                                        <ParticipantProfile
                                                                            participantId={lastParticipant.participantId}
                                                                            nickname={lastParticipant.nickname}
                                                                            avatar={lastParticipant.avatar}
                                                                            level={lastParticipant.level}
                                                                            points={lastParticipant.points}
                                                                            currentStreak={lastParticipant.currentStreak}
                                                                            maxStreak={lastParticipant.maxStreak}
                                                                            totalActivitiesCompleted={lastParticipant.totalActivitiesCompleted}
                                                                            course={lastParticipant.course}
                                                                            lastParticipation={lastParticipant.lastParticipation}
                                                                        />
                                                                    );
                                                                }}
                                                            >
                                                                <SafeAvatar
                                                                    avatar={lastParticipant.avatar}
                                                                    name={lastParticipant.nickname || 'Participante'}
                                                                    className="w-8 h-8"
                                                                    gradient="from-blue-400 to-purple-500"
                                                                    ringHover="hover:ring-blue-300"
                                                                />
                                                            </div>
                                                        </HoverCardTrigger>
                                                        <HoverCardContent
                                                            side="bottom"
                                                            align="start"
                                                            className="w-64 p-4 bg-white shadow-xl border rounded-lg"
                                                        >
                                                            <div className="space-y-3">
                                                                {/* Cabecera con avatar grande y nickname */}
                                                                <div className="flex items-center gap-3">
                                                                    <SafeAvatar
                                                                        avatar={lastParticipant.avatar}
                                                                        name={lastParticipant.nickname || 'Participante'}
                                                                        className="w-10 h-10"
                                                                        gradient="from-blue-400 to-purple-500"
                                                                    />
                                                                    <div>
                                                                        <p className="text-sm font-semibold text-gray-800">
                                                                            {lastParticipant.nickname || 'Participante'}
                                                                        </p>
                                                                        {lastParticipant.course?.name && (
                                                                            <p className="text-[11px] text-muted-foreground">
                                                                                {lastParticipant.course.name}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Barra separadora */}
                                                                <div className="border-t border-gray-100" />

                                                                {/* Grid de estadísticas */}
                                                                <div className="grid grid-cols-2 gap-y-2 gap-x-3 text-xs">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <span className="text-yellow-500 text-sm">⭐</span>
                                                                        <div>
                                                                            <p className="text-gray-400 text-[10px]">Nivel</p>
                                                                            <p className="font-semibold text-gray-700 uppercase">
                                                                                {lastParticipant.level || 'bronce'}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-1.5">
                                                                        <span className="text-blue-500 text-sm">📊</span>
                                                                        <div>
                                                                            <p className="text-gray-400 text-[10px]">Puntos</p>
                                                                            <p className="font-semibold text-gray-700">
                                                                                {lastParticipant.points ?? 0}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-1.5">
                                                                        <span className="text-green-500 text-sm">🏆</span>
                                                                        <div>
                                                                            <p className="text-gray-400 text-[10px]">Completadas</p>
                                                                            <p className="font-semibold text-gray-700">
                                                                                {lastParticipant.totalActivitiesCompleted ?? 0}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-1.5">
                                                                        <span className="text-orange-500 text-sm">🔥</span>
                                                                        <div>
                                                                            <p className="text-gray-400 text-[10px]">Racha</p>
                                                                            <p className="font-semibold text-gray-700">
                                                                                {lastParticipant.currentStreak ?? 0}
                                                                                {lastParticipant.maxStreak > 0 && (
                                                                                    <span className="text-gray-400 font-normal">
                                                                                        {' '}/ máx {lastParticipant.maxStreak}
                                                                                    </span>
                                                                                )}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Última actividad */}
                                                                {lastParticipant.lastParticipation && (
                                                                    <>
                                                                        <div className="border-t border-gray-100" />
                                                                        <div className="text-xs">
                                                                            <p className="text-gray-400 text-[10px] mb-0.5">Última actividad</p>
                                                                            <p className="font-medium text-gray-700 truncate">
                                                                                {lastParticipant.lastParticipation.activityTitle || 'Actividad completada'}
                                                                            </p>
                                                                            <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
                                                                                <span>
                                                                                    🎯 {lastParticipant.lastParticipation.achievedScore}/{lastParticipant.lastParticipation.plannedScore}
                                                                                </span>
                                                                                {lastParticipant.lastParticipation.completedAt && (
                                                                                    <>
                                                                                        <span>·</span>
                                                                                        <span>
                                                                                            {new Date(lastParticipant.lastParticipation.completedAt).toLocaleDateString(LOCALE, {
                                                                                                day: '2-digit',
                                                                                                month: 'short',
                                                                                                hour: '2-digit',
                                                                                                minute: '2-digit',
                                                                                            })}
                                                                                        </span>
                                                                                    </>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </HoverCardContent>
                                                    </HoverCard>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold truncate text-gray-800">
                                                            {lastParticipant.nickname || 'Participante'}
                                                        </p>
                                                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                                            {lastParticipant.level && (
                                                                <span className="uppercase font-medium text-[10px] px-1.5 py-0.5 rounded bg-gray-100">
                                                                    {lastParticipant.level}
                                                                </span>
                                                            )}
                                                            <span>{lastParticipant.points ?? 0} pts</span>
                                                            {lastParticipant.course?.name && (
                                                                <span className="truncate">· {lastParticipant.course.name}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                {lastParticipant.lastParticipation && (
                                                    <div className="mt-2 text-[11px] text-gray-400 flex items-center gap-1">
                                                        <span>📍</span>
                                                        <span className="truncate">
                                                            {lastParticipant.lastParticipation.activityTitle || 'Actividad'}
                                                        </span>
                                                        {lastParticipant.lastParticipation.completedAt && (
                                                            <>
                                                                <span>·</span>
                                                                <span className="whitespace-nowrap">
                                                                    {new Date(lastParticipant.lastParticipation.completedAt).toLocaleDateString(LOCALE, {
                                                                        day: '2-digit',
                                                                        month: 'short',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit',
                                                                    })}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="border-t border-gray-100 pt-3 mt-1">
                                                <p className="text-[11px] text-gray-400 italic">
                                                    Sin participaciones aún
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                                <Card className="bg-white rounded-md">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                                        <CardTitle className="text-md font-normal">
                                            Total de usuarios
                                        </CardTitle>
                                        <Users onClick={() => {
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
                                        <p className="text-xs text-muted-foreground mb-3">
                                            Usuarios del sistema
                                        </p>
                                        <TooltipProvider>
                                            {lastRegisteredUser ? (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="border-t border-gray-100 pt-3 mt-1 cursor-help">
                                                            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                                                Último registro
                                                            </p>
                                                            <div className="flex items-center gap-2.5">
                                                                <SafeAvatar
                                                                    avatar={lastRegisteredUser.avatar}
                                                                    name={lastRegisteredUser.name || lastRegisteredUser.username || 'Usuario'}
                                                                    className="w-8 h-8"
                                                                    gradient="from-emerald-400 to-teal-500"
                                                                    ringHover="hover:ring-emerald-300"
                                                                />
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-semibold truncate text-gray-800">
                                                                        {lastRegisteredUser.name || lastRegisteredUser.username || 'Usuario'}
                                                                    </p>
                                                                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                                                        <span>{lastRegisteredUser.role?.name || 'Sin rol'}</span>
                                                                        {lastRegisteredUser.company?.name && (
                                                                            <>
                                                                                <span>·</span>
                                                                                <span className="truncate">{lastRegisteredUser.company.name}</span>
                                                                            </>
                                                                        )}
                                                                        {lastRegisteredUser.createdAt && (
                                                                            <>
                                                                                <span>·</span>
                                                                                <span className="whitespace-nowrap">
                                                                                    {new Date(lastRegisteredUser.createdAt).toLocaleDateString(LOCALE, {
                                                                                        day: '2-digit',
                                                                                        month: 'short',
                                                                                    })}
                                                                                </span>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="bottom" align="start" className="w-64 p-4 bg-white shadow-xl border rounded-lg">
                                                        <div className="space-y-2 text-xs">
                                                            <div className="flex items-center gap-2.5">
                                                                <SafeAvatar
                                                                    avatar={lastRegisteredUser.avatar}
                                                                    name={lastRegisteredUser.name || lastRegisteredUser.username || 'Usuario'}
                                                                    className="w-10 h-10"
                                                                    gradient="from-emerald-400 to-teal-500"
                                                                />
                                                                <div>
                                                                    <p className="font-semibold text-gray-800 text-sm">
                                                                        {lastRegisteredUser.name || lastRegisteredUser.username}
                                                                    </p>
                                                                    {lastRegisteredUser.role?.name && (
                                                                        <p className="text-gray-500">{lastRegisteredUser.role.name}</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="border-t border-gray-100" />
                                                            <div className="grid grid-cols-1 gap-1.5 text-gray-600">
                                                                {lastRegisteredUser.username && (
                                                                    <p><span className="text-gray-400">Usuario:</span> @{lastRegisteredUser.username}</p>
                                                                )}
                                                                {lastRegisteredUser.email && (
                                                                    <p><span className="text-gray-400">Email:</span> {lastRegisteredUser.email}</p>
                                                                )}
                                                                {lastRegisteredUser.documentNumber && (
                                                                    <p><span className="text-gray-400">Documento:</span> {lastRegisteredUser.documentNumber}</p>
                                                                )}
                                                                {lastRegisteredUser.phoneNumber && (
                                                                    <p><span className="text-gray-400">Teléfono:</span> {lastRegisteredUser.phoneNumber}</p>
                                                                )}
                                                                {lastRegisteredUser.company?.name && (
                                                                    <p><span className="text-gray-400">Empresa:</span> {lastRegisteredUser.company.name}</p>
                                                                )}
                                                                {lastRegisteredUser.createdAt && (
                                                                    <p><span className="text-gray-400">Registro:</span> {new Date(lastRegisteredUser.createdAt).toLocaleDateString(LOCALE, {
                                                                        day: '2-digit',
                                                                        month: 'long',
                                                                        year: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit',
                                                                    })}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </TooltipContent>
                                                </Tooltip>
                                            ) : (
                                                <div className="border-t border-gray-100 pt-3 mt-1">
                                                    <p className="text-[11px] text-gray-400 italic">
                                                        Sin usuarios registrados
                                                    </p>
                                                </div>
                                            )}
                                        </TooltipProvider>
                                    </CardContent>
                                </Card>
                                <Card className="bg-white rounded-md">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                                        <CardTitle className="text-md font-normal">
                                            Completaciones hoy
                                        </CardTitle>
                                        <NotebookTabsIcon className="h-7 w-7 text-gray-500 hover:text-gray-700" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-xl font-bold">
                                            {totalCompletionsToday}
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-3">
                                            Actividades completadas hoy
                                        </p>
                                        <TooltipProvider>
                                            {lastTodayCompletion ? (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="border-t border-gray-100 pt-3 mt-1 cursor-help">
                                                            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                                                Último en completar
                                                            </p>
                                                            <div className="flex items-center gap-2.5">
                                                                 {lastTodayCompletion.participantAvatar && (
                                                                     <SafeAvatar
                                                                         avatar={lastTodayCompletion.participantAvatar}
                                                                         name={lastTodayCompletion.participantNickname || 'Participante'}
                                                                         className="w-8 h-8"
                                                                         gradient="from-orange-400 to-pink-500"
                                                                         ringHover="hover:ring-orange-300"
                                                                     />
                                                                 )}
                                                                 <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-semibold truncate text-gray-800">
                                                                        {lastTodayCompletion.participantNickname || 'Participante'}
                                                                    </p>
                                                                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                                                        <span className="uppercase font-medium text-[10px] px-1.5 py-0.5 rounded bg-gray-100">
                                                                            {lastTodayCompletion.participantLevel}
                                                                        </span>
                                                                        <span>🎯 {lastTodayCompletion.achievedScore}/{lastTodayCompletion.plannedScore}</span>
                                                                        <span>·</span>
                                                                        <span className="truncate">{lastTodayCompletion.activityTitle}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="bottom" align="start" className="w-64 p-4 bg-white shadow-xl border rounded-lg">
                                                        <div className="space-y-2 text-xs">
                                                            <div className="flex items-center gap-2.5">
                                                                <SafeAvatar
                                                                    avatar={lastTodayCompletion.participantAvatar}
                                                                    name={lastTodayCompletion.participantNickname || 'Participante'}
                                                                    className="w-10 h-10"
                                                                    gradient="from-orange-400 to-pink-500"
                                                                />
                                                                <div>
                                                                    <p className="font-semibold text-gray-800 text-sm">{lastTodayCompletion.participantNickname}</p>
                                                                    <p className="text-gray-500 uppercase text-[10px]">{lastTodayCompletion.participantLevel}</p>
                                                                </div>
                                                            </div>
                                                            <div className="border-t border-gray-100" />
                                                            <p><span className="text-gray-400">Actividad:</span> {lastTodayCompletion.activityTitle}</p>
                                                            <p><span className="text-gray-400">Puntaje:</span> 🎯 {lastTodayCompletion.achievedScore}/{lastTodayCompletion.plannedScore}</p>
                                                            <p><span className="text-gray-400">Puntos del participante:</span> {lastTodayCompletion.participantPoints}</p>
                                                            {lastTodayCompletion.completedAt && (
                                                                <p><span className="text-gray-400">Completado:</span> {new Date(lastTodayCompletion.completedAt).toLocaleDateString(LOCALE, {
                                                                    day: '2-digit',
                                                                    month: 'short',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                })}</p>
                                                            )}
                                                        </div>
                                                    </TooltipContent>
                                                </Tooltip>
                                            ) : (
                                                <div className="border-t border-gray-100 pt-3 mt-1">
                                                    <p className="text-[11px] text-gray-400 italic">
                                                        Sin completaciones hoy
                                                    </p>
                                                </div>
                                            )}
                                        </TooltipProvider>
                                    </CardContent>
                                </Card>
                                <Card className="bg-white rounded-md">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
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
                                        <p className="text-xs text-muted-foreground mb-3">
                                            Retos grupales disponibles
                                        </p>
                                        <TooltipProvider>
                                            {lastReto ? (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="border-t border-gray-100 pt-3 mt-1 cursor-help">
                                                            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                                                Último reto
                                                            </p>
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-semibold truncate text-gray-800">
                                                                        {lastReto.title || 'Sin título'}
                                                                    </p>
                                                                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                                                        {lastReto.difficulty && (
                                                                            <span>{'⭐'.repeat(lastReto.difficulty)}</span>
                                                                        )}
                                                                        {lastReto.scheduleDate && (
                                                                            <>
                                                                                {lastReto.difficulty && <span>·</span>}
                                                                                <span>📅 {new Date(lastReto.scheduleDate).toLocaleDateString(LOCALE, { day: '2-digit', month: 'short' })}</span>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="bottom" align="start" className="w-64 p-4 bg-white shadow-xl border rounded-lg">
                                                        <div className="space-y-2 text-xs">
                                                            <p className="font-semibold text-gray-800 text-sm">{lastReto.title}</p>
                                                            <div className="border-t border-gray-100" />
                                                            {lastReto.difficulty && (
                                                                <p><span className="text-gray-400">Dificultad:</span> {'⭐'.repeat(lastReto.difficulty)} ({lastReto.difficulty}/5)</p>
                                                            )}
                                                            {lastReto.scheduleDate && (
                                                                <p><span className="text-gray-400">Fecha programada:</span> {new Date(lastReto.scheduleDate).toLocaleDateString(LOCALE, { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                                            )}
                                                            <p><span className="text-gray-400">Creado:</span> {new Date(lastReto.createdAt).toLocaleDateString(LOCALE, { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                                        </div>
                                                    </TooltipContent>
                                                </Tooltip>
                                            ) : (
                                                <div className="border-t border-gray-100 pt-3 mt-1">
                                                    <p className="text-[11px] text-gray-400 italic">
                                                        Sin retos aún
                                                    </p>
                                                </div>
                                            )}
                                        </TooltipProvider>
                                    </CardContent>
                                </Card>
                            </div>
                            )}
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                                {showChartsSkeleton ? (
                                    <Card className="col-span-4 bg-white rounded-md">
                                        <CardHeader className="pb-2">
                                            <CardTitle>
                                                <div className="flex items-center justify-between">
                                                    <p>Información general</p>
                                                </div>
                                            </CardTitle>
                                            <CardDescription>
                                                Actividades creadas y sus participaciones por mes en {selectedYear}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <ChartSkeleton />
                                            <div className="mt-4">
                                                <h4 className="text-sm font-semibold text-gray-500 mb-2 flex items-center gap-1.5">
                                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
                                                    Top participantes
                                                </h4>
                                                <ListSkeleton rows={5} />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ) : (
                                <Card className="col-span-4 bg-white rounded-md">
                                    <CardHeader className="pb-2">
                                        <CardTitle>
                                            <div className="flex items-center justify-between">
                                                <p>Información general</p>
                                            </div>
                                        </CardTitle>
                                        <CardDescription>
                                            Actividades creadas y sus participaciones por mes en {selectedYear}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {(() => {
                                            const chartData = monthlyCreated.length > 0 ? monthlyCreated.map((m, i) => ({
                                                month: m.month,
                                                creadas: m.count,
                                                participaciones: monthlyActivities[i]?.count || 0,
                                            })) : [];
                                            return chartData.length > 0 ? (
                                                <div className="h-[160px] mb-4">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                            <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                                            <RechartsTooltip content={({ active, payload }) => {
                                                                if (!active || !payload?.length) return null;
                                                                const d = payload[0].payload;
                                                                return (
                                                                    <div className="bg-white border rounded-md shadow-md px-3 py-2 text-xs space-y-1">
                                                                        <p className="font-medium text-gray-700">{d.month}</p>
                                                                        <p><span className="text-blue-600 font-semibold">{d.creadas}</span> actividades creadas</p>
                                                                        <p><span className="text-green-600 font-semibold">{d.participaciones}</span> participaciones</p>
                                                                    </div>
                                                                );
                                                            }} />
                                                            <Bar dataKey="creadas" name="Actividades" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={32} />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            ) : (
                                                <div className="h-[120px] flex items-center justify-center">
                                                    <p className="text-sm text-muted-foreground">No hay datos para {selectedYear}</p>
                                                </div>
                                            );
                                        })()}
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-500 mb-2 flex items-center gap-1.5">
                                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
                                                Top participantes
                                            </h4>
                                            {topParticipants.length === 0 ? (
                                                <p className="text-xs text-muted-foreground text-center py-4">Sin datos de participación</p>
                                            ) : (
                                                <ul className="space-y-2">
                                                    {topParticipants.map((p: any) => (
                                                        <li key={p.rank} className="flex items-center gap-2 border-b border-gray-100 pb-2 last:border-0">
                                                            <span className="text-xs font-bold text-gray-400 w-4 text-right flex-shrink-0">{p.rank}</span>
                                                            <SafeAvatar
                                                                avatar={p.avatar}
                                                                name={p.nickname || 'Participante'}
                                                                className="w-5 h-5"
                                                                gradient="from-gray-300 to-gray-400"
                                                                ringHover=""
                                                            />
                                                            <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                                                <span className="text-sm font-medium truncate">{p.nickname || 'Participante'}</span>
                                                                {p.course && (
                                                                    <span className="text-[11px] text-muted-foreground truncate">
                                                                        {p.course.name}{p.course.companyName ? ` · ${p.course.companyName}` : ''}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                                {p.level && (
                                                                    <span className="text-[10px] uppercase font-semibold text-gray-400">{p.level}</span>
                                                                )}
                                                                <span className="text-sm font-semibold text-blue-600">{p.points ?? 0}</span>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                                )}
                                {showNotifSkeleton ? (
                                    <Card className="col-span-3 bg-white rounded-md">
                                        <CardHeader className="pb-3">
                                            <CardTitle>Acciones recientes</CardTitle>
                                            <CardDescription className="text-sm">
                                                Últimas notificaciones del sistema
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <ListSkeleton rows={5} avatar={false} subtitle />
                                        </CardContent>
                                    </Card>
                                ) : (
                                <Card className="col-span-3 bg-white rounded-md">
                                    <CardHeader className="pb-3">
                                        <CardTitle>Acciones recientes</CardTitle>
                                        <CardDescription className="text-sm">
                                            Últimas notificaciones del sistema
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="max-h-[260px] overflow-y-auto">
                                        {recentNotifications.length === 0 ? (
                                            <p className="text-sm text-muted-foreground text-center py-8">
                                                No hay acciones recientes
                                            </p>
                                        ) : (
                                            <ul className="space-y-3">
                                                {recentNotifications.map((n: any, i: number) => (
                                                    <li key={n._id || i} className="flex items-start gap-3 border-b border-gray-100 pb-2 last:border-0">
                                                        <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${n.isRead ? 'bg-gray-300' : 'bg-blue-500'}`} />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium truncate">{n.title}</p>
                                                            {n.message && (
                                                                <p className="text-xs text-muted-foreground truncate">{n.message}</p>
                                                            )}
                                                            {n.createdAt && (
                                                                <p className="text-xs text-gray-400 mt-0.5">
                                                                    {new Date(n.createdAt).toLocaleDateString(LOCALE, {
                                                                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                                                                    })}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </CardContent>
                                </Card>
                                )}
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
