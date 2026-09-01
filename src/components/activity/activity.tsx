'use client'

import { createActivity, getActivityById, updateActivity, CreateActivityPayload, checkActivityDate, uploadResourceFile } from '@/api/activity';
import { getAll as getAllEmotions } from '@/api/emotion';
import { Activity } from '@/models/activity.entity';
import { Emotion } from '@/models/emotion.entity';
import { User } from '@/models/user.entity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/registry/new-york/ui/card';
import { useTabs } from '@/services/contexts/tabs-context';
import { getSafeKeyObjectFromStorage } from '@/utils/safe-token-storage';
import { PlusCircleIcon, TrashIcon, UploadIcon } from '@heroicons/react/outline';
import { SaveIcon, XCircleIcon } from 'lucide-react';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import CardSection from '../ui/card-section';
import DropdownMenuButton from '../layouts/menu/dropdown-menu-button';
import Loading from '../layouts/loading/loading';
import CurrentDateTime from '../utils/current-datetime';
import WordSearchForm from './forms/WordSearchForm';
import MatchingConceptsForm from './forms/MatchingConceptsForm';
import DiceGameForm from './forms/DiceGameForm';
import EmotionBoxForm from './forms/EmotionBoxForm';
import { useVibraForm } from '@/hooks/useVibraForm';
import { ActivitySchema, type ActivityFormData } from '@/schemas';

type ActivityComponentProps = {
    activityId?: string;
};

