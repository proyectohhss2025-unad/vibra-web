import { Card, CardContent, CardHeader, CardTitle } from '@/registry/new-york/ui/card';
import { useEffect, useState } from 'react';
import api from '@/api/axios-instance';

interface ParticipantData {
  nickname?: string;
  level?: string;
  points?: number;
  currentStreak?: number;
  maxStreak?: number;
  totalActivitiesCompleted?: number;
}

const LEVEL_EMOJIS: Record<string, string> = {
  bronce: '🥉',
  plata: '🥈',
  oro: '🥇',
  platino: '💎',
  diamante: '👑',
};

const LEVEL_THRESHOLDS = [
  { level: 'bronce', min: 0, max: 99, next: 'plata' },
  { level: 'plata', min: 100, max: 299, next: 'oro' },
  { level: 'oro', min: 300, max: 599, next: 'platino' },
  { level: 'platino', min: 600, max: 999, next: 'diamante' },
  { level: 'diamante', min: 1000, max: Infinity, next: null },
];

const ProfileParticipantSection = ({ userId }: { userId?: string }) => {
  const [data, setData] = useState<ParticipantData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    api
      .get(`/api/participants/by-user/${userId}`)
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return null;
  if (!data) return null;

  const threshold = LEVEL_THRESHOLDS.find((t) => t.level === data.level) ?? LEVEL_THRESHOLDS[0];
  const progress = threshold.max === Infinity
    ? 100
    : Math.min(100, ((data.points ?? 0) - threshold.min) / (threshold.max - threshold.min) * 100);

  return (
    <Card className="bg-white rounded-md mt-4">
      <CardHeader>
        <CardTitle>Progreso como Participante</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="flex flex-col items-center p-3 bg-blue-50 rounded-lg">
            <span className="text-3xl">{LEVEL_EMOJIS[data.level ?? 'bronce'] ?? '🥉'}</span>
            <span className="text-sm font-semibold mt-1 capitalize">{data.level ?? 'bronce'}</span>
            <span className="text-xs text-muted-foreground">Nivel</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-green-50 rounded-lg">
            <span className="text-2xl font-bold text-green-600">{data.points ?? 0}</span>
            <span className="text-xs text-muted-foreground mt-1">Puntos</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-amber-50 rounded-lg">
            <span className="text-2xl font-bold text-amber-600">{data.currentStreak ?? 0}</span>
            <span className="text-xs text-muted-foreground mt-1">Racha actual</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-purple-50 rounded-lg">
            <span className="text-2xl font-bold text-purple-600">{data.totalActivitiesCompleted ?? 0}</span>
            <span className="text-xs text-muted-foreground mt-1">Actividades</span>
          </div>
        </div>

        {threshold.next && (
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground capitalize">{data.level ?? 'bronce'}</span>
              <span className="text-muted-foreground">{Math.round(progress)}% al {threshold.next}</span>
            </div>
            <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileParticipantSection;
