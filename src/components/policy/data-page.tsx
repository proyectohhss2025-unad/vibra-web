'use client'

import { getAllPolicies, updatePolicyStatus, acceptPolicy } from '@/api/policy';
import { getCountAllNotifications } from '@/api/notification';
import { config } from '@/config/config';
import { Policy } from '@/models/policy.entity';
import { User } from '@/models/user.entity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/registry/new-york/ui/card';
import { AuthContext } from '@/services/auth';
import { useTabs } from '@/services/contexts/tabs-context';
import { getSafeKeyFromStorage, getSafeKeyObjectFromStorage } from '@/utils/safe-token-storage';
import { copyContent } from '@/utils/string';
import { PlusCircleIcon, RefreshIcon } from '@heroicons/react/solid';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import "../../../app/globals.css";
import Modal from '../layouts/modal/modal';
import Search from '../search/search';
import Pagination from '../ui/table/pagination';
import CurrentDateTime from '../utils/current-datetime';
import PolicyComponent from './policy';
import Table from './table';

const environment = process.env.NODE_ENV || 'development';
const configAPI = {
    baseURL: config[environment].apiDashboard,
};

const PolicyDataPage: React.FC = () => {
    const user_: User = JSON.parse(getSafeKeyObjectFromStorage('user')) ?? {};
    const { token } = useContext(AuthContext);

    const [totalNotifications, setTotalNotifications] = useState<string | null>(null);
    const [showNotification, setShowNotification] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<Policy[]>([]);
    const [countData, setCountData] = useState(1);
    const [message, setMessage] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);
    const [policyData, setPolicyData] = useState<Policy>({
        _id: '',
        name: '',
        description: '',
        content: '',
        category: '',
        isActive: true,
        createdBy: '',
        createdAt: new Date(),
    });

    const router = useRouter();
    const { openTab } = useTabs();

    useEffect(() => {
        getCountAllNotifications()
            .then(data => setTotalNotifications(data?.countNotifications));
    }, []);

    useEffect((): any => {
        setIsLoading(true);
        getAllPolicies(currentPage, pageSize)
            .then((response) => {
                setShowNotification(true);
                setCountData(response.count);
                setData(response.policies);
            })
            .finally(() => setIsLoading(false));

        if (!token) {
            router.push('/layout');
        }
    }, [token, router, currentPage, pageSize, countData]);

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const handleEdit = (policy: Policy) => {
        const resolvedPolicyId = policy?._id ? String(policy._id) : '';
        if (!resolvedPolicyId) return;
        openTab(`/Policy/${resolvedPolicyId}`, 'Editar política', <PolicyComponent policyId={resolvedPolicyId} />);
    };

    const handleCopy = (policy: Policy) => {
        copyContent(policy?._id ?? '');
    };

    const handleAccept = async (policy: Policy) => {
        const userId = (user_ as any)?._id ?? '';
        if (!userId) return;
        await acceptPolicy(String(policy._id), userId);
    };

    const handleUpdateStatus = async (policy: Policy) => {
        setShowModal(false);
        try {
            const newStatus = policy.isActive ? 'false' : 'true';
            const policyResponse = await updatePolicyStatus(policy?._id ?? '', newStatus);
            if (policyResponse) {
                setCountData(0);
                setMessage('Estado de la política actualizado correctamente');
            } else {
                setMessage('Error al cambiar el estado de la política');
            }
        } catch (error) {
            setMessage(error.message);
        }
    };

    const [showModal, setShowModal] = useState(false);

    const handleOpenModal = (policy: Policy) => {
        setPolicyData(policy);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleNewPolicy = () => {
        openTab(`/Policy`, 'Nueva política', <PolicyComponent />);
    };

    return (
        <>
            <div className="hidden flex-col md:flex w-full mt-0">
                <div className="hidden flex-col w-full md:flex mt-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-3xl font-bold tracking-tight ml-3">Gestión de Políticas</h2>
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
                            <div>Lista de Políticas</div>
                            <div className="flex items-center justify-end sm:col-span-7">
                                <div className="flex px-2 py-1">
                                    <Search isOpen={showModal} onClose={handleCloseModal} setData={setData} entity='policy' setIsLoading={setIsLoading}>
                                        <div className='flex justify-end align-items mb-3'>
                                            <RefreshIcon
                                                data-tooltip-id="my-tooltip-t"
                                                data-tooltip-content={getSafeKeyFromStorage('Refrescar esta lista')}
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
                                        onClick={() => handleNewPolicy()}
                                        className="flex rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                    >
                                        <PlusCircleIcon name="check" className="h-5 w-8 text-white-500 leading-6" color="#FFFFFF" />
                                        Agregar política
                                    </button>
                                </div>
                            </div>
                        </CardTitle>
                        <CardDescription className='mt-0 mb-0' style={{ marginTop: '-16px' }}>
                            Gestione las políticas del sistema y actualice estados.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table data={data} actions={[
                            { name: 'CopyID', handler: handleCopy, color: 'white' },
                            { name: 'Accept', handler: handleAccept, color: 'white' },
                            { name: 'Edit', handler: handleEdit, color: '#d1e7f2' },
                            { name: 'Status', handler: handleOpenModal, color: 'white' }]}>
                            <th>Nombre</th>
                            <th>{getSafeKeyFromStorage('Description')}</th>
                            <th>Categoría</th>
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
            <Modal isOpen={showModal} onClose={handleCloseModal}>
                <div className="p-4">
                    <h2 className="text-xl font-bold mb-4">Confirmar cambio de estado</h2>
                    <p>¿Está seguro que desea cambiar el estado de la política &quot;{policyData.name}&quot;?</p>
                    <p className="mt-2 text-sm text-gray-500">
                        {policyData?.isActive
                            ? 'La política será desactivada y no estará disponible para su uso.'
                            : 'La política será activada y estará disponible para su uso.'}
                    </p>
                    <div className="flex justify-end mt-4">
                        <button
                            className="mr-2 px-4 py-2 bg-gray-300 rounded-md"
                            onClick={handleCloseModal}
                        >
                            Cancelar
                        </button>
                        <button
                            className="px-4 py-2 bg-blue-600 text-white rounded-md"
                            onClick={() => handleUpdateStatus(policyData)}
                        >
                            Confirmar
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default PolicyDataPage;
