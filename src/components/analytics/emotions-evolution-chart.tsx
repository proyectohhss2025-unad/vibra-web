'use client'

import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/registry/new-york/ui/card'
import { getEmotionEvolution } from '@/api/emotion'

type Props = {
  days?: number
  startDate?: string
  endDate?: string
  courseId?: string
  className?: string
  onExpand?: () => void
  showExpander?: boolean
}

export default function EmotionsEvolutionChart({
  days = 30,
  startDate,
  endDate,
  courseId,
  className,
  onExpand,
  showExpander = true,
}: Props) {
  const [data, setData] = useState<{ date: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getEmotionEvolution(days, startDate, endDate, courseId)
      .then((result) => setData(result))
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [days, startDate, endDate, courseId])

  // Formatear fecha para mostrar día/mes
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00')
    return `${d.getDate()}/${d.getMonth() + 1}`
  }

  return (
    <Card className={`bg-white rounded-md ${className ?? ''}`}>
      <CardHeader>
        <CardTitle>
          <div className="flex items-center justify-between">
            <p>Evolución de Emociones</p>
            {showExpander && onExpand && (
              <button
                onClick={onExpand}
                className="h-5 w-5 text-gray-500 hover:text-gray-700 cursor-pointer"
                title="Expandir gráfica"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 3 21 3 21 9" />
                  <polyline points="9 21 3 21 3 15" />
                  <line x1="21" y1="3" x2="14" y2="10" />
                  <line x1="3" y1="21" x2="10" y2="14" />
                </svg>
              </button>
            )}
          </div>
        </CardTitle>
        <CardDescription className="text-sm">
          Registros emocionales en los últimos {days} días
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-64 text-gray-400">
            Cargando...
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-400">
            Sin datos disponibles
          </div>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  fontSize={11}
                  interval={Math.floor(data.length / 10)}
                />
                <YAxis fontSize={12} allowDecimals={false} />
                <Tooltip labelFormatter={(label) => formatDate(label)} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#6b7280"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
