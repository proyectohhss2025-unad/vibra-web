/**
 * StudentDashboardComponent — Panel de inicio para usuarios con rol Estudiante.
 *
 * Muestra el progreso personal del estudiante: nivel, racha, actividades,
 * emociones y ranking. Enfoque mixto (informativo + gamificado).
 *
 * Routing: DashboardRouter → StudentDashboardComponent (cuando roleName === 'Estudiante')
 */
'use client'

import { getLeaderboard, getParticipantStats, getParticipantActivityHistory } from "@/api/participant"
import { AuthContext } from "@/services/auth"
import { useDevice } from "@/services/contexts/device-context"
import { getSafeKeyObjectFromStorage } from "@/utils/safe-token-storage"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/registry/new-york/ui/card"
import { Badge } from "@/registry/new-york/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/registry/new-york/ui/avatar"
import {
    BarChart3,
    Flame,
    CheckCircle,
    Award,
    TrendingUp,
    Star,
} from "lucide-react"
import { useContext, useEffect, useRef, useState } from "react"
import { StatCardSkeleton } from "../ui/stat-card-skeleton"
import { ListSkeleton } from "../ui/list-skeleton"
import SafeAvatar from "../ui/safe-avatar"

// ─── Mapa de niveles a colores ───────────────────────────────────
const LEVEL_COLORS: Record<string, string> = {
    bronce: 'from-amber-700 to-amber-500',
    plata: 'from-gray-400 to-gray-300',
    oro: 'from-yellow-500 to-yellow-300',
    platino: 'from-cyan-500 to-cyan-300',
    diamante: 'from-blue-500 to-purple-500',
}

function getLevelColor(level?: string): string {
    return LEVEL_COLORS[level?.toLowerCase() ?? ''] || 'from-amber-700 to-amber-500'
}

// ─── Cálculo de EXP para siguiente nivel ─────────────────────────
function calcExpProgress(points: number): { percent: number; nextLevelAt: number } {
    // Progresión: cada nivel requiere más puntos
    // Niveles: Bronce I (0-500), Bronce II (500-1200), Bronce III (1200-2200),
    //          Plata I (2200-3500), etc.
    if (points < 500) return { percent: (points / 500) * 100, nextLevelAt: 500 }
    if (points < 1200) return { percent: ((points - 500) / 700) * 100, nextLevelAt: 1200 }
    if (points < 2200) return { percent: ((points - 1200) / 1000) * 100, nextLevelAt: 2200 }
    if (points < 3500) return { percent: ((points - 2200) / 1300) * 100, nextLevelAt: 3500 }
    if (points < 5500) return { percent: ((points - 3500) / 2000) * 100, nextLevelAt: 5500 }
    return { percent: 100, nextLevelAt: points }
}

