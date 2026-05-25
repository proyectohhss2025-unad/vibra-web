'use client'

import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
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
import { getActivitiesByMonth } from '@/api/activity'

const MONTHS = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
]

type Props = {
  year?: number
  courseId?: string
  className?: string
  onExpand?: () => void
  showExpander?: boolean
}

export default function ActivitiesByMonthChart({
  year,
  courseId,
  className,
  onExpand,
  showExpander = true,
}: Props) {
  const [data, setData] = useState<{ month: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getActivitiesByMonth(year, courseId)
      .then((result) => {
        const mapped = result.map((r) => ({
          month: MONTHS[r.month - 1] || `M${r.month}`,
          count: r.count,
        }))
        setData(mapped)
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [year, courseId])

  return (
    <Card className={`bg-white rounded-md ${className ?? ''}`}>
      <CardHeader>
        <CardTitle>
          <div className="flex items-center justify-between">
            <p>Participación por mes</p>
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
          Actividades completadas por mes {year ? `en ${year}` : ''}
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
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" fill="#6b7280" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
