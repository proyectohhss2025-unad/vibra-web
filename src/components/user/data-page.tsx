'use client'

import { getAll } from '@/api/user';
import { DocumentType } from "@/models/documentType.entity";
import { Role } from '@/models/role.entity';
import { User } from '@/models/user.entity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/registry/new-york/ui/card';
import { AuthContext } from '@/services/auth';
import { useTabs } from '@/services/contexts/tabs-context';
import { getSafeKeyFromStorage, getSafeKeyObjectFromStorage } from '@/utils/safe-token-storage';
import { PlusCircleIcon } from '@heroicons/react/outline';
import { ArrowCircleLeftIcon, InformationCircleIcon, RefreshIcon, SaveAsIcon } from '@heroicons/react/solid';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import "../../../app/globals.css";
import Modal from '../layouts/modal/modal';
import Search from '../search/search';
import Pagination from '../ui/table/pagination';
import CurrentDateTime from '../utils/current-datetime';
import Table from './table';
import UserComponent from './user';
import './user.css';

const UserDataPage: React.FC = () => {
  const hiddenAPIDocumentation_: any = getSafeKeyFromStorage('hiddenAPIDocumentation') ?? false;
  const user_: User = JSON.parse(getSafeKeyObjectFromStorage('user')) ?? {};
  const { token, otp, mainCompany } = useContext(AuthContext);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<User[]>([]);
  const [countData, setCountData] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [hiddenAPIDocumentation, setHiddenAPIDocumentation] = useState<any>();

  const router = useRouter();
  const { openTab } = useTabs();

  const [userData, setUserData] = useState<User>({
    _id: '1',
    userId: '',
    password: '',
    name: 'User Test',
    email: '',
    documentType: {} as unknown as DocumentType,
    documentNumber: '',
    address: '',
    phoneNumber: '',
    username: '',
    role: {} as unknown as Role,
    createdAt: new Date(),
    createdBy: '',
    isLogged: false
  });

  useEffect((): any => {
    setHiddenAPIDocumentation(hiddenAPIDocumentation_);
  }, [hiddenAPIDocumentation_]);

  useEffect(() => {
    setIsAuthenticated(!!token && !!otp);
  }, [token, otp]);

  useEffect((): any => {
    const fetchData = async () => {
      const { data, total } = await getAll(currentPage, pageSize);
      setData(data);
      setCountData(total);
    }

    fetchData();

    if (!token) {
      router.push('/layout');
    }

  }, [token, router, currentPage, pageSize, countData]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleEdit = (user: User) => {
    router.push(`/user/user?_id=${user._id}`);
  };

  const handleActivate = (user: User) => {
    setShowModal(false);
    console.log(`Deleting record with ID: ${user._id}`);
  };

  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = (user: User) => {
    setUserData(user);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleNewUser = async () => {
    openTab(
      `/Usuario`,
      "Usuario",
      <UserComponent />
    );
  };

  const handleNewUserUrl = async () => {
    // window.open('http://localhost:3001/api-docs/', '_blank');
  };

  return (
    <div className='w-full h-full px-4 pt-4'>
      <div className="hidden flex-col md:flex">
        <div className="flex-1 space-y-4 pt-2">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight ml-2">Panel general de gestión de usuarios</h2>
            <div className="flex items-center space-x-2">
              {!hiddenAPIDocumentation && <div className="mt-0 pl-4">
                <button onClick={() => handleNewUserUrl()}
                  className="flex rounded-md bg-green-700 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  <PlusCircleIcon name="check" className="h-5 w-8 text-white-500 leading-6" color="#FFFFFF" />
                  Documentación de API de usuarios
                </button>
              </div>}
              <Card className="col-span-12 bg-white rounded-md px-2 pl-2 pb-1">
                <CurrentDateTime />
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Card className="col-span-4 bg-white rounded-md w-full mt-3">
        <CardHeader>
          <CardTitle className='flex items-center justify-between' style={{ marginTop: '-16px' }} >
            <div>Usuarios</div>
            <div className="flex items-center justify-end sm:col-span-7">
              <div className="flex px-2 py-1">
                <Search isOpen={showModal} onClose={handleCloseModal} setData={setData} entity='user' setIsLoading={setIsLoading}>
                  <div className='flex justify-end align-items mb-3'>
                    <RefreshIcon data-tooltip-id="my-tooltip-t"
                      data-tooltip-content="Refrescar esta lista"
                      className="justify-start h-7 w-7 text-blue-600 ml-4 mr-0 mt-3 cursor-pointer font-semibold hover:text-green"
                      onClick={() => {
                        setCurrentPage(1);
                        setPageSize(12)
                      }} />
                  </div>
                </Search>
              </div>
              <div className="mt-1 pl-4">
                <button onClick={() => handleNewUser()}
                  className="flex rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  <PlusCircleIcon name="check" className="h-5 w-8 text-white-500 leading-6" color="#FFFFFF" />
                  Agregar usuario
                </button>
              </div>
            </div>
          </CardTitle>
          <CardDescription className='mt-0 mb-0' style={{ marginTop: '-16px' }}>
            Todos los usuarios del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table data={data} actions={[
            { name: 'Editar', handler: handleEdit, color: '#d1e7f2' },
            { name: 'Estado', handler: handleOpenModal, color: 'white' }
          ]}>
            <th >{'Nombre'}</th>
            <th >{'Correo electrónico'}</th>
            <th >{'Tipo de documento'}</th>
            <th >{'Número de documento'}</th>
            <th >{'Dirección de correo'}</th>
            <th >{'Nombre de usuario'}</th>
            <th >{'Usuario'}</th>
            <th >{'Rol'}</th>
            <th >{'Institución'}</th>
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
      {/* <UserDashboard />*/}
      <Modal isOpen={showModal} onClose={handleCloseModal} classSize='max-w-md'>
        <div className="border-b border-gray-900/10 pb-12">
          <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="col-span-full flex items-center">
              <InformationCircleIcon name="mail" className="h-6 w-10 text-blue-500" color="#ff0000" />
              <p className="text-gray-500">¿Estás seguro de que quieres realizar esta acción?</p>
            </div>
            <div className="col-span-full text-sm">
              <p className="text-gray-500">La configuración actual es {userData?.isActive ? 'activa' : 'inactiva'}, quieres {userData?.isActive ? 'desactivar' : 'activar'}la?</p>
              <p className="text-gray-500 font-semibold">Si para continuar activar el usuario con nombre de:</p> <strong>{userData?.name}</strong>
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-end gap-x-6">
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none pr-4">
              <ArrowCircleLeftIcon name="success" className="h-6 w-8 text-white" color="#FFFFFF" />
            </div>
            <button onClick={handleCloseModal} type="button" className="bg-gray-500 hover:bg-blue-500 rounded-md px-3 py-1.5 pl-12 text-sm font-semibold leading-6 text-white">
              Cancelar
            </button>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none mr-4">
              <SaveAsIcon name="success" className="h-6 w-8 text-white-500" color="#FFFFFF" />
            </div>
            <button
              onClick={() => handleActivate(userData)}
              className={`rounded-md bg-blue-600 px-3 py-2 pl-12 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600`}
            >
              Si
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserDataPage;