const StudentDashboardComponent: React.FC = () => {
    const { resolvedPermissions } = useContext(AuthContext)
    const { isMobile } = useDevice()

    // ─── Participante desde localStorage o AuthContext ────────────
    // Puede estar en 'participantSelected' (elegido en selector) o
    // en 'participant' (seteado por AuthProvider desde API).
    const participant: any =
        JSON.parse(getSafeKeyObjectFromStorage('participantSelected') ?? 'null')
        ?? JSON.parse(getSafeKeyObjectFromStorage('participant') ?? 'null')
        ?? {}

    const participantId = participant?.participantId ?? participant?._id ?? ''
    const nickname = participant?.nickname ?? participant?.name ?? 'Estudiante'
    const avatar = participant?.avatar ?? ''
    const level = participant?.level ?? 'bronce'
    const points = participant?.points ?? 0
    const currentStreak = participant?.currentStreak ?? 0
    const totalActivities = participant?.totalActivitiesCompleted ?? 0

    // ─── Estados ────────────────────────────────────────────────────
    const [ranking, setRanking] = useState<any[]>([])
    const [activities, setActivities] = useState<any[]>([])
    const [participantStats, setParticipantStats] = useState<any>(null)

    // ─── Loading states ─────────────────────────────────────────────
    const [showCardsSkeleton, setShowCardsSkeleton] = useState(true)
    const [showActivitiesSkeleton, setShowActivitiesSkeleton] = useState(true)
    const [showRankingSkeleton, setShowRankingSkeleton] = useState(true)
    const loadCount = useRef(0)

    const onSectionLoaded = () => {
        loadCount.current = Math.min(loadCount.current + 1, 2)
        if (loadCount.current >= 2) setShowCardsSkeleton(false)
    }

    // ─── Efectos ────────────────────────────────────────────────────
    useEffect(() => {
        getLeaderboard(5)
            .then((data) => setRanking(data?.leaderboard || []))
            .catch(() => setRanking([]))
            .finally(() => {
                setShowRankingSkeleton(false)
                onSectionLoaded()
            })
    }, [])

    useEffect(() => {
        if (!participantId) {
            setShowActivitiesSkeleton(false)
            onSectionLoaded()
            return
        }
        Promise.all([
            getParticipantStats(participantId),
            getParticipantActivityHistory(participantId, 1, 5),
        ])
            .then(([stats, history]) => {
                setParticipantStats(stats)
                setActivities(history?.data || [])
            })
            .catch(() => {
                setParticipantStats(null)
                setActivities([])
            })
            .finally(() => {
                setShowActivitiesSkeleton(false)
                onSectionLoaded()
            })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [participantId])

    // ─── EXP ───────────────────────────────────────────────────────
    const { percent: expPercent, nextLevelAt } = calcExpProgress(points)

    // ─── Ranking: destacar al estudiante actual ────────────────────
    const myRank = ranking.findIndex(
        (r: any) =>
            r.participantId === participantId ||
            r._id === participantId ||
            r.nickname === nickname
    )
    const myPosition = myRank >= 0 ? myRank + 1 : null

    // ─── Render ─────────────────────────────────────────────────────
    return (
        <>
            {isMobile && (
                <div className="grid grid-cols">
                    <div className="grid gap-4 px-2 pt-2">
                        <div className="flex items-center gap-3">
                            <SafeAvatar
                                avatar={avatar}
                                name={nickname}
                                className="w-10 h-10"
                                gradient={getLevelColor(level)}
                            />
                            <div>
                                <h2 className="text-lg font-bold">Mi Progreso</h2>
                                <p className="text-xs text-muted-foreground capitalize">
                                    {nickname} · Nivel {level}
                                </p>
                            </div>
                        </div>
                        {showCardsSkeleton ? (
                            <StatCardSkeleton count={4} className="grid-cols-2" />
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                <Card><CardContent className="p-4">
                                    <div className="flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5 text-blue-500" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Nivel</p>
                                            <p className="text-sm font-bold capitalize">{level}</p>
                                        </div>
                                    </div>
                                </CardContent></Card>
                                <Card><CardContent className="p-4">
                                    <div className="flex items-center gap-2">
                                        <Flame className="h-5 w-5 text-orange-500" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Racha</p>
                                            <p className="text-sm font-bold">{currentStreak} días</p>
                                        </div>
                                    </div>
                                </CardContent></Card>
                                <Card><CardContent className="p-4">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Completadas</p>
                                            <p className="text-sm font-bold">{totalActivities}</p>
                                        </div>
                                    </div>
                                </CardContent></Card>
                                <Card><CardContent className="p-4">
                                    <div className="flex items-center gap-2">
                                        <Award className="h-5 w-5 text-yellow-500" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Puntos</p>
                                            <p className="text-sm font-bold">{points.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </CardContent></Card>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {!isMobile && (
                <div className="hidden flex-col md:flex w-full">
                    <div className="flex-1 space-y-4 pt-1 mx-2 mb-4">
                        {/* Header con perfil */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <SafeAvatar
                                    avatar={avatar}
                                    name={nickname}
                                    className="w-12 h-12"
                                    gradient={getLevelColor(level)}
                                />
                                <div>
                                    <h2 className="text-3xl font-bold tracking-tight">
                                        Mi Progreso
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        {nickname}
                                        <span className="mx-2">·</span>
                                        <Badge variant="secondary" className="text-xs font-normal capitalize">
                                            Nivel {level}
                                        </Badge>
                                        {resolvedPermissions?.role?.name && (
                                            <>
                                                <span className="mx-2">·</span>
                                                <span className="text-xs">{resolvedPermissions.role.name}</span>
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Cards */}
                        {showCardsSkeleton ? (
                            <StatCardSkeleton count={4} className="grid-cols-2 md:grid-cols-2 lg:grid-cols-4" />
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                {/* Nivel y EXP */}
                                <Card className="bg-white rounded-md">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-md font-normal">Nivel</CardTitle>
                                        <BarChart3 className="h-6 w-6 text-blue-500" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold capitalize">{level}</div>
                                        <p className="text-xs text-muted-foreground mb-2">
                                            {points.toLocaleString()} / {nextLevelAt.toLocaleString()} pts
                                        </p>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div
                                                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                                                style={{ width: `${Math.min(expPercent, 100)}%` }}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Racha */}
                                <Card className="bg-white rounded-md">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-md font-normal">Racha</CardTitle>
                                        <Flame className="h-6 w-6 text-orange-500" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{currentStreak}</div>
                                        <p className="text-xs text-muted-foreground">
                                            {currentStreak === 1
                                                ? 'día consecutivo'
                                                : 'días consecutivos'}
                                        </p>
                                        {currentStreak > 0 && (
                                            <div className="border-t border-gray-100 pt-2 mt-2">
                                                <p className="text-xs text-orange-600 flex items-center gap-1">
                                                    <Flame className="h-3 w-3" />
                                                    {currentStreak >= 7
                                                        ? '¡Imparable! 🔥'
                                                        : currentStreak >= 3
                                                        ? '¡Buena racha! sigue así'
                                                        : '¡Vamos por más!'}
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Completadas */}
                                <Card className="bg-white rounded-md">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-md font-normal">Completadas</CardTitle>
                                        <CheckCircle className="h-6 w-6 text-green-500" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{totalActivities}</div>
                                        <p className="text-xs text-muted-foreground">
                                            actividades completadas
                                        </p>
                                        {participantStats?.totalParticipations && (
                                            <div className="border-t border-gray-100 pt-2 mt-2">
                                                <p className="text-xs text-gray-500">
                                                    Promedio:{' '}
                                                    <span className="font-semibold">
                                                        {Math.round(participantStats.averagePercent || 0)}%
                                                    </span>
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Puntos */}
                                <Card className="bg-white rounded-md">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-md font-normal">Puntos</CardTitle>
                                        <Award className="h-6 w-6 text-yellow-500" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {points.toLocaleString()}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            puntos acumulados
                                        </p>
                                        {myPosition && (
                                            <div className="border-t border-gray-100 pt-2 mt-2">
                                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                                    <TrendingUp className="h-3 w-3" />
                                                    Puesto #{myPosition} en el ranking
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Sección inferior */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                            {/* Actividades recientes */}
                            <Card className="col-span-5 bg-white rounded-md">
                                <CardHeader className="pb-3">
                                    <CardTitle>Mis actividades</CardTitle>
                                    <CardDescription className="text-sm">
                                        Últimas actividades completadas
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="max-h-[300px] overflow-y-auto">
                                    {showActivitiesSkeleton ? (
                                        <ListSkeleton rows={4} subtitle />
                                    ) : activities.length === 0 ? (
                                        <p className="text-sm text-muted-foreground text-center py-8">
                                            Aún no has completado actividades.
                                            <br />
                                            ¡Empieza ahora!
                                        </p>
                                    ) : (
                                        <ul className="space-y-3">
                                            {activities.map((a: any, i: number) => (
                                                <li
                                                    key={a._id || i}
                                                    className="flex items-center gap-3 border-b border-gray-100 pb-3 last:border-0"
                                                >
                                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">
                                                            {a.activity?.title || 'Actividad'}
                                                        </p>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            {a.completedAt && (
                                                                <span>
                                                                    {new Date(a.completedAt).toLocaleDateString(
                                                                        'es-CO',
                                                                        { day: '2-digit', month: 'short' }
                                                                    )}
                                                                </span>
                                                            )}
                                                            <span>🎯 {a.achievedScore}/{a.plannedScore}</span>
                                                            {a.activity?.emotion && (
                                                                <span>· 😊 {a.activity.emotion}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Badge
                                                        variant={
                                                            (a.achievedScore / a.plannedScore) >= 0.8
                                                                ? 'default'
                                                                : 'secondary'
                                                        }
                                                        className="text-xs flex-shrink-0"
                                                    >
                                                        {Math.round((a.achievedScore / a.plannedScore) * 100)}%
                                                    </Badge>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Ranking */}
                            <Card className="col-span-2 bg-white rounded-md">
                                <CardHeader className="pb-3">
                                    <CardTitle>Ranking</CardTitle>
                                    <CardDescription className="text-sm">
                                        Top participantes
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="max-h-[300px] overflow-y-auto">
                                    {showRankingSkeleton ? (
                                        <ListSkeleton rows={5} />
                                    ) : ranking.length === 0 ? (
                                        <p className="text-sm text-muted-foreground text-center py-8">
                                            Sin datos de ranking
                                        </p>
                                    ) : (
                                        <ul className="space-y-2">
                                            {ranking.map((p: any, i: number) => {
                                                const isMe =
                                                    p.participantId === participantId ||
                                                    p._id === participantId ||
                                                    p.nickname === nickname
                                                return (
                                                    <li
                                                        key={p.rank || i}
                                                        className={`flex items-center gap-2 p-2 rounded-md ${
                                                            isMe ? 'bg-blue-50 ring-1 ring-blue-200' : ''
                                                        }`}
                                                    >
                                                        <span className="text-xs font-bold text-gray-400 w-5 text-center flex-shrink-0">
                                                            {p.rank || i + 1}
                                                        </span>
                                                        <SafeAvatar
                                                            avatar={p.avatar}
                                                            name={p.nickname || 'Participante'}
                                                            className="w-7 h-7"
                                                            gradient="from-gray-300 to-gray-400"
                                                            ringHover=""
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium truncate">
                                                                {p.nickname || 'Participante'}
                                                            </p>
                                                        </div>
                                                        <span className="text-sm font-semibold text-blue-600 flex-shrink-0">
                                                            {p.points ?? 0}
                                                        </span>
                                                        {isMe && (
                                                            <Badge className="text-[10px] px-1.5 py-0 h-5 flex-shrink-0">
                                                                Tú
                                                            </Badge>
                                                        )}
                                                    </li>
                                                )
                                            })}
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

export default StudentDashboardComponent
