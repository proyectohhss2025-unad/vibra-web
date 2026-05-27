'use client';

import { create, getById, update, CreateParticipantPayload, UpdateParticipantPayload } from '@/api/participant';
import { useTabs } from '@/services/contexts/tabs-context';
import FormPageLayout from '@/components/ui/form-page-layout';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type Props = {
    participantId?: string;
}

const ParticipantComponent: React.FC<Props> = ({ participantId }) => {
    const router = useRouter();
    const { closeTab, closeTabWithRefresh } = useTabs();

    const queryId = Array.isArray(router.query._id) ? router.query._id[0] : router.query._id;
    const resolvedId = String(participantId ?? queryId ?? '');
    const currentTabId = resolvedId ? `/Participante/${resolvedId}` : '/Participante/new';
    const isEditing = !!(resolvedId && resolvedId !== 'undefined' && resolvedId !== 'null');

    const [participantID, setParticipantID] = useState('');
    const [nickname, setNickname] = useState('');
    const [avatar, setAvatar] = useState('');
    const [currentCourse, setCurrentCourse] = useState('');
    const [points, setPoints] = useState(0);
    const [level, setLevel] = useState('bronce');
    const [currentStreak, setCurrentStreak] = useState(0);
    const [isActive, setIsActive] = useState(true);
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const getData = async () => {
            if (!isEditing) return;
            try {
                const response: any = await getById(resolvedId);
                if (response?._id) {
                    setParticipantID(resolvedId);
                    setNickname(response?.nickname ?? response?.name ?? '');
                    setAvatar(response?.avatar ?? '');
                    setCurrentCourse(response?.currentCourse ?? '');
                    setPoints(response?.points ?? 0);
                    setLevel(response?.level ?? 'bronce');
                    setCurrentStreak(response?.currentStreak ?? 0);
                    setIsActive(response?.isActive ?? true);
                }
            } catch (error: any) {
                toast.error(error.message || 'Error al cargar participante');
            }
        };
        if (isEditing) getData();
    }, [isEditing, resolvedId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nickname.trim()) {
            toast.warning('El nickname es obligatorio');
            return;
        }
        setIsSubmitting(true);

        try {
            if (isEditing) {
                const payload: UpdateParticipantPayload = {
                    _id: participantID,
                    nickname: nickname.trim(),
                    avatar: avatar.trim() || undefined,
                    currentCourse: currentCourse.trim() || undefined,
                    isActive,
                };
                await update(payload);
                setSuccess('Participante actualizado exitosamente');
            } else {
                // Solo se pueden crear participantes desde la app mobile (auto-registro)
                toast.error('Los participantes se crean automáticamente desde la app móvil');
            }

            setTimeout(() => closeTabWithRefresh(currentTabId, true), 1500);
        } catch (error: any) {
            toast.error(error.message || 'Error al guardar el participante');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
                        <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">¡Operación exitosa!</h3>
                    <p className="text-sm text-gray-500">{success}</p>
                </div>
            </div>
        );
    }

    const handleCancel = () => {
        closeTab(currentTabId);
    };

    return (
        <FormPageLayout
            title={isEditing ? 'Editar Participante' : 'Nuevo Participante'}
            isEditing={isEditing}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
        >
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Información del Participante</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nickname *</label>
                        <input className="w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm"
                            value={nickname} onChange={(e) => setNickname(e.target.value)}
                            disabled={!isEditing} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Avatar (URL)</label>
                        <input className="w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm"
                            value={avatar} onChange={(e) => setAvatar(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Curso</label>
                        <input className="w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm"
                            value={currentCourse} onChange={(e) => setCurrentCourse(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                        <select className="w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm"
                            value={isActive ? 'active' : 'inactive'}
                            onChange={(e) => setIsActive(e.target.value === 'active')}>
                            <option value="active">Activo</option>
                            <option value="inactive">Inactivo</option>
                        </select>
                    </div>
                </div>

                {isEditing && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <h3 className="text-md font-semibold text-gray-600 mb-3">Progreso (solo lectura)</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-indigo-50 rounded-lg p-3 text-center">
                                <div className="text-2xl font-bold text-indigo-600">{points}</div>
                                <div className="text-xs text-gray-500">Puntos</div>
                            </div>
                            <div className="bg-green-50 rounded-lg p-3 text-center">
                                <div className="text-2xl font-bold text-green-600 capitalize">{level}</div>
                                <div className="text-xs text-gray-500">Nivel</div>
                            </div>
                            <div className="bg-yellow-50 rounded-lg p-3 text-center">
                                <div className="text-2xl font-bold text-yellow-600">{currentStreak}</div>
                                <div className="text-xs text-gray-500">Racha (días)</div>
                            </div>
                            <div className="bg-blue-50 rounded-lg p-3 text-center">
                                <div className="text-2xl font-bold text-blue-600">{currentCourse || '-'}</div>
                                <div className="text-xs text-gray-500">Curso</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {!isEditing && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
                    Los participantes se crean automáticamente cuando un usuario se registra e inicia sesión desde la aplicación móvil.
                    Este panel permite únicamente la edición de participantes existentes.
                </div>
            )}
        </FormPageLayout>
    );
};

export default ParticipantComponent;
