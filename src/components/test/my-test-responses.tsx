/**
 * MyTestResponses — respuestas a tests del estudiante.
 *
 * Usa GET /api/pretests/search/user/:documentNumber (P-EST-006)
 * para mostrar el historial de tests completados por el estudiante
 * con puntaje, fecha y cantidad de respuestas.
 */
'use client'

import { getByUserId } from "@/api/preTest"
import { getSafeKeyObjectFromStorage } from "@/utils/safe-token-storage"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/registry/new-york/ui/card"
import { Badge } from "@/registry/new-york/ui/badge"
import { ClipboardList, FileText, CheckCircle, Clock, Eye } from "lucide-react"
import { useEffect, useState } from "react"
import { ListSkeleton } from "../ui/list-skeleton"
import TestDetailModal from "./test-detail-modal"

// Mapa de testId → nombre (enriquecido desde la colección tests)
const TEST_NAMES: Record<string, string> = {
    '1': 'Test de personalidad',
    '2': 'Test de tecnologia',
    '3': 'Test de cultura general',
}

const MyTestResponses: React.FC = () => {
    const user: any =
        JSON.parse(getSafeKeyObjectFromStorage('user') ?? 'null') ?? {}

    // Los pretests en MongoDB almacenan el _id (ObjectId) del usuario
    // como string en el campo userId. El user de localStorage puede
    // tener _id (si se guardó completo) o sub (del JWT).
    const userId = user?._id ?? user?.sub ?? user?.userId ?? ''
    const userName = user?.name ?? user?.username ?? 'Estudiante'

    const [pretests, setPretests] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedPretest, setSelectedPretest] = useState<any>(null)

    useEffect(() => {
        if (!userId) {
            setLoading(false)
            return
        }
        setLoading(true)
        getByUserId(userId)
            .then((data) => {
                setPretests(data || [])
            })
            .catch(() => setPretests([]))
            .finally(() => setLoading(false))
    }, [userId])

    const getTestName = (testId: string) => {
        return TEST_NAMES[testId] || `Test #${testId}`
    }

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <ClipboardList className="h-7 w-7 text-blue-600" />
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Mis respuestas</h2>
                    <p className="text-sm text-muted-foreground">
                        {userName} · {pretests.length} respuesta(s) registrada(s)
                    </p>
                </div>
            </div>

            <Card className="bg-white rounded-md">
                <CardHeader className="pb-3">
                    <CardTitle>Historial de tests</CardTitle>
                    <CardDescription>
                        Tests que has completado con sus puntajes y fechas
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <ListSkeleton rows={4} subtitle />
                    ) : pretests.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            Aún no has respondido ningún test.
                        </p>
                    ) : (
                        <ul className="space-y-3">
                            {pretests.map((p: any, i: number) => {
                                const fecha = p.createdAt
                                    ? new Date(p.createdAt).toLocaleDateString('es-CO', {
                                          day: '2-digit',
                                          month: 'long',
                                          year: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit',
                                      })
                                    : '—'
                                return (
                                    <li
                                        key={p._id || i}
                                        className="flex items-center gap-3 border-b border-gray-100 pb-3 last:border-0"
                                    >
                                        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                                            <FileText className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                {getTestName(p.testId)}
                                            </p>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                                <span className="flex items-center gap-1">
                                                    <CheckCircle className="h-3 w-3" />
                                                    {p.responses?.length || 0} respuesta(s)
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {fecha}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <button
                                                onClick={() => setSelectedPretest(p)}
                                                className="text-blue-600 hover:text-blue-800 transition-colors"
                                                title="Ver detalle"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            <Badge
                                                variant={p.totalScore > 0 ? 'default' : 'secondary'}
                                                className="text-xs"
                                            >
                                                {p.totalScore ?? 0} pts
                                            </Badge>
                                        </div>
                                    </li>
                                )
                            })}
                        </ul>
                    )}
                </CardContent>
            </Card>

            {/* Modal de detalle */}
            {selectedPretest && (
                <TestDetailModal
                    pretest={selectedPretest}
                    testName={getTestName(selectedPretest.testId)}
                    onClose={() => setSelectedPretest(null)}
                />
            )}
        </div>
    )
}

export default MyTestResponses
