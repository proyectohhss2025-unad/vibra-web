'use client'

import { createEmotion, getEmotionById } from '@/api/emotion';
import { Emotion } from '@/models/emotion.entity';
import { User } from '@/models/user.entity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/registry/new-york/ui/card';
import { useTabs } from '@/services/contexts/tabs-context';
import { getSafeKeyFromStorage, getSafeKeyObjectFromStorage } from '@/utils/safe-token-storage';
import { ArrowCircleLeftIcon, PlusCircleIcon, SaveAsIcon } from '@heroicons/react/outline';
import { CheckCircleIcon, StarIcon, SupportIcon, ViewListIcon } from '@heroicons/react/solid';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Loading from '../layouts/loading/loading';
import CurrentDateTime from '../utils/current-datetime';
import './emotion.css';

type EmotionComponentProps = {
    emotionId?: string;
};

const EmotionComponent: React.FC<EmotionComponentProps> = ({ emotionId }) => {
    const user_: User = JSON.parse(getSafeKeyObjectFromStorage('user')) ?? {};
    const [user] = useState(user_);

    const [emotionName, setEmotionName] = useState<string>('');
    const [emotionDescription, setEmotionDescription] = useState<string>('');
    const [emotionOrientationNote, setEmotionOrientationNote] = useState<string>('');
    const [emotionIcono, setEmotionIcono] = useState<string>('');
    const [emotionPercentNote, setEmotionPercentNote] = useState<number>(0);
    const [emotionCategory, setEmotionCategory] = useState<string>('');
    const [emotionIntensity, setEmotionIntensity] = useState<number>(5);
    const [emotionID, setEmotionID] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [validateForm, setValidateForm] = useState<boolean>(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const router = useRouter();
    const { closeTab } = useTabs();

    const categories = ['Positiva', 'Negativa', 'Neutra', 'Básica', 'Compleja'];

    const queryEmotionId = Array.isArray(router.query._id) ? router.query._id[0] : router.query._id;
    const resolvedEmotionId = String(emotionId ?? queryEmotionId ?? '');
    const currentTabId = resolvedEmotionId ? `/Emocion/${resolvedEmotionId}` : '/Emocion';

    useEffect(() => {
        const getDataEmotion = async () => {
            setIsLoading(true);
            try {
                const res: any = await getEmotionById(resolvedEmotionId);
                if (res._id) {
                    setEmotionName(res?.name ?? '');
                    setEmotionDescription(res?.description ?? '');
                    setEmotionOrientationNote(res?.orientationNote ?? '');
                    setEmotionIcono(res?.icono ?? '');
                    setEmotionPercentNote(res?.percentNote ?? 0);
                    setEmotionCategory(res?.category ?? '');
                    setEmotionIntensity(res?.intensity ?? 5);
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        setEmotionID(resolvedEmotionId);
        if (resolvedEmotionId && resolvedEmotionId !== 'undefined' && resolvedEmotionId !== 'null') {
            getDataEmotion();
        }
    }, [resolvedEmotionId]);

    useEffect(() => {
        setValidateForm(!!(emotionName && emotionDescription && emotionCategory));
    }, [emotionName, emotionDescription, emotionCategory]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await createEmotion(emotionID, emotionName, emotionDescription, emotionCategory, emotionIntensity, user.name);
            if (res) {
                setSuccess(emotionID ? 'Emoción actualizada exitosamente' : 'Emoción creada exitosamente');
            } else {
                setError('Error al guardar la emoción');
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleCancel = () => closeTab(currentTabId);

    const handleClean = () => {
        setSuccess(''); setEmotionName(''); setEmotionDescription('');
        setEmotionCategory(''); setEmotionIntensity(5); setEmotionID('');
        setEmotionOrientationNote(''); setEmotionIcono(''); setEmotionPercentNote(0);
        window.scrollTo(0, 0);
    };

    if (isLoading) return <Loading />;

    return (
        <div className='w-full h-full px-4 mt-4'>
            <div className="hidden flex-col md:flex">
                <div className="flex-1 space-y-4 pt-6">
                    <div className="flex items-center justify-between space-y-2">
                        <h2 className="text-3xl font-bold tracking-tight ml-2">
                            {emotionID ? 'Editar emoción' : 'Nueva emoción'}
                        </h2>
                        <div className="flex items-center space-x-2">
                            <Card className="col-span-12 bg-white rounded-md px-2 pl-2 pb-1">
                                <CurrentDateTime />
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            <Card className="col-span-4 bg-white rounded-md w-full mt-3">
                <CardHeader>
                    <CardTitle className='flex items-center justify-between'>
                        <div>Gestión de emociones</div>
                        <div className="flex items-center justify-end">
                            <StarIcon data-tooltip-id="my-tooltip-t" data-tooltip-content="Favoritos"
                                className="justify-end h-7 w-7 text-blue-600 mt-0 mr-2" onClick={() => {}} />
                            <SupportIcon data-tooltip-id="my-tooltip-t" data-tooltip-content="Ayuda"
                                className="justify-end h-7 w-7 text-blue-600 mt-0 mr-2" />
                        </div>
                    </CardTitle>
                    <CardDescription className='mt-0 mb-0'>
                        Gestione las emociones disponibles en el sistema. Complete el formulario para crear o actualizar una emoción.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {!success && (
                        <form onSubmit={handleSubmit} className='w-full mt-0 ml-6' style={{ marginTop: '-20px' }}>
                            <div className="w-full">
                                <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-12">

                                    {/* Nombre */}
                                    <div className="sm:col-span-8">
                                        <label htmlFor="emotionName" className="block text-sm font-medium leading-6 text-gray-900">
                                            {getSafeKeyFromStorage('Name')} *
                                        </label>
                                        <div className="mt-2 bg-white flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600">
                                            <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">emotion.name:</span>
                                            <input type="text" id="emotionName" value={emotionName}
                                                onChange={e => setEmotionName(e.target.value)}
                                                className="block flex-1 border-0 bg-transparent py-1.5 pl-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                                                placeholder="ej: Felicidad" required />
                                        </div>
                                    </div>

                                    {/* Icono + Porcentaje */}
                                    <div className="sm:col-span-2">
                                        <label htmlFor="emotionIcono" className="block text-sm font-medium leading-6 text-gray-900">Icono</label>
                                        <div className="mt-2">
                                            <input type="text" id="emotionIcono" value={emotionIcono}
                                                onChange={e => setEmotionIcono(e.target.value)}
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                                placeholder="😊" />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label htmlFor="emotionPercentNote" className="block text-sm font-medium leading-6 text-gray-900">% Nota</label>
                                        <div className="mt-2">
                                            <input type="number" id="emotionPercentNote" min={0} max={100} value={emotionPercentNote}
                                                onChange={e => setEmotionPercentNote(Number(e.target.value))}
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6" />
                                        </div>
                                    </div>

                                    {/* Descripción */}
                                    <div className="sm:col-span-12">
                                        <label htmlFor="emotionDescription" className="block text-sm font-medium leading-6 text-gray-900">
                                            {getSafeKeyFromStorage('Description')} *
                                        </label>
                                        <div className="mt-2">
                                            <textarea rows={2} id="emotionDescription" value={emotionDescription}
                                                onChange={e => setEmotionDescription(e.target.value)}
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6" />
                                        </div>
                                    </div>

                                    {/* Nota de orientación */}
                                    <div className="sm:col-span-12">
                                        <label htmlFor="emotionOrientationNote" className="block text-sm font-medium leading-6 text-gray-900">
                                            Nota de orientación
                                        </label>
                                        <div className="mt-2">
                                            <textarea rows={2} id="emotionOrientationNote" value={emotionOrientationNote}
                                                onChange={e => setEmotionOrientationNote(e.target.value)}
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                                placeholder="Enfócate en mantener y compartir este sentimiento..." />
                                        </div>
                                    </div>

                                    {/* Categoría + Intensidad */}
                                    <div className="sm:col-span-6">
                                        <label htmlFor="emotionCategory" className="block text-sm font-medium leading-6 text-gray-900">
                                            Categoría *
                                        </label>
                                        <div className="mt-2">
                                            <select id="emotionCategory" value={emotionCategory}
                                                onChange={e => setEmotionCategory(e.target.value)}
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6">
                                                <option value="">Seleccione una categoría</option>
                                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="sm:col-span-6">
                                        <label htmlFor="emotionIntensity" className="block text-sm font-medium leading-6 text-gray-900">
                                            Intensidad (1-10)
                                        </label>
                                        <div className="mt-2">
                                            <input type="number" id="emotionIntensity" min={1} max={10} value={emotionIntensity}
                                                onChange={e => setEmotionIntensity(parseInt(e.target.value))}
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6" />
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className="rounded-md bg-red-50 p-3 mt-4 mr-10">
                                        <p className="text-sm font-medium text-red-800">{error}</p>
                                    </div>
                                )}

                                <div className="flex items-center justify-end gap-x-6 mr-10 mt-6 mb-4">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none pr-4">
                                            <ArrowCircleLeftIcon className="h-6 w-8 text-white-500" color="#FFFFFF" />
                                        </div>
                                        <button onClick={handleCancel} type="button"
                                            className="bg-blue-600 hover:bg-blue-500 rounded-md px-3 py-1.5 pl-12 text-sm font-semibold leading-6 text-white">
                                            Ir atrás
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none mr-4">
                                            <SaveAsIcon className="h-6 w-8 text-white-500" color="#FFFFFF" />
                                        </div>
                                        <button type="submit" disabled={!validateForm}
                                            className={`${validateForm ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-500'} rounded-md px-3 py-2 pl-12 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600`}>
                                            Guardar emoción
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    )}

                    {success && (
                        <div className="relative inset-0 flex items-center justify-center z-50 mt-20" style={{ pointerEvents: 'auto' }}>
                            <div className="bg-white rounded-lg shadow-lg p-8">
                                <div className="flex h-6 items-center justify-center pt-2">
                                    <CheckCircleIcon className="h-9 w-9 mr-2" color="#3c763d" />
                                    <div className="text-sm leading-6">
                                        <div className="font-medium text-gray-900">{success}</div>
                                    </div>
                                </div>
                                <div className="mt-0 grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-10">
                                    <div className="sm:col-span-5">
                                        <div className="relative mt-8">
                                            <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none mr-20">
                                                <ArrowCircleLeftIcon className="h-6 w-8 text-white-500" color="#FFFFFF" />
                                            </div>
                                            <button type="button" onClick={handleCancel}
                                                className="rounded-md bg-green-600 px-3 py-2 pl-12 text-sm font-semibold shadow-sm hover:bg-green-500 text-white">
                                                Volver a la lista
                                            </button>
                                        </div>
                                    </div>
                                    <div className="sm:col-span-5">
                                        <div className="relative mt-8">
                                            <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none mr-20">
                                                <PlusCircleIcon className="h-6 w-8 text-white-500" color="#FFFFFF" />
                                            </div>
                                            <button type="button" onClick={handleClean}
                                                className="rounded-md bg-blue-600 px-3 py-2 pl-12 text-sm font-semibold shadow-sm hover:bg-blue-500 text-white">
                                                Nueva emoción
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default EmotionComponent;
