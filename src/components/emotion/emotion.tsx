'use client'

import { createEmotion, getEmotionById } from '@/api/emotion';
import { Emotion } from '@/models/emotion.entity';
import { User } from '@/models/user.entity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/registry/new-york/ui/card';
import { getSafeKeyFromStorage, getSafeKeyObjectFromStorage } from '@/utils/safe-token-storage';
import { ArrowCircleLeftIcon } from '@heroicons/react/outline';
import { CheckCircleIcon, PlusCircleIcon, SaveAsIcon, StarIcon, SupportIcon, ViewListIcon } from '@heroicons/react/solid';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import ToggleSwitch from '../forms/toggleSwitch';
import Loading from '../layouts/loading/loading';
import CurrentDateTime from '../utils/current-datetime';
import './emotion.css';
import { XIcon } from 'lucide-react';

type EmotionComponentProps = {
    emotionId?: string;
};

const EmotionComponent: React.FC<EmotionComponentProps> = ({ emotionId }) => {
    const user_: User = JSON.parse(getSafeKeyObjectFromStorage('user')) ?? {};
    const [emotionName, setEmotionName] = useState<string>('');
    const [emotionDescription, setEmotionDescription] = useState<string>('');
    const [emotionCategory, setEmotionCategory] = useState<string>('');
    const [emotionIntensity, setEmotionIntensity] = useState<number>(5);
    const [emotionID, setEmotionID] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    const [validateForm, setValidateForm] = useState<boolean>(false);

    const [user, setUser] = useState(user_);
    const emotionClean: Emotion = {
        name: '',
        description: '',
        category: '',
        intensity: 5,
        createdBy: user.name,
        createdAt: new Date(Date.now())
    };

    const [emotion, setEmotion] = useState<any>(emotionClean);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Categorías de emociones predefinidas
    const categories = [
        'Positiva',
        'Negativa',
        'Neutra',
        'Básica',
        'Compleja'
    ];

    const queryEmotionId = Array.isArray(router.query._id) ? router.query._id[0] : router.query._id;
    const resolvedEmotionId = String(emotionId ?? queryEmotionId ?? '');

    //#region USE EFFECT
    useEffect(() => {
        const getDataEmotion = async () => {
            try {
                const responseEmotion: any = await getEmotionById(resolvedEmotionId);
                if (responseEmotion._id) {
                    setEmotion(responseEmotion);
                    setEmotionName(responseEmotion?.name);
                    setEmotionDescription(responseEmotion?.description);
                    setEmotionCategory(responseEmotion?.category);
                    setEmotionIntensity(responseEmotion?.intensity);
                }
            } catch (error) {
                setError(error.message);
            }
        };

        setEmotionID(resolvedEmotionId);
        if (resolvedEmotionId && resolvedEmotionId !== 'undefined' && resolvedEmotionId !== 'null') {
            getDataEmotion();
        }
    }, [resolvedEmotionId]);

    useEffect(() => {
        if (emotionName && emotionDescription && emotionCategory) {
            setValidateForm(true);
        }
    }, [emotionName, emotionDescription, emotionCategory]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const emotionResponse = await createEmotion(
                emotionID,
                emotionName,
                emotionDescription,
                emotionCategory,
                emotionIntensity,
                user.name
            );

            if (emotionResponse) {
                setSuccess('Emoción creada exitosamente');
                setEmotion(emotionClean);
            } else {
                setError('Error al crear la emoción');
            }
        } catch (error) {
            setError(error.message);
        }
    };

    const handleCancel = () => {
        router.push('/emotion/emotion-table');
    };

    return (
        <div className='w-full h-full px-4 mx-0'>
            <div className="hidden flex-col md:flex w-full mt-0">
                <div className="flex-1 space-y-4 pt-2">
                    <div className="flex items-center justify-between space-y-0">
                        <h2 className="text-3xl font-bold tracking-tight ml-2">Información general de emociones</h2>
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
                        <div className="flex items-center justify-end sm:col-span-7">
                            <StarIcon data-tooltip-id="my-tooltip-t"
                                data-tooltip-content="Generate support and new features"
                                style={{ float: 'right' }} className="justify-end h-7 w-7 text-blue-600 mt-0 mr-2"
                                onClick={() => { }} />
                            <SupportIcon data-tooltip-id="my-tooltip-t"
                                data-tooltip-content="Init tour"
                                style={{ float: 'right' }} className='justify-end h-7 w-7 text-blue-600 mt-0 mr-2'
                            />
                        </div>
                    </CardTitle>
                    <CardDescription className='mt-0 mb-0' >
                        Gestione las emociones disponibles en el sistema. Complete el formulario para crear o actualizar una emoción.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!success && <form onSubmit={handleSubmit}>
                        <div className="space-y-8">
                            <div className="pb-0">
                                {isLoading && <div className="loading-container"><Loading /></div>}

                                <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-6">
                                    <div className="col-span-full">
                                        <label htmlFor="emotionName" className="block text-sm font-medium leading-6 text-gray-900">
                                            {getSafeKeyFromStorage('Name')}
                                        </label>
                                        <div className="mt-2">
                                            <div className="bg-white flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600">
                                                <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">emotion.name:</span>
                                                <input
                                                    type="text"
                                                    name="emotionName"
                                                    id="emotionName"
                                                    value={emotionName}
                                                    onChange={(e) => {
                                                        setEmotionName(e.target.value);
                                                    }}
                                                    className="block flex-1 border-0 bg-transparent py-1.5 pl-6 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                                                    placeholder="example: Happiness"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-span-full">
                                        <label htmlFor="emotionDescription" className="block text-sm font-medium leading-6 text-gray-900">
                                            {getSafeKeyFromStorage('Description')}
                                        </label>
                                        <div className="mt-2">
                                            <textarea
                                                rows={2}
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                                name="emotionDescription"
                                                id="emotionDescription"
                                                value={emotionDescription}
                                                onChange={(e) => {
                                                    setEmotionDescription(e.target.value);
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-3">
                                        <label htmlFor="emotionCategory" className="block text-sm font-medium leading-6 text-gray-900">
                                            Categoría
                                        </label>
                                        <div className="mt-2">
                                            <select
                                                id="emotionCategory"
                                                name="emotionCategory"
                                                value={emotionCategory}
                                                onChange={(e) => setEmotionCategory(e.target.value)}
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:max-w-xs sm:text-sm sm:leading-6"
                                            >
                                                <option value="">Seleccione una categoría</option>
                                                {categories.map((category) => (
                                                    <option key={category} value={category}>
                                                        {category}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="sm:col-span-3">
                                        <label htmlFor="emotionIntensity" className="block text-sm font-medium leading-6 text-gray-900">
                                            Intensidad (1-10)
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                type="number"
                                                name="emotionIntensity"
                                                id="emotionIntensity"
                                                min="1"
                                                max="10"
                                                value={emotionIntensity}
                                                onChange={(e) => setEmotionIntensity(parseInt(e.target.value))}
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-end gap-x-6">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="text-sm font-semibold leading-6 text-gray-900"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={!validateForm}
                                    className={`rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${validateForm ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-400 cursor-not-allowed'}`}
                                >
                                    Guardar
                                </button>
                            </div>
                        </div>
                    </form>}

                    {success && (
                        <div className="rounded-md bg-green-50 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-green-800">{success}</p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <div className="flex">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSuccess('');
                                            setEmotionName('');
                                            setEmotionDescription('');
                                            setEmotionCategory('');
                                            setEmotionIntensity(5);
                                            setEmotionID('');
                                        }}
                                        className="rounded-md bg-green-50 px-2 py-1.5 text-sm font-medium text-green-800 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-green-50"
                                    >
                                        Crear otra emoción
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => router.push('/emotion/emotion-table')}
                                        className="ml-3 rounded-md bg-green-50 px-2 py-1.5 text-sm font-medium text-green-800 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-green-50"
                                    >
                                        Ver listado de emociones
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="rounded-md bg-red-50 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <XIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-red-800">{error}</p>
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
