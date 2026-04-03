'use client'

import { createActivity, getActivityById } from '@/api/activity';
import { Activity } from '@/models/activity.entity';
import { User } from '@/models/user.entity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/registry/new-york/ui/card';
import { getSafeKeyFromStorage, getSafeKeyObjectFromStorage } from '@/utils/safe-token-storage';
import { ArrowCircleLeftIcon } from '@heroicons/react/outline';
import { CheckCircleIcon, StarIcon, SupportIcon } from '@heroicons/react/solid';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Loading from '../layouts/loading/loading';
import CurrentDateTime from '../utils/current-datetime';
import './activity.css';

type ActivityComponentProps = {
    activityId?: string;
};

const ActivityComponent: React.FC<ActivityComponentProps> = ({ activityId }) => {
    const user_: User = JSON.parse(getSafeKeyObjectFromStorage('user')) ?? {};
    const [activityName, setActivityName] = useState<string>('');
    const [activityDescription, setActivityDescription] = useState<string>('');
    const [activityStatus, setActivityStatus] = useState<string>('Pending');
    const [activityPriority, setActivityPriority] = useState<string>('Medium');
    const [activityStartDate, setActivityStartDate] = useState<Date>(new Date());
    const [activityEndDate, setActivityEndDate] = useState<Date>(new Date());
    const [activityAssignedUsers, setActivityAssignedUsers] = useState<any>([]);
    const [activityID, setActivityID] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    const [validateForm, setValidateForm] = useState<boolean>(false);

    const [user, setUser] = useState(user_);
    const activityClean: Activity = {
        id: '',
        emotion: {
            id: '',
            name: '',
            description: '',
            icono: '',
            percentNote: 0,
            createdAt: new Date(Date.now()),
            createdBy: user.name,
        },
        difficulty: 3,
        title: '',
        description: '',
        createdBy: user.name,
        createdAt: new Date(Date.now()),
        isActive: true,
        updatedAt: new Date(Date.now()),
    };

    const [activity, setActivity] = useState<any>(activityClean);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const queryActivityId = Array.isArray(router.query._id) ? router.query._id[0] : router.query._id;
    const resolvedActivityId = String(activityId ?? queryActivityId ?? '');

    //#region USE EFFECT
    useEffect(() => {
        const getDataActivity = async () => {
            try {
                const responseActivity: any = await getActivityById(resolvedActivityId);
                if (responseActivity._id) {
                    setActivity(responseActivity);
                    setActivityName(responseActivity?.name ?? responseActivity?.title ?? '');
                    setActivityDescription(responseActivity?.description ?? '');
                    setActivityStatus(responseActivity?.status);
                    setActivityPriority(responseActivity?.priority);
                    setActivityStartDate(responseActivity?.startDate ? new Date(responseActivity?.startDate) : new Date());
                    setActivityEndDate(responseActivity?.endDate ? new Date(responseActivity?.endDate) : new Date());
                    setActivityAssignedUsers(responseActivity?.assignedUsers || []);
                }
            } catch (error) {
                setError(error.message);
            }
        };

        setActivityID(resolvedActivityId);
        if (resolvedActivityId && resolvedActivityId !== 'undefined' && resolvedActivityId !== 'null') {
            getDataActivity();
        }
    }, [resolvedActivityId]);

    useEffect(() => {
        if (activityName && activityDescription && activityStatus) {
            setValidateForm(true);
        }
    }, [activityName, activityDescription, activityStatus]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const activityResponse = await createActivity(
                activityID,
                activityName,
                activityDescription,
                activityStatus,
                activityStartDate,
                activityEndDate,
                activityAssignedUsers,
                activityPriority,
                user.name
            );
            if (activityResponse) {
                setSuccess('Actividad creada exitosamente');
                setActivity(activityClean);
            } else {
                setError('Error al crear la actividad');
            }
        } catch (error) {
            setError(error.message);
        }
    };

    const handleCancel = () => {
        router.push('/activity/activity-table');
    };

    return (
        <div className='w-full h-full px-4 mx-0'>
            <div className="hidden flex-col md:flex w-full mt-0">
                <div className="flex-1 space-y-4 pt-2">
                    <div className="flex items-center justify-between space-y-0">
                        <h2 className="text-3xl font-bold tracking-tight ml-2">Información general de actividades</h2>
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
                        Cree y gestione actividades, asigne usuarios y establezca prioridades
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!success && <form onSubmit={handleSubmit}>
                        <div className="space-y-8">
                            <div className="pb-0">
                                {isLoading && <div className="loading-container"><Loading /></div>}

                                <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-6">
                                    <div className="col-span-full">
                                        <label htmlFor="activityName" className="block text-sm font-medium leading-6 text-gray-900">
                                            {getSafeKeyFromStorage('Activity name')}
                                        </label>
                                        <div className="mt-2">
                                            <div className="bg-white flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600">
                                                <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">activity.name:</span>
                                                <input
                                                    type="text"
                                                    name="activityName"
                                                    id="activityName"
                                                    value={activityName}
                                                    onChange={(e) => {
                                                        setActivityName(e.target.value);
                                                    }}
                                                    className="block flex-1 border-0 bg-transparent py-1.5 pl-6 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                                                    placeholder="ejemplo: Reunión de equipo"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-span-full">
                                        <label htmlFor="activityDescription" className="block text-sm font-medium leading-6 text-gray-900">
                                            {getSafeKeyFromStorage('Description')}
                                        </label>
                                        <div className="mt-2">
                                            <textarea
                                                rows={2}
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                                name="activityDescription"
                                                id="activityDescription"
                                                value={activityDescription}
                                                onChange={(e) => {
                                                    setActivityDescription(e.target.value);
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-3">
                                        <label htmlFor="activityStatus" className="block text-sm font-medium leading-6 text-gray-900">
                                            {getSafeKeyFromStorage('Status')}
                                        </label>
                                        <div className="mt-2">
                                            <select
                                                id="activityStatus"
                                                name="activityStatus"
                                                value={activityStatus}
                                                onChange={(e) => setActivityStatus(e.target.value)}
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                            >
                                                <option value="Pending">Pendiente</option>
                                                <option value="In Progress">En Progreso</option>
                                                <option value="Completed">Completada</option>
                                                <option value="Cancelled">Cancelada</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="sm:col-span-3">
                                        <label htmlFor="activityPriority" className="block text-sm font-medium leading-6 text-gray-900">
                                            {getSafeKeyFromStorage('Priority')}
                                        </label>
                                        <div className="mt-2">
                                            <select
                                                id="activityPriority"
                                                name="activityPriority"
                                                value={activityPriority}
                                                onChange={(e) => setActivityPriority(e.target.value)}
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                            >
                                                <option value="Low">Baja</option>
                                                <option value="Medium">Media</option>
                                                <option value="High">Alta</option>
                                                <option value="Urgent">Urgente</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="sm:col-span-3">
                                        <label htmlFor="activityStartDate" className="block text-sm font-medium leading-6 text-gray-900">
                                            {getSafeKeyFromStorage('Start Date')}
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                type="date"
                                                name="activityStartDate"
                                                id="activityStartDate"
                                                value={activityStartDate ? new Date(activityStartDate).toISOString().split('T')[0] : ''}
                                                onChange={(e) => {
                                                    setActivityStartDate(new Date(e.target.value));
                                                }}
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                            />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-3">
                                        <label htmlFor="activityEndDate" className="block text-sm font-medium leading-6 text-gray-900">
                                            {getSafeKeyFromStorage('End Date')}
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                type="date"
                                                name="activityEndDate"
                                                id="activityEndDate"
                                                value={activityEndDate ? new Date(activityEndDate).toISOString().split('T')[0] : ''}
                                                onChange={(e) => {
                                                    setActivityEndDate(new Date(e.target.value));
                                                }}
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                            />
                                        </div>
                                    </div>

                                    <div className="col-span-full">
                                        <label htmlFor="activityAssignedUsers" className="block text-sm font-medium leading-6 text-gray-900">
                                            {getSafeKeyFromStorage('Assigned Users')}
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                type="text"
                                                name="activityAssignedUsers"
                                                id="activityAssignedUsers"
                                                value={activityAssignedUsers.join(', ')}
                                                onChange={(e) => {
                                                    setActivityAssignedUsers(e.target.value.split(',').map(user => user.trim()));
                                                }}
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                                placeholder="usuario1, usuario2, usuario3"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-end gap-x-6">
                                <button type="button" onClick={handleCancel} className="text-sm font-semibold leading-6 text-gray-900">
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={!validateForm}
                                    className={`rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${validateForm ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-400'}`}
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
                                <div className="ml-auto pl-3">
                                    <div className="-mx-1.5 -my-1.5">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSuccess('');
                                                router.push('/activity/activity-table');
                                            }}
                                            className="inline-flex rounded-md bg-green-50 p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-green-50"
                                        >
                                            <span className="sr-only">Dismiss</span>
                                            <ArrowCircleLeftIcon className="h-5 w-5" aria-hidden="true" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="rounded-md bg-red-50 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <CheckCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
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

export default ActivityComponent;
