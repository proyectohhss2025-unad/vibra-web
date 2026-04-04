'use client'

import { createActivity, getActivityById } from '@/api/activity';
import { getAllEmotions } from '@/api/emotion';
import { Activity } from '@/models/activity.entity';
import { Emotion } from '@/models/emotion.entity';
import { User } from '@/models/user.entity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/registry/new-york/ui/card';
import { useTabs } from '@/services/contexts/tabs-context';
import { getSafeKeyFromStorage, getSafeKeyObjectFromStorage } from '@/utils/safe-token-storage';
import { ArrowCircleLeftIcon, PlusCircleIcon, SaveAsIcon, TrashIcon } from '@heroicons/react/outline';
import { CheckCircleIcon, StarIcon, SupportIcon } from '@heroicons/react/solid';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import DropdownMenuButton from '../layouts/menu/dropdown-menu-button';
import Loading from '../layouts/loading/loading';
import CurrentDateTime from '../utils/current-datetime';
import './activity.css';

type ActivityComponentProps = {
    activityId?: string;
};

const ActivityComponent: React.FC<ActivityComponentProps> = ({ activityId }) => {
    const user_: User = JSON.parse(getSafeKeyObjectFromStorage('user')) ?? {};
    const [user] = useState(user_);

    // Campos del formulario
    const [activityID, setActivityID] = useState<string>('');
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [difficulty, setDifficulty] = useState<number>(1);
    const [isActive, setIsActive] = useState<boolean>(true);
    const [idEmotionSelected, setIdEmotionSelected] = useState<string>('');
    const [labelSelectedEmotion, setLabelSelectedEmotion] = useState<string>('Seleccionar emoción');
    const [optionsEmotion, setOptionsEmotion] = useState<any[]>([]);
    const [scheduleDate, setScheduleDate] = useState<string>('');
    const [scheduleWeek, setScheduleWeek] = useState<number>(1);
    const [scheduleYear, setScheduleYear] = useState<number>(new Date().getFullYear());
    const [resources, setResources] = useState<Activity['resources']>([]);
    const [questions, setQuestions] = useState<Activity['questions']>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [validateForm, setValidateForm] = useState<boolean>(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const router = useRouter();
    const { closeTab } = useTabs();

    const queryActivityId = Array.isArray(router.query._id) ? router.query._id[0] : router.query._id;
    const resolvedActivityId = String(activityId ?? queryActivityId ?? '');
    const currentTabId = resolvedActivityId ? `/Actividad/${resolvedActivityId}` : '/Actividad';

    // Cargar emociones
    useEffect(() => {
        const fetchEmotions = async () => {
            try {
                const response = await getAllEmotions(1, 100);
                const emotions: Emotion[] = response?.docs ?? response?.emotions ?? [];
                const opts = emotions.map((e: Emotion, i: number) => ({
                    _id: e._id ?? e.id,
                    name: e.name,
                    value: i,
                    label: e.name,
                    icon: 'CheckCircleIcon',
                }));
                setOptionsEmotion(opts);
            } catch (err) {
                console.error('Error cargando emociones:', err);
            }
        };
        fetchEmotions();
    }, []);

    // Cargar actividad si hay ID
    useEffect(() => {
        const getDataActivity = async () => {
            setIsLoading(true);
            try {
                const res: any = await getActivityById(resolvedActivityId);
                if (res?._id) {
                    setActivityID(res._id);
                    setTitle(res.title ?? '');
                    setDescription(res.description ?? '');
                    setDifficulty(res.difficulty ?? 1);
                    setIsActive(res.isActive ?? true);
                    setResources(res.resources ?? []);
                    setQuestions(res.questions ?? []);
                    if (res.schedule) {
                        setScheduleDate(res.schedule.date ? new Date(res.schedule.date).toISOString().split('T')[0] : '');
                        setScheduleWeek(res.schedule.weekNumber ?? 1);
                        setScheduleYear(res.schedule.year ?? new Date().getFullYear());
                    }
                    // Emoción: puede venir como objeto o como $oid string
                    const emotionId = res.emotion?._id ?? res.emotion?.['$oid'] ?? res.emotion ?? '';
                    setIdEmotionSelected(String(emotionId));
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        setActivityID(resolvedActivityId);
        if (resolvedActivityId && resolvedActivityId !== 'undefined' && resolvedActivityId !== 'null') {
            getDataActivity();
        }
    }, [resolvedActivityId]);

    // Sincronizar label de emoción cuando cargan las opciones
    useEffect(() => {
        if (idEmotionSelected && optionsEmotion.length > 0) {
            const found = optionsEmotion.find(o => o._id === idEmotionSelected);
            if (found) setLabelSelectedEmotion(found.name);
        }
    }, [idEmotionSelected, optionsEmotion]);

    useEffect(() => {
        setValidateForm(!!(title && idEmotionSelected));
    }, [title, idEmotionSelected]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload: any = {
                _id: activityID || null,
                title,
                description,
                difficulty,
                isActive,
                emotion: idEmotionSelected,
                resources,
                questions,
                schedule: scheduleDate ? {
                    date: new Date(scheduleDate),
                    weekNumber: scheduleWeek,
                    year: scheduleYear,
                } : undefined,
                createdBy: user.name,
                editedBy: user.name,
            };
            const response = await createActivity(
                payload._id, payload.title, payload.description, '',
                new Date(), new Date(), [], '', user.name
            );
            if (response) {
                setSuccess('Actividad guardada exitosamente');
            } else {
                setError('Error al guardar la actividad');
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleCancel = () => closeTab(currentTabId);

    const handleClean = () => {
        setSuccess(''); setTitle(''); setDescription(''); setActivityID('');
        setIdEmotionSelected(''); setLabelSelectedEmotion('Seleccionar emoción');
        setResources([]); setQuestions([]);
        window.scrollTo(0, 0);
    };

    // Recursos
    const addResource = () => setResources([...(resources ?? []), { type: 'video', url: '', duration: 0, metadata: { author: '', language: '' } }]);
    const removeResource = (i: number) => setResources((resources ?? []).filter((_, idx) => idx !== i));
    const updateResource = (i: number, field: string, value: any) => {
        const updated = [...(resources ?? [])];
        updated[i] = { ...updated[i], [field]: value };
        setResources(updated);
    };

    // Preguntas
    const addQuestion = () => setQuestions([...(questions ?? []), { id: `q${Date.now()}`, questionText: '', type: 'open', points: 5 }]);
    const removeQuestion = (i: number) => setQuestions((questions ?? []).filter((_, idx) => idx !== i));
    const updateQuestion = (i: number, field: string, value: any) => {
        const updated = [...(questions ?? [])];
        updated[i] = { ...updated[i], [field]: value };
        setQuestions(updated);
    };
    const updateQuestionOption = (qi: number, oi: number, value: string) => {
        const updated = [...(questions ?? [])];
        const opts = [...(updated[qi].options ?? [])];
        opts[oi] = value;
        updated[qi] = { ...updated[qi], options: opts };
        setQuestions(updated);
    };
    const addOption = (qi: number) => {
        const updated = [...(questions ?? [])];
        updated[qi] = { ...updated[qi], options: [...(updated[qi].options ?? []), ''] };
        setQuestions(updated);
    };
    const removeOption = (qi: number, oi: number) => {
        const updated = [...(questions ?? [])];
        updated[qi] = { ...updated[qi], options: (updated[qi].options ?? []).filter((_, idx) => idx !== oi) };
        setQuestions(updated);
    };

    const renderOption = ({ label }) => label;

    if (isLoading) return <Loading />;

    return (
        <div className='w-full h-full px-4 mt-4'>
            <div className="hidden flex-col md:flex">
                <div className="flex-1 space-y-4 pt-6">
                    <div className="flex items-center justify-between space-y-2">
                        <h2 className="text-3xl font-bold tracking-tight ml-2">
                            {activityID ? 'Editar actividad' : 'Nueva actividad'}
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
                        <div>Gestión de Actividades</div>
                        <div className="flex items-center justify-end">
                            <StarIcon data-tooltip-id="my-tooltip-t" data-tooltip-content="Favoritos"
                                className="justify-end h-7 w-7 text-blue-600 mt-0 mr-2" onClick={() => {}} />
                            <SupportIcon data-tooltip-id="my-tooltip-t" data-tooltip-content="Ayuda"
                                className="justify-end h-7 w-7 text-blue-600 mt-0 mr-2" />
                        </div>
                    </CardTitle>
                    <CardDescription className='mt-0 mb-0'>
                        Cree y gestione actividades, configure recursos, preguntas y programación
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {!success && (
                        <form onSubmit={handleSubmit} className='w-full mt-0 ml-6' style={{ marginTop: '-20px' }}>
                            <div className="w-full">

                                {/* ── Sección principal ── */}
                                <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-12">

                                    {/* Título */}
                                    <div className="sm:col-span-8">
                                        <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-900">
                                            {getSafeKeyFromStorage('Title')} *
                                        </label>
                                        <div className="mt-2 bg-white flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600">
                                            <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">activity.title:</span>
                                            <input type="text" id="title" value={title}
                                                onChange={e => setTitle(e.target.value)}
                                                className="block flex-1 border-0 bg-transparent py-1.5 pl-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                                                placeholder="ej: Felicidad" required />
                                        </div>
                                    </div>

                                    {/* Dificultad */}
                                    <div className="sm:col-span-2">
                                        <label htmlFor="difficulty" className="block text-sm font-medium leading-6 text-gray-900">
                                            Dificultad (1-5)
                                        </label>
                                        <div className="mt-2">
                                            <input type="number" id="difficulty" min={1} max={5} value={difficulty}
                                                onChange={e => setDifficulty(Number(e.target.value))}
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6" />
                                        </div>
                                    </div>

                                    {/* Activo */}
                                    <div className="sm:col-span-2 flex flex-col justify-end">
                                        <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">Activo</label>
                                        <div className="flex items-center gap-3">
                                            <button type="button"
                                                onClick={() => setIsActive(true)}
                                                className={`px-3 py-1.5 rounded-md text-sm font-semibold ${isActive ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                                                Sí
                                            </button>
                                            <button type="button"
                                                onClick={() => setIsActive(false)}
                                                className={`px-3 py-1.5 rounded-md text-sm font-semibold ${!isActive ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                                                No
                                            </button>
                                        </div>
                                    </div>

                                    {/* Emoción */}
                                    <div className="sm:col-span-6">
                                        <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">
                                            Emoción *
                                        </label>
                                        <DropdownMenuButton
                                            label={labelSelectedEmotion}
                                            options={optionsEmotion}
                                            renderOption={renderOption}
                                            onSelect={(opt) => { setIdEmotionSelected(opt._id); setLabelSelectedEmotion(opt.label); }}
                                            valueSelected={labelSelectedEmotion}
                                        />
                                    </div>

                                    {/* Descripción */}
                                    <div className="sm:col-span-12">
                                        <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">
                                            {getSafeKeyFromStorage('Description')}
                                        </label>
                                        <div className="mt-2">
                                            <textarea rows={3} id="description" value={description}
                                                onChange={e => setDescription(e.target.value)}
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6" />
                                        </div>
                                    </div>
                                </div>

                                {/* ── Programación ── */}
                                <div className="mt-6 border-t pt-4">
                                    <p className="text-sm font-semibold text-gray-700 mb-3">Programación</p>
                                    <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-12">
                                        <div className="sm:col-span-4">
                                            <label htmlFor="scheduleDate" className="block text-sm font-medium leading-6 text-gray-900">Fecha</label>
                                            <input type="date" id="scheduleDate" value={scheduleDate}
                                                onChange={e => setScheduleDate(e.target.value)}
                                                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6" />
                                        </div>
                                        <div className="sm:col-span-4">
                                            <label htmlFor="scheduleWeek" className="block text-sm font-medium leading-6 text-gray-900">Semana</label>
                                            <input type="number" id="scheduleWeek" min={1} max={53} value={scheduleWeek}
                                                onChange={e => setScheduleWeek(Number(e.target.value))}
                                                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6" />
                                        </div>
                                        <div className="sm:col-span-4">
                                            <label htmlFor="scheduleYear" className="block text-sm font-medium leading-6 text-gray-900">Año</label>
                                            <input type="number" id="scheduleYear" min={2020} value={scheduleYear}
                                                onChange={e => setScheduleYear(Number(e.target.value))}
                                                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6" />
                                        </div>
                                    </div>
                                </div>

                                {/* ── Recursos ── */}
                                <div className="mt-6 border-t pt-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-sm font-semibold text-gray-700">Recursos ({resources?.length ?? 0})</p>
                                        <button type="button" onClick={addResource}
                                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-500">
                                            <PlusCircleIcon className="h-5 w-5" /> Agregar recurso
                                        </button>
                                    </div>
                                    {(resources ?? []).map((res, i) => (
                                        <div key={i} className="mb-3 p-3 bg-gray-50 rounded-md border grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-12">
                                            <div className="sm:col-span-2">
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
                                                <select value={res.type} onChange={e => updateResource(i, 'type', e.target.value)}
                                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm">
                                                    <option value="video">Video</option>
                                                    <option value="audio">Audio</option>
                                                </select>
                                            </div>
                                            <div className="sm:col-span-6">
                                                <label className="block text-xs font-medium text-gray-700 mb-1">URL</label>
                                                <input type="text" value={res.url} onChange={e => updateResource(i, 'url', e.target.value)}
                                                    placeholder="https://..."
                                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm" />
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Duración (s)</label>
                                                <input type="number" value={res.duration ?? 0} onChange={e => updateResource(i, 'duration', Number(e.target.value))}
                                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm" />
                                            </div>
                                            <div className="sm:col-span-1">
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Autor</label>
                                                <input type="text" value={res.metadata?.author ?? ''} onChange={e => updateResource(i, 'metadata', { ...res.metadata, author: e.target.value })}
                                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm" />
                                            </div>
                                            <div className="sm:col-span-1 flex items-end justify-end">
                                                <button type="button" onClick={() => removeResource(i)}
                                                    className="text-red-500 hover:text-red-700">
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* ── Preguntas ── */}
                                <div className="mt-6 border-t pt-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-sm font-semibold text-gray-700">Preguntas ({questions?.length ?? 0})</p>
                                        <button type="button" onClick={addQuestion}
                                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-500">
                                            <PlusCircleIcon className="h-5 w-5" /> Agregar pregunta
                                        </button>
                                    </div>
                                    {(questions ?? []).map((q, qi) => (
                                        <div key={qi} className="mb-4 p-3 bg-gray-50 rounded-md border">
                                            <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-12">
                                                <div className="sm:col-span-7">
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Texto de la pregunta</label>
                                                    <input type="text" value={q.questionText} onChange={e => updateQuestion(qi, 'questionText', e.target.value)}
                                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm" />
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
                                                    <select value={q.type} onChange={e => updateQuestion(qi, 'type', e.target.value)}
                                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm">
                                                        <option value="open">Abierta</option>
                                                        <option value="multiple">Múltiple</option>
                                                    </select>
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Puntos</label>
                                                    <input type="number" min={1} value={q.points} onChange={e => updateQuestion(qi, 'points', Number(e.target.value))}
                                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm" />
                                                </div>
                                                <div className="sm:col-span-1 flex items-end justify-end">
                                                    <button type="button" onClick={() => removeQuestion(qi)}
                                                        className="text-red-500 hover:text-red-700">
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </div>
                                            {q.type === 'multiple' && (
                                                <div className="mt-3 pl-2">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-xs font-medium text-gray-600">Opciones</span>
                                                        <button type="button" onClick={() => addOption(qi)}
                                                            className="text-xs text-blue-600 hover:text-blue-500">+ Opción</button>
                                                    </div>
                                                    {(q.options ?? []).map((opt, oi) => (
                                                        <div key={oi} className="flex items-center gap-2 mb-1">
                                                            <input type="radio" name={`correct-${qi}`}
                                                                checked={q.correctAnswer === opt}
                                                                onChange={() => updateQuestion(qi, 'correctAnswer', opt)}
                                                                className="h-4 w-4 text-blue-600" />
                                                            <input type="text" value={opt} onChange={e => updateQuestionOption(qi, oi, e.target.value)}
                                                                className="flex-1 rounded-md border-0 py-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                                                                placeholder={`Opción ${oi + 1}`} />
                                                            <button type="button" onClick={() => removeOption(qi, oi)}
                                                                className="text-red-400 hover:text-red-600">
                                                                <TrashIcon className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    {q.correctAnswer && (
                                                        <p className="text-xs text-green-600 mt-1">Respuesta correcta: {q.correctAnswer}</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
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
                                        Guardar actividad
                                    </button>
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
                                        <div className="font-medium text-gray-900">
                                            {activityID ? 'Actividad actualizada con éxito' : 'Actividad creada con éxito'}
                                        </div>
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
                                                Nueva actividad
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

export default ActivityComponent;
