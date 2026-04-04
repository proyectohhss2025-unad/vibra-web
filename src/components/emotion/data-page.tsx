'use client'

import { setActive } from '@/api/emotion';
import { getCountAllNotifications } from '@/api/notification';
import { config } from '@/config/config';
import { Emotion } from '@/models/emotion.entity';
import { User } from '@/models/user.entity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/registry/new-york/ui/card';
import { AuthContext } from '@/services/auth';
import { useTabs } from '@/services/contexts/tabs-context';
import { getSafeKeyFromStorage, getSafeKeyObjectFromStorage } from '@/utils/safe-token-storage';
import { copyContent } from '@/utils/string';
import { ArrowCircleLeftIcon, InformationCircleIcon, PlusCircleIcon, RefreshIcon, SaveAsIcon } from '@heroicons/react/solid';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import "../../../app/globals.css";
import Modal from '../layouts/modal/modal';
import Search from '../search/search';
import Pagination from '../ui/table/pagination';
import CurrentDateTime from '../utils/current-datetime';
import './emotion.css';
import EmotionComponent from './emotion';
import Table from './table';

const environment = process.env.NODE_ENV || 'development';
const configAPI = {
    baseURL: config[environment].apiDashboard,
};

const EmotionDataPage: React.FC = () => {
    const user_: User = JSON.parse(getSafeKeyObjectFromStorage('user')) ?? {};
    const { token } = useContext(AuthContext);

    const [totalNotifications, setTotalNotifications] = useState<string | null>(null);
    const [showNotification, setShowNotification] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<Emotion[]>([]);
    const [countData, setCountData] = useState(1);
    const [message, setMessage] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);
    const [emotionData, setEmotionData] = useState<Emotion>({
        _id: '1',
        id: '',
        name: 'Emotion Test',
        orientationNote: '',
        description: '...',
        icono: '',
        percentNote: 0,
        createdBy: 'Yovany Suarez',
        createdAt: new Date(Date.now())
    });

    const router = useRouter();
    const { openTab } = useTabs();

    useEffect(() => {
        getCountAllNotifications()
            .then(data => setTotalNotifications(data?.countNotifications));
    }, []);

    useEffect((): any => {
        fetch(`${configAPI.baseURL}/api/emotions?page=${currentPage}&rows=${pageSize}`)
            .then((response) => {
                setShowNotification(true);
                return response.json();
            })
            .then((responseData) => {
                setCountData(responseData.total);
                return setData(responseData.data);
            });

        if (!token) {
            router.push('/layout');
        }

    }, [token, router, currentPage, pageSize, countData]);

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const handleEdit = (emotion: Emotion) => {
        const resolvedEmotionId = emotion?._id ? String(emotion._id) : '';
        if (!resolvedEmotionId) {
            return;
        }
        openTab(`/Emocion/${resolvedEmotionId}`, 'Editar emoción', <EmotionComponent emotionId={resolvedEmotionId} />);
    };

    const handleCopy = (emotion: Emotion) => {
        copyContent(emotion?._id ?? '');
    };

    const handleActivate = async (emotion: Emotion) => {
        setShowModal(false);
        try {
            const emotionResponse = await setActive(emotion?._id ?? '', !emotion?.isActive, user_.name);
            if (emotionResponse) {
                setCountData(0);
                setMessage('Status update successful');

            } else {
                setMessage('Error change status of emotion');
            }
        } catch (error) {
            setMessage(error.message);
        }
    };

    const [showModal, setShowModal] = useState(false);

    const handleOpenModal = (emotion: Emotion) => {
        setEmotionData(emotion);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleNewEmotion = () => {
        openTab(`/Emocion`, 'Nueva emoción', <EmotionComponent />);
    };

    return (
        <>
            <div className="hidden flex-col md:flex w-full mt-0">
                <div className="hidden flex-col w-full md:flex mt-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-3xl font-bold tracking-tight ml-3">Gestión de Emociones</h2>
                        <div className="flex items-center space-x-2">
                            <Card className="col-span-12 bg-white rounded-md px-2 pl-2 mb-0 pb-1">
                                <CurrentDateTime />
                            </Card>
                        </div>
                    </div>
                </div>
                <Card className="col-span-4 bg-white rounded-md w-full mt-3">
                    <CardHeader>
                        <CardTitle className='flex items-center justify-between' style={{ marginTop: '-16px' }}>
                            <div>Listado de emociones disponibles</div>
                            <div className="flex items-center justify-end sm:col-span-7">
                                <div className="flex px-2 py-1">
                                    <Search isOpen={showModal} onClose={handleCloseModal} setData={setData} entity='emotion' setIsLoading={setIsLoading}>
                                        <div className='flex justify-end align-items mb-3'>
                                            <RefreshIcon data-tooltip-id="my-tooltip-t"
                                                data-tooltip-content={getSafeKeyFromStorage('Refrescar esta lista')}
                                                className="justify-start h-7 w-7 text-blue-600 ml-4 mr-0 mt-3 cursor-pointer font-semibold hover:text-green"
                                                onClick={() => {
                                                    setCurrentPage(1);
                                                    setPageSize(12)
                                                }} />
                                        </div>
                                    </Search>
                                </div>
                                <div className="mt-1 pl-4">
                                    <button onClick={() => handleNewEmotion()}
                                        className="flex rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                    >
                                        <PlusCircleIcon name="check" className="h-5 w-8 text-white-500 leading-6" color="#FFFFFF" />
                                        Agregar emoción
                                    </button>
                                </div>
                            </div>
                        </CardTitle>
                        <CardDescription className='mt-0 mb-0' style={{ marginTop: '-16px' }}>
                            Gestione las emociones disponibles en el sistema. Puede agregar, editar o desactivar emociones según sea necesario.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table data={data} actions={[
                            { name: 'CopyID', handler: handleCopy, color: 'white' },
                            { name: 'Edit', handler: handleEdit, color: '#d1e7f2' },
                            { name: 'Status', handler: handleOpenModal, color: 'white' }]}>
                            <th>Nombre</th>
                            <th>Descripción</th>
                            <th>Orientación</th>
                            <th>Icono</th>
                            <th>Porcentaje</th>
                            <th>Activo</th>
                        </Table>
                        <Pagination
                            currentPage={currentPage}
                            pageSize={pageSize}
                            totalItems={countData}
                            onPageChange={handlePageChange}
                            setPageSize={setPageSize}
                        />
                    </CardContent>
                </Card>
            </div>
            <Modal isOpen={showModal} onClose={handleCloseModal} classSize='max-w-md'>
                <div className="border-b border-gray-900/10 pb-12">
                    <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                        <div className="col-span-full flex items-center">
                            <InformationCircleIcon name="info" className="h-6 w-10 text-blue-500" color="#ff0000" />
                            <p className="text-gray-500">¿Estás seguro de que quieres realizar esta acción?</p>
                        </div>
                        <div className="col-span-full text-sm">
                            <p className="text-gray-500">La configuración actual es {emotionData?.isActive ? 'activa' : 'inactiva'}, ¿quieres {emotionData?.isActive ? 'desactivar' : 'activar'}la?</p>
                            <p className="text-gray-500 font-semibold">Emoción:</p> <strong>{emotionData?.name}</strong>
                        </div>
                    </div>
                </div>
                <div className="mt-4 flex items-center justify-end gap-x-6">
                    <div className="relative">
                        <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none pr-4">
                            <ArrowCircleLeftIcon name="cancel" className="h-6 w-8 text-white" color="#FFFFFF" />
                        </div>
                        <button onClick={handleCloseModal} type="button"
                            className="bg-gray-500 hover:bg-blue-500 rounded-md px-3 py-1.5 pl-12 text-sm font-semibold leading-6 text-white">
                            Cancelar
                        </button>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none mr-4">
                            <SaveAsIcon name="confirm" className="h-6 w-8 text-white-500" color="#FFFFFF" />
                        </div>
                        <button onClick={() => handleActivate(emotionData)}
                            className="rounded-md bg-blue-600 px-3 py-2 pl-12 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                            Confirmar
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default EmotionDataPage;
