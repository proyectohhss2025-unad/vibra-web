'use client';

import { create, update, getById, CreateEmotionPayload } from '@/api/emotion';
import { AuthContext } from '@/services/auth';
import { useTabs } from '@/services/contexts/tabs-context';
import { PlusCircleIcon } from '@heroicons/react/outline';
import { SaveIcon, XCircleIcon } from 'lucide-react';
import { CheckCircleIcon } from '@heroicons/react/solid';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import Loading from '../layouts/loading/loading';
import '../test/test.css';

type EmotionComponentProps = {
    emotionId?: string;
};

const CATEGORIES = ['Positiva', 'Negativa', 'Neutra', 'Basica', 'Compleja'];

const EmotionComponent: React.FC<EmotionComponentProps> = ({ emotionId }) => {
    const { token } = useContext(AuthContext);
    const router = useRouter();
    const { closeTab, closeTabWithRefresh } = useTabs();

    const queryEmotionId = Array.isArray(router.query._id) ? router.query._id[0] : router.query._id;
    const resolvedEmotionId = String(emotionId ?? queryEmotionId ?? '');
    const currentTabId = resolvedEmotionId ? `/Emocion/${resolvedEmotionId}` : '/Emocion/new';
    const isEditing = !!(resolvedEmotionId && resolvedEmotionId !== 'undefined' && resolvedEmotionId !== 'null');

    const [emotionName, setEmotionName] = useState('');
    const [emotionDescription, setEmotionDescription] = useState('');
    const [emotionOrientationNote, setEmotionOrientationNote] = useState('');
    const [emotionIcono, setEmotionIcono] = useState('');
    const [emotionPercentNote, setEmotionPercentNote] = useState(0);
    const [emotionCategory, setEmotionCategory] = useState('');
    const [emotionIntensity, setEmotionIntensity] = useState(5);
    const [emotionID, setEmotionID] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!token) router.push('/layout');
    }, [token, router]);

    useEffect(() => {
        const getDataEmotion = async () => {
            setIsLoading(true);
            try {
                const res: any = await getById(resolvedEmotionId);
                if (res?._id) {
                    setEmotionName(res.name ?? '');
                    setEmotionDescription(res.description ?? '');
                    setEmotionOrientationNote(res.orientationNote ?? '');
                    setEmotionIcono(res.icono ?? '');
                    setEmotionPercentNote(res.percentNote ?? 0);
                    setEmotionCategory(res.category ?? '');
                    setEmotionIntensity(res.intensity ?? 5);
                }
            } catch (err: any) {
                toast.error(err.message || 'Error al cargar la emoción');
            } finally {
                setIsLoading(false);
            }
        };

        setEmotionID(resolvedEmotionId);
        if (isEditing) {
            getDataEmotion();
        }
    }, [resolvedEmotionId, isEditing]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!emotionName.trim()) {
            toast.warning('El nombre es obligatorio');
            return;
        }
        if (!emotionCategory) {
            toast.warning('La categoría es obligatoria');
            return;
        }

        setIsSubmitting(true);

        try {
            const payload: CreateEmotionPayload = {
                id: isEditing ? undefined : emotionName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                name: emotionName.trim(),
                description: emotionDescription?.trim() || undefined,
                orientationNote: emotionOrientationNote?.trim() || undefined,
                icono: emotionIcono?.trim() || '😊',
                percentNote: emotionPercentNote || 0,
                category: emotionCategory as CreateEmotionPayload['category'],
                intensity: emotionIntensity || undefined,
            };

            if (isEditing) {
                await update(emotionID, payload);
                setSuccess('Emoción actualizada exitosamente');
            } else {
                await create(payload);
                setSuccess('Emoción creada exitosamente');
            }
            setTimeout(() => closeTabWithRefresh(currentTabId, true), 1500);
        } catch (err: any) {
            toast.error(err.message || 'Error al guardar la emoción');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        closeTab(currentTabId);
    };

    const handleBackToList = () => {
        closeTabWithRefresh(currentTabId, true);
    };

    const handleClean = () => {
        setSuccess('');
        setEmotionName('');
        setEmotionDescription('');
        setEmotionCategory('');
        setEmotionIntensity(5);
        setEmotionID('');
        setEmotionOrientationNote('');
        setEmotionIcono('');
        setEmotionPercentNote(0);
        window.scrollTo(0, 0);
    };

    if (isLoading) return <Loading />;

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

    return (
        <div className="test-container container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">
                {isEditing ? 'Editar Emoción' : 'Nueva Emoción'}
            </h1>

            <form onSubmit={handleSubmit}>
                <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">Información General</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="emotionName" className="block text-sm font-medium text-gray-700 mb-1">
                                Nombre *
                            </label>
                            <input type="text" id="emotionName" value={emotionName}
                                onChange={e => setEmotionName(e.target.value)}
                                className="w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm"
                                placeholder="ej: Felicidad" />
                        </div>

                        <div>
                            <label htmlFor="emotionCategory" className="block text-sm font-medium text-gray-700 mb-1">
                                Categoría *
                            </label>
                            <select id="emotionCategory" value={emotionCategory}
                                onChange={e => setEmotionCategory(e.target.value)}
                                className="w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm">
                                <option value="">Seleccione una categoría</option>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="emotionIntensity" className="block text-sm font-medium text-gray-700 mb-1">
                                Intensidad (1-10)
                            </label>
                            <input type="number" id="emotionIntensity" min={1} max={10} value={emotionIntensity}
                                onChange={e => setEmotionIntensity(parseInt(e.target.value) || 1)}
                                className="w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm" />
                        </div>

                        <div>
                            <label htmlFor="emotionIcono" className="block text-sm font-medium text-gray-700 mb-1">
                                Icono
                            </label>
                            <input type="text" id="emotionIcono" value={emotionIcono}
                                onChange={e => setEmotionIcono(e.target.value)}
                                className="w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm"
                                placeholder="😊" />
                        </div>

                        <div className="md:col-span-2">
                            <label htmlFor="emotionDescription" className="block text-sm font-medium text-gray-700 mb-1">
                                Descripción
                            </label>
                            <textarea rows={2} id="emotionDescription" value={emotionDescription}
                                onChange={e => setEmotionDescription(e.target.value)}
                                className="w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm" />
                        </div>

                        <div className="md:col-span-2">
                            <label htmlFor="emotionOrientationNote" className="block text-sm font-medium text-gray-700 mb-1">
                                Nota de orientación
                            </label>
                            <textarea rows={2} id="emotionOrientationNote" value={emotionOrientationNote}
                                onChange={e => setEmotionOrientationNote(e.target.value)}
                                className="w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm"
                                placeholder="Enfócate en mantener y compartir este sentimiento..." />
                        </div>

                        <div>
                            <label htmlFor="emotionPercentNote" className="block text-sm font-medium text-gray-700 mb-1">
                                % Nota
                            </label>
                            <input type="number" id="emotionPercentNote" min={0} max={100} value={emotionPercentNote}
                                onChange={e => setEmotionPercentNote(Number(e.target.value))}
                                className="w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm" />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                    <button type="button" onClick={handleCancel}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-800 bg-gray-100 border border-gray-400 rounded-lg hover:bg-gray-300 hover:border-gray-500 transition-colors">
                        <XCircleIcon className="w-4 h-4" />
                        Cancelar
                    </button>
                    <button type="submit" disabled={isSubmitting}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        <SaveIcon className="w-4 h-4" />
                        {isSubmitting ? 'Guardando...' : 'Guardar'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EmotionComponent;
