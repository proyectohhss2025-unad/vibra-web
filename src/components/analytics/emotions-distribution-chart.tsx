'use client'

import { useEffect, useState } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/registry/new-york/ui/card'
import { getEmotionDistribution } from '@/api/emotion'

const COLORS = [
  '#6b7280', '#ef4444', '#f59e0b', '#10b981', '#3b82f6',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1',
]

type Props = {
  startDate?: string
  endDate?: string
  courseId?: string
  className?: string
  onExpand?: () => void
  showExpander?: boolean
}

export default function EmotionsDistributionChart({
  startDate,
  endDate,
  courseId,
  className,
  onExpand,
  showExpander = true,
}: Props) {
  const [data, setData] = useState<{ name: string; value: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getEmotionDistribution(startDate, endDate, courseId)
      .then((result) => {
        setData(result.map((r) => ({ name: r.name, value: r.value })))
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [startDate, endDate, courseId])

  return (
    <Card className={`bg-white rounded-md ${className ?? ''}`}>
      <CardHeader>
        <CardTitle>
          <div className="flex items-center justify-between">
            <p>Distribución de Emociones</p>
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
          Emociones registradas en actividades
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
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {data.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
