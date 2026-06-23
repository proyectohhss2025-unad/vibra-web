'use client'

import { getAll } from '@/api/preTest';
import { getCountAllNotifications } from '@/api/notification';
import { config } from '@/config/config';
import { PreTestResponse } from '@/models/preTest.entity';
import { User } from '@/models/user.entity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/registry/new-york/ui/card';
import { AuthContext } from '@/services/auth';
import { useTabs } from '@/services/contexts/tabs-context';
import { getSafeKeyObjectFromStorage } from '@/utils/safe-token-storage';
import { useTranslation } from 'react-i18next';
import { copyContent } from '@/utils/string';
import { ArrowCircleLeftIcon, PlusCircleIcon, RefreshIcon } from '@heroicons/react/solid';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import "../../../app/globals.css";
import Modal from '../layouts/modal/modal';
import Search from '../search/search';
import Pagination from '../ui/table/pagination';
import CurrentDateTime from '../utils/current-datetime';
import './preTest.css';
import PreTestComponent from './preTest';
import Table from './table';

const environment = process.env.NODE_ENV || 'development';
const configAPI = {
    baseURL: config[environment].apiDashboard,
};

const PreTestDataPage: React.FC = () => {
    const { t } = useTranslation();
    const user_: User = JSON.parse(getSafeKeyObjectFromStorage('user')) ?? {};
    const { token } = useContext(AuthContext);

    const [totalNotifications, setTotalNotifications] = useState<string | null>(null);
    const [showNotification, setShowNotification] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<PreTestResponse[]>([]);
    const [countData, setCountData] = useState(1);
    const [message, setMessage] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);
    const [preTestData, setPreTestData] = useState<PreTestResponse>({
        testId: '',
        userId: '',
        responses: [],
        totalScore: 0,
    });

    const router = useRouter();
    const { openTab } = useTabs();

    useEffect(() => {
        getCountAllNotifications()
            .then(data => setTotalNotifications(data?.countNotifications));
    }, []);

    useEffect((): any => {
        setIsLoading(true);
        getAll(currentPage, pageSize)
            .then((response) => {
                setShowNotification(true);
                setCountData(response.count);
                setData(response.preTests);
            })
            .finally(() => setIsLoading(false));

        if (!token) {
            router.push('/layout');
        }
    }, [token, router, currentPage, pageSize, countData]);

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const handleEdit = (preTest: PreTestResponse) => {
        const resolvedPreTestId = preTest?._id ? String(preTest._id) : '';
        if (!resolvedPreTestId) return;
        openTab(`/PreTest/${resolvedPreTestId}`, 'Editar PreTest', <PreTestComponent preTestId={resolvedPreTestId} />);
    };

    const handleCopy = (preTest: PreTestResponse) => {
        copyContent(preTest?._id ?? '');
    };

    const handleUpdateStatus = async (preTest: PreTestResponse) => {
        setShowModal(false);
        try {
            setMessage('Estado del preTest actualizado correctamente');
        } catch (error) {
            setMessage(error.message);
        }
    };

    const [showModal, setShowModal] = useState(false);

    const handleOpenModal = (preTest: PreTestResponse) => {
        setPreTestData(preTest);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleNewPreTest = () => {
        openTab(`/PreTest`, 'Nuevo PreTest', <PreTestComponent />);
    };

    return (
        <>
            <div className="hidden flex-col md:flex w-full mt-0">
                <div className="hidden flex-col w-full md:flex mt-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-3xl font-bold tracking-tight ml-3">Gestión de Pre-Tests</h2>
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
                            <div>Lista de Pre-Tests</div>
                            <div className="flex items-center justify-end sm:col-span-7">
                                <div className="flex px-2 py-1">
                                    <Search isOpen={showModal} onClose={handleCloseModal} setData={setData} entity='preTest' setIsLoading={setIsLoading}>
                                        <div className='flex justify-end align-items mb-3'>
                                            <RefreshIcon
                                                data-tooltip-id="my-tooltip-t"
                                                data-tooltip-content={t('common.refreshList')}
                                                className="justify-start h-7 w-7 text-blue-600 ml-4 mr-0 mt-3 cursor-pointer font-semibold hover:text-green"
                                                onClick={() => {
                                                    setCurrentPage(1);
                                                    setPageSize(12);
                                                }} />
                                        </div>
                                    </Search>
                                </div>
                                <div className="mt-1 pl-4">
                                    <button
                                        onClick={() => handleNewPreTest()}
                                        className="flex rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                    >
                                        <PlusCircleIcon name="check" className="h-5 w-8 text-white-500 leading-6" color="#FFFFFF" />
                                        Agregar Pre-Test
                                    </button>
                                </div>
                            </div>
                        </CardTitle>
                        <CardDescription className='mt-0 mb-0' style={{ marginTop: '-16px' }}>
                            Gestione sus pre-tests, configure preguntas y actualice estados.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table data={data} actions={[
                            { name: 'CopyID', handler: handleCopy, color: 'white' },
                            { name: 'Edit', handler: handleEdit, color: '#d1e7f2' }]}>
                            <th>Test ID</th>
                            <th>Usuario</th>
                            <th>Respuestas</th>
                            <th>Puntaje total</th>
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
            <Modal isOpen={showModal} onClose={handleCloseModal}>
                <div className="p-4">
                    <h2 className="text-xl font-bold mb-4">Detalle de respuestas</h2>
                    <p className="text-sm text-gray-600 mb-1"><span className="font-medium">Test ID:</span> {preTestData.testId}</p>
                    <p className="text-sm text-gray-600 mb-3"><span className="font-medium">Usuario:</span> {preTestData.userId}</p>
                    <table className="min-w-full text-sm border rounded-md">
                        <thead className="bg-gray-100 border-b">
                            <tr>
                                <th className="text-left px-3 py-1">Pregunta</th>
                                <th className="text-left px-3 py-1">Respuesta</th>
                                <th className="text-left px-3 py-1">Puntos</th>
                            </tr>
                        </thead>
                        <tbody>
                            {preTestData.responses?.map((r, i) => (
                                <tr key={i} className="border-b hover:bg-blue-50">
                                    <td className="px-3 py-1">{r.questionId}</td>
                                    <td className="px-3 py-1">{r.answer}</td>
                                    <td className="px-3 py-1">{r.points}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <p className="mt-3 text-sm font-semibold text-right">Puntaje total: {preTestData.totalScore}</p>
                    <div className="flex justify-end mt-4">
                        <button className="px-4 py-2 bg-gray-300 rounded-md" onClick={handleCloseModal}>
                            Cerrar
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default PreTestDataPage;
