'use client'

import { useContext, useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/registry/new-york/ui/card'
import { useTabs } from '@/services/contexts/tabs-context'
import { useFilter } from '@/services/contexts/filter-context'
import { getCountAllActivities } from '@/api/activity'
import { getCountAllParticipants } from '@/api/participant'
import { getEmotionDistribution } from '@/api/emotion'
import { getCourseProgress } from '@/api/course'

import ActivitiesByMonthChart from './activities-by-month-chart'
import EmotionsDistributionChart from './emotions-distribution-chart'
import EmotionsEvolutionChart from './emotions-evolution-chart'
import CourseProgressChart from './course-progress-chart'
import ParticipantRankingChart from './participant-ranking-chart'
import CourseSelector from './course-selector'

export default function AnalyticsDashboard() {
  const { openTab } = useTabs()
  const { yearFilter, dateInitFilter, dateEndFilter } = useFilter()
  const [courseId, setCourseId] = useState('')

  const startDateStr = dateInitFilter instanceof Date
    ? dateInitFilter.toISOString()
    : undefined
  const endDateStr = dateEndFilter instanceof Date
    ? dateEndFilter.toISOString()
    : undefined

  // Cards de tendencia
  const [totalActivities, setTotalActivities] = useState<number>(0)
  const [totalParticipants, setTotalParticipants] = useState<number>(0)
  const [totalEmotions, setTotalEmotions] = useState<number>(0)
  const [totalCourses, setTotalCourses] = useState<number>(0)

  useEffect(() => {
    getCountAllActivities().then((data) => {
      if (data) setTotalActivities(data.count ?? 0)
    })
    getCountAllParticipants().then((data) => {
      if (data) setTotalParticipants(data.count ?? 0)
    })
    getEmotionDistribution(startDateStr, endDateStr, courseId).then((data) => {
      if (Array.isArray(data)) {
        setTotalEmotions(data.reduce((sum, e) => sum + e.value, 0))
      }
    })
    getCourseProgress().then((data) => {
      if (Array.isArray(data)) setTotalCourses(data.length)
    })
  }, [yearFilter, startDateStr, endDateStr, courseId])

  const expandChart = (title: string, component: React.ReactNode) => {
    openTab(`/Grafica/${title}`, title, component)
  }

  return (
    <div className="space-y-4">
      {/* ─── Fila de filtros ─── */}
      <div className="flex items-center gap-4 flex-wrap">
        <label className="text-sm font-medium text-gray-600">Curso:</label>
        <CourseSelector value={courseId} onChange={setCourseId} />
      </div>

      {/* ─── Cards de tendencia (fila superior) ─── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white rounded-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Actividades
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 text-gray-500"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActivities}</div>
            <p className="text-xs text-muted-foreground">Total registradas</p>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Participantes
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 text-gray-500"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalParticipants}</div>
            <p className="text-xs text-muted-foreground">Registrados</p>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Registros Emocionales
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 text-gray-500"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmotions}</div>
            <p className="text-xs text-muted-foreground">En actividades</p>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Cursos Activos
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 text-gray-500"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCourses}</div>
            <p className="text-xs text-muted-foreground">En el período</p>
          </CardContent>
        </Card>
      </div>

      {/* ─── Gráficas principales ─── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {/* Fila 1: Participación por mes + Distribución emociones */}
        <ActivitiesByMonthChart
          year={yearFilter}
          courseId={courseId}
          onExpand={() =>
            expandChart(
              'Participación por Mes',
              <ActivitiesByMonthChart
                year={yearFilter}
                courseId={courseId}
                showExpander={false}
              />
            )
          }
        />
        <EmotionsDistributionChart
          startDate={startDateStr}
          endDate={endDateStr}
          courseId={courseId}
          onExpand={() =>
            expandChart(
              'Distribución de Emociones',
              <EmotionsDistributionChart
                startDate={startDateStr}
                endDate={endDateStr}
                courseId={courseId}
                showExpander={false}
              />
            )
          }
        />

        {/* Fila 2: Progreso por curso + Top participantes */}
        <CourseProgressChart
          onExpand={() =>
            expandChart(
              'Progreso por Curso',
              <CourseProgressChart showExpander={false} />
            )
          }
        />
        <ParticipantRankingChart
          courseId={courseId}
          onExpand={() =>
            expandChart(
              'Top Participantes',
              <ParticipantRankingChart courseId={courseId} showExpander={false} />
            )
          }
        />

        {/* Fila 3: Evolución emociones (ocupa 2 columnas) */}
        <div className="col-span-1 lg:col-span-2">
          <EmotionsEvolutionChart
            startDate={startDateStr}
            endDate={endDateStr}
            courseId={courseId}
            onExpand={() =>
              expandChart(
                'Evolución de Emociones',
                <EmotionsEvolutionChart
                  startDate={startDateStr}
                  endDate={endDateStr}
                  courseId={courseId}
                  showExpander={false}
                />
              )
            }
          />
        </div>
      </div>
    </div>
  )
}
