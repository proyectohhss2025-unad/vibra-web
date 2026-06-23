'use client';

import React, { useEffect, useState } from 'react';
import { getUserProfile } from '@/api/reports';
import CurrentDateTime from '@/components/utils/current-datetime';
import { Avatar, AvatarFallback } from '@/registry/new-york/ui/avatar';
import { Loader2, MedalIcon, ClockIcon, StarIcon, ActivityIcon, TrendingUpIcon } from 'lucide-react';

interface UserProfile {
    user: {
        _id: string;
        name: string;
        email: string;
        documentNumber: string;
        avatar?: string;
    };
    participant: {
        nickname: string;
        points: number;
        level: string;
        currentStreak: number;
        maxStreak: number;
        totalActivitiesCompleted: number;
        lastActivityDate?: string;
    };
    stats: {
        avgScore: number;
        totalScore: number;
        totalTimeMinutes: number;
        totalResponses: number;
    };
    recentActivity: {
        activityTitle: string;
        score: number;
        date: string;
    }[];
}

interface UserProfilePageProps {
    userId: string;
    userName?: string;
}

const levelColors: Record<string, string> = {
    bronce: 'text-amber-700 bg-amber-50 border-amber-200',
    plata: 'text-gray-600 bg-gray-100 border-gray-200',
    oro: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    platino: 'text-cyan-600 bg-cyan-50 border-cyan-200',
    diamante: 'text-purple-600 bg-purple-50 border-purple-200',
};

const UserProfilePage: React.FC<UserProfilePageProps> = ({ userId, userName }) => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        setError('');
        getUserProfile(userId)
            .then(setProfile)
            .catch((err) => {
                console.error(err);
                setError('No se pudo cargar el perfil del usuario');
            })
            .finally(() => setLoading(false));
    }, [userId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
                {error || 'Perfil no disponible'}
            </div>
        );
    }

    const { user, participant, stats, recentActivity } = profile;
    const levelClass = levelColors[participant.level?.toLowerCase()] || 'text-gray-500 bg-gray-50 border-gray-200';

    return (
        <div className="p-4 md:p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">{userName || user.name}</h1>
                <div className="bg-white rounded-md px-2 py-1">
                    <CurrentDateTime />
                </div>
            </div>

            {/* Info del usuario + participante */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Card: Usuario */}
                <div className="bg-white rounded-lg border border-gray-200 p-5 col-span-1">
                    <div className="flex items-center gap-3 mb-4">
                        <Avatar className="h-14 w-14">
                            <AvatarFallback className="bg-blue-100 text-blue-600 text-xl font-bold">
                                {user.name?.charAt(0)?.toUpperCase() || '?'}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="text-lg font-semibold text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-400">{user.email}</div>
                            <div className="text-xs text-gray-400">Doc: {user.documentNumber || '—'}</div>
                        </div>
                    </div>
                    <div className="text-xs text-gray-400">
                        ID: {user._id.slice(-8)}
                    </div>
                </div>

                {/* Card: Participante */}
                <div className="bg-white rounded-lg border border-gray-200 p-5 col-span-1">
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Participante</h3>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Apodo</span>
                            <span className="text-sm font-medium">{participant.nickname}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Nivel</span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${levelClass}`}>
                                <MedalIcon className="h-3 w-3" />
                                {participant.level}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Puntos</span>
                            <span className="text-sm font-semibold text-blue-600">{participant.points}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Racha actual</span>
                            <span className={`text-sm font-semibold ${participant.currentStreak >= 5 ? 'text-green-600' : 'text-gray-500'}`}>
                                {participant.currentStreak > 0 ? `🔥 ${participant.currentStreak}` : '—'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Mejor racha</span>
                            <span className="text-sm font-semibold">{participant.maxStreak > 0 ? `🔥 ${participant.maxStreak}` : '—'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Última actividad</span>
                            <span className="text-sm text-gray-600">{participant.lastActivityDate ? new Date(participant.lastActivityDate).toLocaleDateString('es-CO') : '—'}</span>
                        </div>
                    </div>
                </div>

                {/* Card: Estadísticas */}
                <div className="bg-white rounded-lg border border-gray-200 p-5 col-span-1">
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Estadísticas</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-50 rounded-lg p-3 text-center">
                            <ActivityIcon className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                            <div className="text-xl font-bold text-blue-700">{stats.totalResponses}</div>
                            <div className="text-xs text-blue-500">Actividades</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3 text-center">
                            <StarIcon className="h-5 w-5 text-green-500 mx-auto mb-1" />
                            <div className="text-xl font-bold text-green-700">{stats.avgScore}</div>
                            <div className="text-xs text-green-500">Promedio</div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-3 text-center">
                            <TrendingUpIcon className="h-5 w-5 text-purple-500 mx-auto mb-1" />
                            <div className="text-xl font-bold text-purple-700">{stats.totalScore}</div>
                            <div className="text-xs text-purple-500">Puntos total</div>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-3 text-center">
                            <ClockIcon className="h-5 w-5 text-orange-500 mx-auto mb-1" />
                            <div className="text-xl font-bold text-orange-700">{stats.totalTimeMinutes}</div>
                            <div className="text-xs text-orange-500">Minutos total</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actividad Reciente */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
                {recentActivity.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">
                        Sin actividad registrada
                    </div>
                ) : (
                    <div className="space-y-2">
                        {recentActivity.map((act, i) => (
                            <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 border-b border-gray-100 last:border-0">
                                <div className="flex items-center gap-3 min-w-0">
                                    <Avatar className={`h-8 w-8 ${
                                        act.score >= 60 ? 'bg-green-100' :
                                        act.score >= 30 ? 'bg-yellow-100' :
                                        'bg-red-100'
                                    }`}>
                                        <AvatarFallback className={`text-xs font-bold ${
                                            act.score >= 60 ? 'text-green-700' :
                                            act.score >= 30 ? 'text-yellow-700' :
                                            'text-red-700'
                                        }`}>
                                            {act.score}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <div className="text-sm font-medium text-gray-900 truncate max-w-[300px]">
                                            {act.activityTitle}
                                        </div>
                                        <div className="text-xs text-gray-400">{act.date}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserProfilePage;
