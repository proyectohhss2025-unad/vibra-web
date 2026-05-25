'use client'

import { useEffect, useState, useContext } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/registry/new-york/ui/card'
import { Badge } from '@/registry/new-york/ui/badge'
import { AuthContext } from '@/services/auth'
import { config } from '@/config/config'

const environment = process.env.NODE_ENV || 'development'
const baseURL = config[environment].apiDashboard

interface LeaderboardEntry {
  userId: { _id: string; nickname?: string; avatar?: string }
  points: number
  level: string
  nickname?: string
  avatar?: string
}

type Props = {
  courseId?: string
  className?: string
  onExpand?: () => void
  showExpander?: boolean
}

const LEVEL_COLORS: Record<string, string> = {
  bronce: '#cd7f32',
  plata: '#a0a0a0',
  oro: '#ffd700',
  platino: '#e5e4e2',
  diamante: '#b9f2ff',
}

const LEVEL_ORDER: Record<string, number> = {
  bronce: 1,
  plata: 2,
  oro: 3,
  platino: 4,
  diamante: 5,
}

export default function ParticipantRankingChart({
  courseId,
  className,
  onExpand,
  showExpander = true,
}: Props) {
  const [data, setData] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const { token } = useContext(AuthContext)

  useEffect(() => {
    if (!token) return
    setLoading(true)
    let url = `${baseURL}/api/participants/leaderboard?limit=10`
    if (courseId) url += `&courseId=${courseId}`
    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((result) => {
        const entries = Array.isArray(result) ? result : []
        // Ordenar por puntos descendente
        entries.sort((a, b) => b.points - a.points)
        setData(entries)
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [token, courseId])

  const getLevelBadge = (level: string) => {
    const color = LEVEL_COLORS[level] || '#6b7280'
    return (
      <span
        className="inline-block px-2 py-0.5 rounded text-xs font-semibold text-white"
        style={{ backgroundColor: color }}
      >
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </span>
    )
  }

  return (
    <Card className={`bg-white rounded-md ${className ?? ''}`}>
      <CardHeader>
        <CardTitle>
          <div className="flex items-center justify-between">
            <p>Top Participantes</p>
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
          Ranking de participantes por puntaje total
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
          <div className="space-y-3">
            {data.map((entry, index) => {
              const nickname =
                entry.nickname || entry.userId?.nickname || 'Participante'
              const avatar = entry.avatar || entry.userId?.avatar
              const level = entry.level || 'bronce'
              const isTop3 = index < 3

              return (
                <div
                  key={index}
                  className={`flex items-center justify-between p-2 rounded-lg ${
                    isTop3 ? 'bg-gray-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Posición */}
                    <span
                      className={`font-bold text-sm w-6 text-center ${
                        index === 0
                          ? 'text-yellow-500'
                          : index === 1
                          ? 'text-gray-400'
                          : index === 2
                          ? 'text-amber-600'
                          : 'text-gray-500'
                      }`}
                    >
                      #{index + 1}
                    </span>

                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {avatar ? (
                        <img
                          src={avatar}
                          alt={nickname}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-500 text-xs font-bold">
                          {nickname.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Nombre */}
                    <div>
                      <p className="text-sm font-medium">{nickname}</p>
                      {getLevelBadge(level)}
                    </div>
                  </div>

                  {/* Puntos */}
                  <div className="text-right">
                    <p className="text-sm font-bold">{entry.points}</p>
                    <p className="text-xs text-gray-400">pts</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