const ActivityComponent: React.FC<ActivityComponentProps> = ({ activityId }) => {
    const user_: User = JSON.parse(getSafeKeyObjectFromStorage('user')) ?? {};
    const [user] = useState(user_);

    // ── useVibraForm para campos principales ──────────────────────────
    const { register, handleSubmit, errors, reset, setValue, watch } = useVibraForm(ActivitySchema, {
        title: '',
        description: '',
        difficulty: 1,
        isActive: true,
        emotionId: '',
        type: 'evento_personal',
        scheduleDate: '',
        scheduleWeek: 1,
        scheduleYear: new Date().getFullYear(),
    });

    // ── Arrays dinámicos (se mantienen con useState) ──────────────────
    const [resources, setResources] = useState<Activity['resources']>([]);
    const [questions, setQuestions] = useState<Activity['questions']>([]);
    const [tips, setTips] = useState<{ emoji: string; message: string; category?: string }[]>([]);
    const [games, setGames] = useState<{ type: string; config: any; order: number }[]>([]);

    const GAME_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
        WordSearch: { label: 'Sopa de letras', color: 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200 hover:text-blue-800 hover:border-blue-400' },
        MatchingConcepts: { label: 'Relacionar conceptos', color: 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200 hover:text-green-800 hover:border-green-400' },
        EmotionBox: { label: 'Caja de emociones', color: 'bg-pink-100 text-pink-800 border-pink-300 hover:bg-pink-200 hover:text-pink-800 hover:border-pink-400' },
        DiceGame: { label: 'Juego de dados', color: 'bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200 hover:text-purple-800 hover:border-purple-400' },
    };

    // Tipos de actividad (valores del enum del schema de Activity)
    const ACTIVITY_TYPES: { value: string; label: string }[] = [
        { value: 'reto', label: 'Reto' },
        { value: 'evento_personal', label: 'Evento Personal' },
        { value: 'actividad_pares', label: 'Actividad en Pares' },
        { value: 'otro', label: 'Otro' },
    ];

    const countByType = (type: string) => (games ?? []).filter(g => g.type === type).length;

    // ── Scroll al nuevo juego al agregarlo ─────────────────────────────
    const prevGamesLength = useRef(games.length);
    useEffect(() => {
        if (games.length > prevGamesLength.current) {
            const lastIndex = games.length - 1;
            requestAnimationFrame(() => {
                const el = document.getElementById(`game-${lastIndex}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
        }
        prevGamesLength.current = games.length;
    }, [games.length]);

    // ── Estado auxiliar ───────────────────────────────────────────────
    const [activityID, setActivityID] = useState<string>('');
    const [labelSelectedEmotion, setLabelSelectedEmotion] = useState<string>('Seleccionar emoción');
    const [optionsEmotion, setOptionsEmotion] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [dateConflict, setDateConflict] = useState<boolean>(false);
    const [dateChecking, setDateChecking] = useState<boolean>(false);

    const router = useRouter();
    const { closeTab, closeTabWithRefresh } = useTabs();

    const queryActivityId = Array.isArray(router.query._id) ? router.query._id[0] : router.query._id;
    const resolvedActivityId = String(activityId ?? queryActivityId ?? '');
    const currentTabId = resolvedActivityId ? `/Actividad/${resolvedActivityId}` : '/Actividad';
    const isEditing = !!(resolvedActivityId && resolvedActivityId !== 'undefined' && resolvedActivityId !== 'null');

    // Valores observados del formulario
    const watchTitle = watch('title');
    const watchDifficulty = watch('difficulty');
    const watchIsActive = watch('isActive');
    const watchEmotionId = watch('emotionId');
    const watchType = watch('type');
    const watchScheduleDate = watch('scheduleDate');
    const watchScheduleWeek = watch('scheduleWeek');
    const watchScheduleYear = watch('scheduleYear');

    // ── Cargar emociones ───────────────────────────────────────────────
    useEffect(() => {
        const fetchEmotions = async () => {
            try {
                const response = await getAllEmotions(1, 100);
                const emotions: Emotion[] = response?.data ?? [];
                const opts = emotions.map((e: Emotion) => ({
                    _id: e._id ?? e.id,
                    name: e.name,
                    value: e._id ?? e.id,
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

    // ── Cargar actividad si hay ID (edición) ───────────────────────────
    useEffect(() => {
        const getDataActivity = async () => {
            setIsLoading(true);
            try {
                const res: any = await getActivityById(resolvedActivityId);
                if (res?._id) {
                    setActivityID(res._id);

                    // Reset de campos principales
                    reset({
                        title: typeof res.title === 'string' ? res.title : '',
                        description: typeof res.description === 'string' ? res.description : '',
                        difficulty: typeof res.difficulty === 'number' ? res.difficulty : 1,
                        isActive: typeof res.isActive === 'boolean' ? res.isActive : true,
                        emotionId: '',
                        type: (res.type as any) || 'evento_personal',
                        scheduleDate: res.schedule?.date
                            ? new Date(res.schedule.date).toLocaleDateString('en-CA', { timeZone: 'America/Bogota' })
                            : '',
                        scheduleWeek: typeof res.schedule?.weekNumber === 'number' ? res.schedule.weekNumber : 1,
                        scheduleYear: typeof res.schedule?.year === 'number' ? res.schedule.year : new Date().getFullYear(),
                    });

                    // Emoción
                    const rawEmotion = res.emotion;
                    const emotionId = typeof rawEmotion === 'object' && rawEmotion !== null
                        ? (rawEmotion._id ?? rawEmotion['$oid'] ?? '')
                        : (typeof rawEmotion === 'string' ? rawEmotion : '');
                    setValue('emotionId', emotionId);

                    // Recursos
                    const rawResources = Array.isArray(res.resources) ? res.resources : [];
                    setResources(rawResources.map((r: any) => ({
                        type: (r.type === 'video' || r.type === 'audio' || r.type === 'image') ? r.type : 'video',
                        url: typeof r.url === 'string' ? r.url : '',
                        duration: typeof r.duration === 'number' ? r.duration : 0,
                        metadata: r.metadata ?? { author: '', language: '' },
                    })));

                    // Preguntas
                    const rawQuestions = Array.isArray(res.questions) ? res.questions : [];
                    setQuestions(rawQuestions.map((q: any) => ({
                        id: typeof q.id === 'string' ? q.id : `q${Date.now()}`,
                        questionText: typeof q.questionText === 'string' ? q.questionText : '',
                        type: (q.type === 'multiple' || q.type === 'open') ? q.type : 'open',
                        options: Array.isArray(q.options) ? q.options : [],
                        correctAnswer: typeof q.correctAnswer === 'string' ? q.correctAnswer : undefined,
                        points: typeof q.points === 'number' ? q.points : 5,
                    })));

                    // Tips
                    if (Array.isArray(res.tips)) {
                        setTips(res.tips.map((t: any) => ({
                            emoji: typeof t.emoji === 'string' ? t.emoji : '😊',
                            message: typeof t.message === 'string' ? t.message : '',
                            category: typeof t.category === 'string' ? t.category : undefined,
                        })));
                    }

                    // Juegos
                    if (Array.isArray(res.games)) {
                        setGames(res.games.map((g: any) => ({
                            type: g.type,
                            config: g.config || {},
                            order: typeof g.order === 'number' ? g.order : 0,
                        })));
                    }
                } else {
                    console.warn('Actividad no encontrada:', resolvedActivityId);
                    setError('No se encontró la actividad solicitada');
                }
            } catch (err: any) {
                console.error('Error cargando actividad:', err);
                setError(err.message || 'Error al cargar la actividad');
            } finally {
                setIsLoading(false);
            }
        };

        setActivityID(resolvedActivityId);
        if (isEditing) {
            getDataActivity();
        }
    }, [resolvedActivityId, isEditing, reset, setValue]);

    // ── Sincronizar label de emoción cuando cargan las opciones ────────
    useEffect(() => {
        if (watchEmotionId && optionsEmotion.length > 0) {
            const found = optionsEmotion.find(o => o._id === watchEmotionId);
            if (found) setLabelSelectedEmotion(found.name);
        }
    }, [watchEmotionId, optionsEmotion]);

    // ── Validar fecha duplicada al cambiar la fecha ────────────────────
    useEffect(() => {
        if (!watchScheduleDate) {
            setDateConflict(false);
            return;
        }
        setDateChecking(true);
        const timeout = setTimeout(async () => {
            try {
                const exists = await checkActivityDate(watchScheduleDate, isEditing ? activityID : undefined);
                setDateConflict(exists);
            } catch {
                setDateConflict(false);
            } finally {
                setDateChecking(false);
            }
        }, 500);
        return () => clearTimeout(timeout);
    }, [watchScheduleDate, activityID, isEditing]);

    // ── Validación cliente antes de enviar ─────────────────────────────
    const validatePayload = (): string | null => {
        if (!watchTitle.trim()) return 'El título es obligatorio';
        if (!watchEmotionId) return 'Debe seleccionar una emoción';
        if (watchDifficulty < 1 || watchDifficulty > 5) return 'La dificultad debe estar entre 1 y 5';
        return null;
    };

    // ── Envío del formulario ───────────────────────────────────────────
    const handleFormSubmit = async (data: ActivityFormData) => {
        setError('');
        setSuccess('');

        const validationError = validatePayload();
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsSubmitting(true);

        try {
            const cleanResources = (resources ?? [])
                .filter(r => r.url.trim() !== '')
                .map(r => ({
                    type: r.type,
                    url: r.url.trim(),
                    duration: r.duration ?? 0,
                    metadata: r.metadata ?? { author: '', language: '' },
                }));

            const cleanQuestions = (questions ?? [])
                .filter(q => q.questionText.trim() !== '')
                .map(q => ({
                    id: q.id,
                    questionText: q.questionText.trim(),
                    type: q.type,
                    options: q.type === 'multiple' ? (q.options ?? []).filter(o => o.trim() !== '') : undefined,
                    correctAnswer: q.type === 'multiple' ? q.correctAnswer : undefined,
                    points: q.points,
                }));

            const payload: CreateActivityPayload = {
                title: data.title.trim(),
                description: data.description?.trim() || undefined,
                difficulty: data.difficulty,
                isActive: data.isActive,
                emotion: data.emotionId,
                type: data.type,
                resources: cleanResources,
                questions: cleanQuestions,
                tips: (tips ?? []).filter(t => t.message.trim() !== ''),
                games: (games ?? []).filter(g => g.type).map(g => ({ ...g, config: g.config })),
                schedule: data.scheduleDate ? {
                    date: new Date(`${data.scheduleDate}T00:00:00-05:00`),
                    weekNumber: data.scheduleWeek,
                    year: data.scheduleYear,
                } : undefined,
            };

            if (isEditing) {
                await updateActivity(activityID, payload);
            } else {
                await createActivity(payload);
            }

            setSuccess(isEditing ? 'Actividad actualizada exitosamente' : 'Actividad creada exitosamente');
            setTimeout(() => closeTabWithRefresh(currentTabId, true), 1500);
        } catch (err: any) {
            console.error('[Form] Error al guardar:', err);
            setError(err.message || 'Error inesperado al guardar la actividad');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (!isSubmitting) closeTab(currentTabId);
    };

    const handleBackToList = () => {
        if (!isSubmitting) closeTabWithRefresh(currentTabId, true);
    };

    const handleClean = () => {
        setSuccess('');
        reset({
            title: '', description: '', difficulty: 1, isActive: true,
            emotionId: '', type: 'evento_personal', scheduleDate: '', scheduleWeek: 1, scheduleYear: new Date().getFullYear(),
        });
        setLabelSelectedEmotion('Seleccionar emoción');
        setResources([]); setQuestions([]);
        window.scrollTo(0, 0);
    };

    // ── Recursos ──────────────────────────────────────────────────────
    const addResource = () => setResources([...(resources ?? []), { type: 'video', url: '', duration: 0, metadata: { author: '', language: '' } }]);
    const removeResource = (i: number) => setResources((resources ?? []).filter((_, idx) => idx !== i));
    const updateResource = (i: number, field: string, value: any) => {
        const updated = [...(resources ?? [])];
        updated[i] = { ...updated[i], [field]: value };
        setResources(updated);
    };

    // ── Subida de archivo de recurso ─────────────────────────────────
    const [uploadingResource, setUploadingResource] = useState<number | null>(null);

    const getResourceAccept = (type: string) => {
        switch (type) {
            case 'image': return 'image/jpeg,image/png,image/gif,image/webp';
            case 'video': return 'video/*';
            case 'audio': return 'audio/*';
            default: return '*/*';
        }
    };

    const getResourceUploadLabel = (type: string) => {
        switch (type) {
            case 'image': return 'imagen';
            case 'video': return 'video';
            case 'audio': return 'audio';
            default: return 'archivo';
        }
    };

    const handleResourceFileUpload = async (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingResource(i);
        try {
            const url = await uploadResourceFile(file);
            if (url) {
                updateResource(i, 'url', url);
                toast.success('Archivo subido correctamente');
            } else {
                toast.error('No se pudo subir el archivo. Verifica el formato (imágenes, video o audio, máx 5MB).');
            }
        } finally {
            setUploadingResource(null);
            e.target.value = ''; // permite re-seleccionar el mismo archivo
        }
    };

    // ── Preguntas ─────────────────────────────────────────────────────
    const addQuestion = () => setQuestions([...(questions ?? []), { id: `q${Date.now()}`, questionText: '', type: 'open' as const, points: 5 }]);
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

    // ── Tips motivacionales ────────────────────────────────────────────
    const addTip = () => setTips([...(tips ?? []), { emoji: '😊', message: '', category: undefined }]);
    const removeTip = (i: number) => setTips((tips ?? []).filter((_, idx) => idx !== i));
    const updateTip = (i: number, field: string, value: any) => {
        const updated = [...(tips ?? [])];
        updated[i] = { ...updated[i], [field]: value };
        setTips(updated);
    };

    // ── Juegos de la actividad ─────────────────────────────────────────
    const addGame = (type: string) => {
        const defaults: Record<string, Record<string, any>> = {
            WordSearch: { words: [], gridSize: 9, timeLimit: 300 },
            MatchingConcepts: { conceptPairs: [], timeLimit: 180 },
            DiceGame: { questions: [] },
            EmotionBox: { emotions: [], timeLimit: 120, showInstructions: true },
        };
        setGames([...(games ?? []), { type, config: defaults[type] || {}, order: (games?.length ?? 0) + 1 }]);
    };
    const removeGame = (i: number) => setGames((games ?? []).filter((_, idx) => idx !== i));
    const updateGameConfig = (i: number, field: string, value: any) => {
        const updated = [...(games ?? [])];
        updated[i] = { ...updated[i], config: { ...updated[i].config, [field]: value } };
        setGames(updated);
    };

    const renderOption = ({ label }: { label: string }) => label;

    if (isLoading) return <Loading />;

    return (
        <div className='w-full'>
            <div className="hidden md:flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold tracking-tight">
                    {isEditing ? 'Editar actividad' : 'Nueva actividad'}
                </h2>
                <Card className="bg-white rounded-md px-3 py-1">
                    <CurrentDateTime />
                </Card>
            </div>

            <Card className="w-full mt-3 overflow-hidden">
                <CardHeader className="pb-3">
                    <CardTitle className='flex items-center justify-between'>
                        <div>Gestión de Actividades</div>
                    </CardTitle>
                    <CardDescription>
                        Cree y gestione actividades, configure recursos, preguntas y programación
                    </CardDescription>
                </CardHeader>

                <CardContent className="px-4">
                    {!success && (
                        <form onSubmit={handleSubmit(handleFormSubmit)}>
                            <div className="w-full space-y-6">

                                {/* ── Sección principal ── */}
                                <CardSection title="Información Principal" subtitle="Configure los datos básicos de la actividad">
                                    <div className="space-y-4">
                                        {/* Fila: Título + Emoción + Dificultad + Activo */}
                                        <div className="flex flex-wrap items-end gap-4">
                                            {/* Título */}
                                            <div className="flex-[3] max-w-[460px]">
                                                <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-900">Título *</label>
                                                <div className="mt-1 flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600">
                                                    <input type="text" id="title" {...register('title')}
                                                        className="block w-full border-0 bg-transparent py-1.5 px-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 rounded-md"
                                                        placeholder="Ej: Respiración consciente" />
                                                </div>
                                                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
                                            </div>

                                            {/* Emoción */}
                                            <div className="flex-[2]">
                                                <label className="block text-sm font-medium leading-6 text-gray-900 mb-1">Emoción *</label>
                                                <DropdownMenuButton
                                                    label={labelSelectedEmotion}
                                                    options={optionsEmotion}
                                                    renderOption={renderOption}
                                                    onSelect={(opt: any) => { setValue('emotionId', opt._id); setLabelSelectedEmotion(opt.label); }}
                                                    valueSelected={labelSelectedEmotion}
                                                    minWidth="w-auto"
                                                />
                                            </div>

                                            {/* Dificultad */}
                                            <div className="w-32">
                                                <label htmlFor="difficulty" className="block text-sm font-medium leading-6 text-gray-900">Dificultad (1-5)</label>
                                                <div className="mt-1">
                                                    <input type="number" id="difficulty" min={1} max={5}
                                                        value={watchDifficulty}
                                                        onChange={e => setValue('difficulty', Number(e.target.value))}
                                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6" />
                                                </div>
                                            </div>

                                            {/* Activo */}
                                            <div className="w-auto">
                                                <label className="block text-sm font-medium leading-6 text-gray-900 mb-1">Activo</label>
                                                <div className="flex items-center gap-2">
                                                    <button type="button"
                                                        onClick={() => setValue('isActive', true)}
                                                        className={`px-3 py-1.5 rounded-md text-sm font-semibold ${watchIsActive ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                                                        Sí
                                                    </button>
                                                    <button type="button"
                                                        onClick={() => setValue('isActive', false)}
                                                        className={`px-3 py-1.5 rounded-md text-sm font-semibold ${!watchIsActive ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                                                        No
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Tipo de actividad */}
                                            <div className="w-44">
                                                <label htmlFor="type" className="block text-sm font-medium leading-6 text-gray-900">Tipo de actividad</label>
                                                <div className="mt-1">
                                                    <select id="type" value={watchType}
                                                        onChange={e => setValue('type', e.target.value as any)}
                                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6">
                                                        {ACTIVITY_TYPES.map(t => (
                                                            <option key={t.value} value={t.value}>{t.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Descripción */}
                                        <div>
                                            <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">Descripción</label>
                                            <div className="mt-1">
                                                <textarea rows={2} id="description" {...register('description')}
                                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6" />
                                            </div>
                                        </div>
                                    </div>
                                </CardSection>

                                {/* ── Programación ── */}
                                <CardSection title="Programación" subtitle="Defina la fecha, semana y año de la actividad">
                                    <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-3">
                                        <div>
                                            <label htmlFor="scheduleDate" className="block text-sm font-medium leading-6 text-gray-900">Fecha</label>
                                            <input type="date" id="scheduleDate"
                                                value={watchScheduleDate}
                                                onChange={e => setValue('scheduleDate', e.target.value)}
                                                className={`mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${dateConflict ? 'ring-red-500 bg-red-50' : 'ring-gray-300'} focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6`} />
                                            {dateChecking && (
                                                <p className="text-xs text-gray-400 mt-1">Verificando fecha...</p>
                                            )}
                                            {dateConflict && (
                                                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                                    <span>⚠</span>
                                                    Ya existe una actividad para la fecha seleccionada. Debes elegir otra fecha.
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label htmlFor="scheduleWeek" className="block text-sm font-medium leading-6 text-gray-900">Semana</label>
                                            <input type="number" id="scheduleWeek" min={1} max={53}
                                                value={watchScheduleWeek}
                                                onChange={e => setValue('scheduleWeek', Number(e.target.value))}
                                                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6" />
                                        </div>
                                        <div>
                                            <label htmlFor="scheduleYear" className="block text-sm font-medium leading-6 text-gray-900">Año</label>
                                            <input type="number" id="scheduleYear" min={2020}
                                                value={watchScheduleYear}
                                                onChange={e => setValue('scheduleYear', Number(e.target.value))}
                                                className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6" />
                                        </div>
                                    </div>
                                </CardSection>

                                {/* ── Recursos ── */}
                                <CardSection title="Recursos Multimedia" subtitle="Agregue videos, audios o imágenes de apoyo">
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-sm font-medium text-gray-600">Recursos ({resources?.length ?? 0})</p>
                                        <button type="button" onClick={addResource}
                                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-500">
                                            <PlusCircleIcon className="h-5 w-5" /> Agregar recurso
                                        </button>
                                    </div>
                                    {(resources ?? []).map((res, i) => (
                                        <div key={i} className="mb-3 p-3 bg-gray-50 rounded-md border">
                                            <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-12">
                                                <div className="sm:col-span-1">
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
                                                    <select value={res.type} onChange={e => updateResource(i, 'type', e.target.value)}
                                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm">
                                                        <option value="video">Video</option>
                                                        <option value="audio">Audio</option>
                                                        <option value="image">Imagen</option>
                                                    </select>
                                                </div>
                                                <div className={res.type === 'image' ? 'sm:col-span-8' : 'sm:col-span-6'}>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">URL</label>
                                                    <input type="text" value={res.url} onChange={e => updateResource(i, 'url', e.target.value)}
                                                        placeholder="https://..."
                                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 truncate focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm" />
                                                </div>
                                                {res.type !== 'image' && (
                                                    <div className="sm:col-span-2">
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">Duración (s)</label>
                                                        <input type="number" value={res.duration ?? 0} onChange={e => updateResource(i, 'duration', Number(e.target.value))}
                                                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm" />
                                                    </div>
                                                )}
                                                <div className="sm:col-span-2">
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
                                            {/* Subir archivo y vista previa (imagen) */}
                                            <div className="mt-3">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="file"
                                                        accept={getResourceAccept(res.type)}
                                                        id={`resource-file-${i}`}
                                                        className="sr-only"
                                                        onChange={(e) => handleResourceFileUpload(i, e)}
                                                    />
                                                    <label
                                                        htmlFor={`resource-file-${i}`}
                                                        className="inline-flex items-center gap-1.5 rounded-md border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 cursor-pointer hover:bg-blue-100 transition-colors"
                                                    >
                                                        <UploadIcon className="h-4 w-4" />
                                                        {uploadingResource === i
                                                            ? 'Subiendo...'
                                                            : `Subir ${getResourceUploadLabel(res.type)}`}
                                                    </label>
                                                    {res.url && (
                                                        <span className="text-xs text-gray-400 truncate max-w-[260px]">{res.url}</span>
                                                    )}
                                                </div>
                                                {res.type === 'image' && res.url.trim() !== '' && (
                                                    <div className="mt-2">
                                                        <img
                                                            src={res.url}
                                                            alt={`Vista previa del recurso ${i + 1}`}
                                                            className="max-h-40 w-auto rounded-md border border-gray-300 object-contain bg-white"
                                                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                        />
                                                        <p className="text-xs text-gray-400 mt-1">Vista previa de la imagen</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </CardSection>

                                {/* ── Preguntas ── */}
                                <CardSection title="Preguntas" subtitle="Configure las preguntas de la actividad">
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-sm font-medium text-gray-600">Preguntas ({questions?.length ?? 0})</p>
                                        <button type="button" onClick={addQuestion}
                                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-500">
                                            <PlusCircleIcon className="h-5 w-5" /> Agregar pregunta
                                        </button>
                                    </div>
                                    {(questions ?? []).map((q, qi) => (
                                        <div key={qi} className="mb-4 p-3 bg-gray-50 rounded-md border">
                                            <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-12">
                                                <div className="sm:col-span-6">
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
                                                <div className="sm:col-span-2 flex items-end justify-end">
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
                                </CardSection>

                                {/* ── Tips motivacionales ─────────────────────────────── */}
                                <CardSection title="Tips de Apoyo Emocional" subtitle="Mensajes de ánimo personalizados">
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-sm font-medium text-gray-600">Tips ({tips?.length ?? 0})</p>
                                        <button type="button" onClick={addTip}
                                            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-500">
                                            <PlusCircleIcon className="h-4 w-4" />
                                            Agregar tip
                                        </button>
                                    </div>
                                    {tips.length === 0 && (
                                        <p className="text-sm text-gray-400 italic">Sin tips configurados. Se usarán los tips por defecto.</p>
                                    )}
                                    {tips.map((tip, i) => (
                                        <div key={i} className="flex items-start gap-2 mb-2 p-2 bg-gray-50 rounded-md">
                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                                                <input type="text" value={tip.emoji}
                                                    onChange={e => updateTip(i, 'emoji', e.target.value)}
                                                    className="rounded-md border-0 py-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                                                    placeholder="😊 (emoji)" />
                                                <input type="text" value={tip.message}
                                                    onChange={e => updateTip(i, 'message', e.target.value)}
                                                    className="rounded-md border-0 py-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                                                    placeholder="Mensaje del tip..." />
                                                <select value={tip.category ?? ''}
                                                    onChange={e => updateTip(i, 'category', e.target.value || undefined)}
                                                    className="rounded-md border-0 py-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm">
                                                    <option value="">Todas las actividades</option>
                                                    <option value="start">Inicio</option>
                                                    <option value="question">Preguntas</option>
                                                    <option value="wordsearch">Sopa de letras</option>
                                                    <option value="matching">Emparejar</option>
                                                    <option value="emotionbox">Caja emociones</option>
                                                    <option value="dicegame">Juego dados</option>
                                                    <option value="complete">Finalizar</option>
                                                </select>
                                            </div>
                                            <button type="button" onClick={() => removeTip(i)}
                                                className="text-red-400 hover:text-red-600 mt-1">
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </CardSection>

                                {/* ── Juegos de la actividad ──────────────────────────── */}
                                <CardSection title="Juegos" subtitle="Seleccione y configure los juegos">
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-sm font-medium text-gray-600">Juegos ({games?.length ?? 0})</p>
                                        <div className="flex gap-2 flex-wrap">
                                            {Object.entries(GAME_TYPE_CONFIG).map(([type, cfg]) => {
                                                const count = countByType(type);
                                                return (
                                                    <button key={type} type="button" onClick={() => addGame(type)}
                                                        className={`inline-flex items-center gap-1.5 text-xs font-medium border rounded-md px-2.5 py-1.5 transition-all duration-150 ${cfg.color}`}>
                                                        <PlusCircleIcon className="h-3.5 w-3.5" />
                                                        <span>{cfg.label}</span>
                                                        {count > 0 && (
                                                            <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-white bg-opacity-70 text-[11px] font-bold px-1 shadow-sm">
                                                                {count}
                                                            </span>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    {games.length === 0 && (
                                        <p className="text-sm text-gray-400 italic mb-2">Sin juegos configurados. Solo se mostrará el flujo de preguntas estándar.</p>
                                    )}
                                    {games.map((game, i) => (
                                        <div key={i} id={`game-${i}`} className="border border-gray-200 rounded-md p-3 mb-2 bg-gray-50">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-semibold text-gray-700 bg-blue-100 px-2 py-0.5 rounded">{GAME_TYPE_CONFIG[game.type]?.label || game.type}</span>
                                                <button type="button" onClick={() => removeGame(i)}
                                                    className="text-red-400 hover:text-red-600">
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <div className="text-xs text-gray-500 mb-1">Configuración:</div>
                                            {game.type === 'WordSearch' && (
                                                <WordSearchForm config={game.config} onChange={(cfg) => {
                                                    const updated = [...games]; updated[i] = { ...updated[i], config: cfg }; setGames(updated);
                                                }} />
                                            )}
                                            {game.type === 'MatchingConcepts' && (
                                                <MatchingConceptsForm config={game.config} onChange={(cfg) => {
                                                    const updated = [...games]; updated[i] = { ...updated[i], config: cfg }; setGames(updated);
                                                }} />
                                            )}
                                            {game.type === 'DiceGame' && (
                                                <DiceGameForm config={game.config} onChange={(cfg) => {
                                                    const updated = [...games]; updated[i] = { ...updated[i], config: cfg }; setGames(updated);
                                                }} />
                                            )}
                                            {game.type === 'EmotionBox' && (
                                                <EmotionBoxForm config={game.config} onChange={(cfg) => {
                                                    const updated = [...games]; updated[i] = { ...updated[i], config: cfg }; setGames(updated);
                                                }} />
                                            )}
                                        </div>
                                    ))}
                                </CardSection>

                                {error && (
                                    <div className="rounded-md bg-red-50 p-3 mt-4">
                                        <p className="text-sm font-medium text-red-800">{error}</p>
                                    </div>
                                )}

                                <div className="flex items-center justify-end gap-4 mt-6 mb-4">
                                    <button onClick={handleCancel} type="button"
                                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 rounded-md px-4 py-2 text-sm font-semibold text-white">
                                        <XCircleIcon className="w-4 h-4" />
                                        Cancelar
                                    </button>
                                    <button type="submit" disabled={isSubmitting || dateConflict}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                        <SaveIcon className="w-4 h-4" />
                                        {isSubmitting ? 'Guardando...' : 'Guardar actividad'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    {success && (
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
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ActivityComponent;
