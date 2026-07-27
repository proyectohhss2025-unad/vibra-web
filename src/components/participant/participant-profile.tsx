'use client';

import { getParticipantStats } from '@/api/participant';
import { LOCALE } from '@/utils/constants';
import { useEffect, useState } from 'react';
import SafeAvatar from '../ui/safe-avatar';

interface Props {
  participantId: string;
  nickname: string;
  avatar?: string;
  level?: string;
  points?: number;
  currentStreak?: number;
  maxStreak?: number;
  totalActivitiesCompleted?: number;
  course?: { _id: string; name: string } | null;
  lastParticipation?: {
    completedAt: string;
    activityTitle: string | null;
    achievedScore: number;
    plannedScore: number;
  } | null;
}

const LEVEL_COLORS: Record<string, string> = {
  bronce: 'bg-amber-700 text-white',
  plata: 'bg-gray-400 text-white',
  oro: 'bg-yellow-500 text-white',
  platino: 'bg-blue-300 text-white',
  diamante: 'bg-cyan-500 text-white',
};

const LEVEL_ICONS: Record<string, string> = {
  bronce: '🟤',
  plata: '⚪',
  oro: '🟡',
  platino: '🔵',
  diamante: '💎',
};

const ParticipantProfile: React.FC<Props> = ({
  participantId,
  nickname,
  avatar,
  level,
  points,
  currentStreak,
  maxStreak,
  totalActivitiesCompleted,
  course,
  lastParticipation,
}) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!participantId) return;
    setLoading(true);
    getParticipantStats(participantId)
      .then((data) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [participantId]);

  const levelColor = level ? LEVEL_COLORS[level.toLowerCase()] || 'bg-gray-100 text-gray-700' : 'bg-gray-100 text-gray-700';
  const levelIcon = level ? LEVEL_ICONS[level.toLowerCase()] || '' : '';

  const formatTimeSpent = (seconds?: number) => {
    if (!seconds) return '—';
    if (seconds < 60) return `${seconds}s`;
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}m ${sec}s`;
  };

  const recentActivities = stats?.activities?.slice(0, 10) || [];

  return (
    <div className="space-y-6 p-4 max-w-3xl mx-auto">
      {/* ─── Cabecera ─── */}
      <div className="flex items-center gap-5 bg-white rounded-xl p-6 shadow-sm border">
        <SafeAvatar
          avatar={avatar}
          name={nickname || 'Participante'}
          className="w-20 h-20"
          gradient="from-blue-400 to-purple-500"
          ringHover=""
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl font-bold text-gray-800 truncate">
              {nickname || 'Participante'}
            </h2>
            {level && (
              <span className={`uppercase text-[11px] font-bold px-2.5 py-1 rounded-full ${levelColor}`}>
                {levelIcon} {level}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
            <span className="font-semibold text-blue-600">{points ?? 0} pts</span>
            {course?.name && (
              <>
                <span className="text-gray-300">·</span>
                <span>📚 {course.name}</span>
              </>
            )}
            {stats?.rankingPosition ? (
              <>
                <span className="text-gray-300">·</span>
                <span>🏅 #{stats.rankingPosition} en ranking</span>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* ─── Tarjetas de estadísticas ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        <div className="bg-white rounded-lg p-4 shadow-sm border text-center">
          <p className="text-2xl font-bold text-gray-800">{totalActivitiesCompleted ?? 0}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">🏆 Actividades</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border text-center">
          <p className="text-2xl font-bold text-blue-600">{points ?? 0}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">📊 Puntos</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border text-center">
          <p className="text-2xl font-bold text-orange-500">
            {currentStreak ?? 0}
            {maxStreak ? <span className="text-sm text-gray-400 font-normal"> / {maxStreak}</span> : null}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">🔥 Racha</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border text-center">
          <p className="text-2xl font-bold text-green-600">
            {stats?.averagePercent ? `${stats.averagePercent}%` : '—'}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">📈 Promedio</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border text-center">
          <p className="text-2xl font-bold text-purple-600">
            {stats?.totalParticipations ?? 0}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">🔄 Participaciones</p>
        </div>
      </div>

      {/* ─── Última participación (destacada) ─── */}
      {lastParticipation && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-5 border border-blue-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            ⚡ Última participación
          </p>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">📍</span>
              <span className="font-semibold text-gray-800">
                {lastParticipation.activityTitle || 'Actividad completada'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="font-semibold text-blue-600">
                🎯 {lastParticipation.achievedScore}/{lastParticipation.plannedScore}
              </span>
              {lastParticipation.completedAt && (
                <span className="text-muted-foreground">
                  {new Date(lastParticipation.completedAt).toLocaleDateString(LOCALE, {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Últimas actividades ─── */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">
            📋 Últimas actividades
            {stats?.activities && (
              <span className="text-muted-foreground font-normal ml-1">
                ({stats.activities.length} registradas)
              </span>
            )}
          </h3>
        </div>
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Cargando historial...
          </div>
        ) : recentActivities.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Sin actividades registradas aún
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentActivities.map((a: any, i: number) => (
              <div
                key={a.completionId || i}
                className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    a.percent >= 80 ? 'bg-green-500' : a.percent >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {a.activityTitle || 'Actividad'}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(a.completedAt).toLocaleDateString(LOCALE, {
                        day: '2-digit',
                        month: 'short',
                      })}
                      {a.timeSpent ? ` · ⏱ ${formatTimeSpent(a.timeSpent)}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs font-medium text-gray-500">
                    🎯 {a.achievedScore}/{a.plannedScore}
                  </span>
                  <span className={`text-xs font-semibold min-w-[3rem] text-right ${
                    a.percent >= 80 ? 'text-green-600' : a.percent >= 50 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {a.percent}%
                  </span>
                  {a.gamesCompleted?.length > 0 && (
                    <span className="text-[10px] text-gray-400" title="Juegos completados">
                      🎮 {a.gamesCompleted.length}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantProfile;
