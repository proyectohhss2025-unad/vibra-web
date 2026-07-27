/**
 * MyParticipations — historial de actividades completadas del estudiante.
 *
 * Muestra una lista paginada de las participaciones del estudiante
 * autenticado, con actividad, puntaje y fecha.
 */
'use client'

import { getParticipantActivityHistory } from "@/api/participant"
import { getSafeKeyObjectFromStorage } from "@/utils/safe-token-storage"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/registry/new-york/ui/card"
import { Badge } from "@/registry/new-york/ui/badge"
import { CheckCircle, ClipboardList, ChevronLeft, ChevronRight } from "lucide-react"
import { useEffect, useState } from "react"
import { ListSkeleton } from "../ui/list-skeleton"

const PAGE_SIZE = 10

const MyParticipations: React.FC = () => {
    const participant: any =
        JSON.parse(getSafeKeyObjectFromStorage('participantSelected') ?? 'null')
        ?? JSON.parse(getSafeKeyObjectFromStorage('participant') ?? 'null')
        ?? {}

    const participantId = participant?.participantId ?? participant?._id ?? ''
    const nickname = participant?.nickname ?? participant?.name ?? 'Estudiante'

    const [data, setData] = useState<any[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!participantId) {
            setLoading(false)
            return
        }
        setLoading(true)
        getParticipantActivityHistory(participantId, page, PAGE_SIZE)
            .then((result) => {
                setData(result?.data || [])
                setTotal(result?.total || 0)
            })
            .catch(() => {
                setData([])
                setTotal(0)
            })
            .finally(() => setLoading(false))
    }, [participantId, page])

    const totalPages = Math.ceil(total / PAGE_SIZE)

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <ClipboardList className="h-7 w-7 text-blue-600" />
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Mis participaciones</h2>
                    <p className="text-sm text-muted-foreground">
                        {nickname} · {total} actividad(es) completada(s)
                    </p>
                </div>
            </div>

            <Card className="bg-white rounded-md">
                <CardHeader className="pb-3">
                    <CardTitle>Historial de actividades</CardTitle>
                    <CardDescription>
                        Últimas actividades que has completado
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <ListSkeleton rows={5} subtitle />
                    ) : data.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            Aún no has completado actividades.
                        </p>
                    ) : (
                        <ul className="space-y-3">
                            {data.map((a: any, i: number) => (
                                <li
                                    key={a._id || i}
                                    className="flex items-center gap-3 border-b border-gray-100 pb-3 last:border-0"
                                >
                                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {a.activity?.title || 'Actividad'}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            {a.completedAt && (
                                                <span>
                                                    {new Date(a.completedAt).toLocaleDateString('es-CO', {
                                                        day: '2-digit',
                                                        month: 'long',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </span>
                                            )}
                                            {a.activity?.difficulty && (
                                                <>
                                                    <span>·</span>
                                                    <span>{'⭐'.repeat(a.activity.difficulty)}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <div className="text-sm font-semibold">
                                            {a.achievedScore}/{a.plannedScore}
                                        </div>
                                        <Badge
                                            variant={
                                                (a.achievedScore / a.plannedScore) >= 0.8
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                            className="text-xs"
                                        >
                                            {Math.round((a.achievedScore / a.plannedScore) * 100)}%
                                        </Badge>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Paginación */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                            <p className="text-xs text-muted-foreground">
                                Página {page} de {totalPages}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page <= 1}
                                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page >= totalPages}
                                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default MyParticipations
