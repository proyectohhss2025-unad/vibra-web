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
  Cell,
} from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/registry/new-york/ui/card'
import { getCourseProgress } from '@/api/course'

const PROGRESS_COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6']

type Props = {
  className?: string
  onExpand?: () => void
  showExpander?: boolean
}

export default function CourseProgressChart({
  className,
  onExpand,
  showExpander = true,
}: Props) {
  const [data, setData] = useState<
    { courseName: string; progressPercent: number; total: number; active: number }[]
  >([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getCourseProgress()
      .then((result) => {
        const mapped = result.map((r) => ({
          courseName: r.courseName,
          progressPercent: r.progressPercent,
          total: r.totalParticipants,
          active: r.activeParticipants,
        }))
        setData(mapped)
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Card className={`bg-white rounded-md ${className ?? ''}`}>
      <CardHeader>
        <CardTitle>
          <div className="flex items-center justify-between">
            <p>Progreso por Curso</p>
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
          % de participantes que han completado al menos una actividad
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
              <BarChart
                data={data}
                layout="vertical"
                margin={{ left: 20, right: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} fontSize={12} unit="%" />
                <YAxis
                  type="category"
                  dataKey="courseName"
                  width={140}
                  fontSize={11}
                />
                <Tooltip
                  formatter={(value: number) => [`${value}%`, 'Progreso']}
                />
                <Bar dataKey="progressPercent" radius={[0, 4, 4, 0]} barSize={20}>
                  {data.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PROGRESS_COLORS[index % PROGRESS_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
