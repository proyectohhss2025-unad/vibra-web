'use client';

import { create, update, getById } from '@/api/emotion';
import { AuthContext } from '@/services/auth';
import { useTabs } from '@/services/contexts/tabs-context';
import { SaveIcon, XCircleIcon } from 'lucide-react';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import Loading from '../layouts/loading/loading';
import FormField from '@/components/forms/FormField';
import EmojiPicker from './emoji-picker';
import { useVibraForm } from '@/hooks/useVibraForm';
import { EmotionSchema, type EmotionFormData } from '@/schemas';
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

    const [emotionID, setEmotionID] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState('');

    const { register, handleSubmit, errors, reset, setValue, watch } = useVibraForm(EmotionSchema, {
        name: '',
        description: '',
        orientationNote: '',
        icono: '',
        percentNote: 0,
        category: '',
        intensity: 5,
    });

    const watchCategory = watch('category');
    const watchIntensity = watch('intensity');
    const watchIcono = watch('icono');

    useEffect(() => {
        if (!token) router.push('/layout');
    }, [token, router]);

    useEffect(() => {
        const getDataEmotion = async () => {
            if (!isEditing) return;
            setIsLoading(true);
            try {
                const res: any = await getById(resolvedEmotionId);
                if (res?._id) {
                    setEmotionID(resolvedEmotionId);
                    reset({
                        name: res.name ?? '',
                        description: res.description ?? '',
                        orientationNote: res.orientationNote ?? '',
                        icono: res.icono ?? '',
                        percentNote: res.percentNote ?? 0,
                        category: res.category ?? '',
                        intensity: res.intensity ?? 5,
                    });
                }
            } catch (err: any) {
                toast.error(err?.message || 'Error al cargar la emoción');
            } finally {
                setIsLoading(false);
            }
        };
        getDataEmotion();
    }, [resolvedEmotionId, isEditing, reset]);

    const handleFormSubmit = async (data: EmotionFormData) => {
        setIsSubmitting(true);
        try {
            if (isEditing) {
                await update(emotionID, {
                    name: data.name,
                    description: data.description,
                    orientationNote: data.orientationNote,
                    icono: data.icono,
                    percentNote: data.percentNote,
                    category: data.category || undefined,
                    intensity: data.intensity,
                });
            } else {
                await create({
                    name: data.name,
                    description: data.description,
                    orientationNote: data.orientationNote,
                    icono: data.icono,
                    percentNote: data.percentNote,
                    category: data.category || undefined,
                    intensity: data.intensity,
                });
            }
            setSuccess(isEditing ? 'Emoción actualizada exitosamente' : 'Emoción creada exitosamente');
            setTimeout(() => closeTabWithRefresh(currentTabId, true), 1500);
        } catch (err: any) {
            toast.error(err?.message || 'Error al guardar la emoción');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        closeTab(currentTabId);
    };

    if (isLoading) return <Loading />;

    if (success) {
        return (
            <div className="test-container container mx-auto px-4 py-8">
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
            </div>
        );
    }

    return (
        <div className="test-container container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">
                {isEditing ? 'Editar Emoción' : 'Nueva Emoción'}
            </h1>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="bg-white shadow-md rounded-lg p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Nombre *" name="name" register={register('name')} error={errors.name} placeholder="Nombre de la emoción" />
                    <FormField label="Categoría" name="category" error={errors.category} render={() => (
                        <select {...register('category')} className="w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm">
                            <option value="">Seleccionar categoría...</option>
                            {CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    )} />
                    <FormField label="Descripción" name="description" register={register('description')} error={errors.description} placeholder="Descripción" />
                    <FormField label="Nota de orientación" name="orientationNote" register={register('orientationNote')} error={errors.orientationNote} placeholder="Nota opcional" />
                    <div className="flex flex-col gap-1">
                        <label htmlFor="icono" className="block text-sm font-medium text-gray-700">Icono (emoji) *</label>
                        <EmojiPicker
                            value={watchIcono}
                            onChange={(emoji) => setValue('icono', emoji)}
                            disabled={isSubmitting}
                            inputId="icono"
                        />
                        {errors.icono && (
                            <span className="text-xs text-red-500 mt-0.5">{errors.icono.message}</span>
                        )}
                    </div>
                    <FormField label="% Nota (0-100)" name="percentNote" type="number" register={register('percentNote', { valueAsNumber: true })} error={errors.percentNote} />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Intensidad (1-10)</label>
                        <input type="range" min={1} max={10} value={watchIntensity} onChange={(e) => setValue('intensity', Number(e.target.value))}
                            className="w-full" />
                        <span className="text-sm text-gray-500">{watchIntensity}/10</span>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-6 mt-4 border-t border-gray-200">
                    <button type="button" onClick={handleCancel}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-800 bg-gray-100 border border-gray-400 rounded-lg hover:bg-gray-300 hover:border-gray-500 transition-colors">
                        <XCircleIcon className="w-4 h-4" /> Cancelar
                    </button>
                    <button type="submit" disabled={isSubmitting}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        <SaveIcon className="w-4 h-4" /> {isSubmitting ? 'Guardando...' : 'Guardar'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EmotionComponent;
