'use client'

import { setActive } from '@/api/config';
import { getCountAllNotifications } from '@/api/notification';
import { config } from '@/config/config';
import { Config } from '@/models/config.entity';
import { User } from '@/models/user.entity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/registry/new-york/ui/card';
import { AuthContext } from '@/services/auth';
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
import './config.css';
import Table from './table';

const environment = process.env.NODE_ENV || 'development';
const configAPI = {
  baseURL: config[environment].apiDashboard,
};

const ConfigDataPage: React.FC = () => {
  const user_: User = JSON.parse(getSafeKeyObjectFromStorage('user')) ?? {};
  const { token } = useContext(AuthContext);

  const [totalNotifications, setTotalNotifications] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<Config[]>([]);
  const [countData, setCountData] = useState(1);
  const [message, setMessage] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [hiddenAPIDocumentation, setHiddenAPIDocumentation] = useState<any>();
  const [configData, setConfigData] = useState<Config>({
    _id: '1',
    name: 'Config Test',
    description: '...',
    flag: true,
    allowedUsers: [],
    disallowedUsers: [],
    createdBy: 'Yovany Suarez',
    createdAt: new Date(Date.now())
  });

  const router = useRouter();

  useEffect(() => {
    getCountAllNotifications()
      .then(data => setTotalNotifications(data?.countNotifications));
  }, []);

  useEffect((): any => {
    fetch(`${configAPI.baseURL}/api/config/flags?page=${currentPage}&rows=${pageSize}`)
      .then((response) => {
        setShowNotification(true);
        return response.json();
      })
      .then((responseData) => {
        setCountData(responseData.configs.length);
        return setData(responseData.configs);
      });

    if (!token) {
      router.push('/layout');
    }

  }, [token, router, currentPage, pageSize, countData]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleEdit = (config: Config) => {
    router.push(`/config/config?_id=${config._id}`);
  };

  const handleCopy = (config: Config) => {
    copyContent(config?._id ?? '');
  };

  const handleActivate = async (config: Config) => {
    setShowModal(false);
    try {
      const configResponse = await setActive(config?._id ?? '', !config?.isActive, user_.name);
      if (configResponse) {
        setCountData(0);
        setMessage('Status update successful');

      } else {
        setMessage('Error change status of configuration');
      }
    } catch (error) {
      setMessage(error.message);
    }
  };

  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = (config: Config) => {
    setConfigData(config);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleDocsConfig = async () => {
    //window.open('http://localhost:3001/api-docs/', '_blank');
  };

  const handleNewConfig = () => {
    router.push(`/config/config`);
  };

  return (
    <>
      <div className="hidden flex-col md:flex w-full mt-0">
        <div className="hidden flex-col w-full md:flex mt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight ml-3">Configuración de caracteristicas</h2>
            <div className="flex items-center space-x-2">
              {!hiddenAPIDocumentation && <div className="mt-0 pl-4">
                <button onClick={() => handleDocsConfig()}
                  className="flex rounded-md bg-green-700 mt-0 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                  <PlusCircleIcon name="check" className="h-5 w-8 text-white-500 leading-6" color="#FFFFFF" />
                  {getSafeKeyFromStorage('Documentation API')}
                </button>
              </div>}
              <Card className="col-span-12 bg-white rounded-md px-2 pl-2 mb-0 pb-1">
                <CurrentDateTime />
              </Card>
            </div>
          </div>
        </div>
        {/*<div className="sm:col-span-1 mt-1">
          <Notification message={message} />
        </div>*/}
        <Card className="col-span-4 bg-white rounded-md w-full mt-3">
          <CardHeader>
            <CardTitle className='flex items-center justify-between' style={{ marginTop: '-16px' }}>
              <div>Banderas para encendido y apagado de caracteristicas</div>
              <div className="flex items-center justify-end sm:col-span-7">
                <div className="flex px-2 py-1">
                  <Search isOpen={showModal} onClose={handleCloseModal} setData={setData} entity='activity' setIsLoading={setIsLoading}>
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
                  <button onClick={() => handleNewConfig()}
                    className="flex rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    <PlusCircleIcon name="check" className="h-5 w-8 text-white-500 leading-6" color="#FFFFFF" />
                    Agregar configuración
                  </button>
                </div>
              </div>
            </CardTitle>
            <CardDescription className='mt-0 mb-0' style={{ marginTop: '-16px' }}>
              Agregue o elimine usuarios de las listas permitidas y no permitidas. <br></br>Algunas banderas operan unicamente como configuraciones generales para todos los usuarios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table data={data} actions={[
              { name: 'CopyID', handler: handleCopy, color: 'white' },
              { name: 'Edit', handler: handleEdit, color: '#d1e7f2' },
              { name: 'Status', handler: handleOpenModal, color: 'white' }]}>
              <th>{getSafeKeyFromStorage('Name')}</th>
              <th>{getSafeKeyFromStorage('Description')}</th>
              <th>{getSafeKeyFromStorage('Allowed users')}</th>
              <th>{getSafeKeyFromStorage('Disallowed users')}</th>
              <th>{getSafeKeyFromStorage('Flag')}</th>
              <th>{getSafeKeyFromStorage('Active')}</th>
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
      {/*<div className="hidden flex-col md:flex w-full">
        <div className="flex justify-end sm:col-span-7">
          <div className="flex px-3 py-2">
            <Search isOpen={showModal} size={10} onClose={handleCloseModal} setData={setData} entity='config' setIsLoading={setIsLoading}>
              <div className='flex justify-end align-items mb-3'>
                <RefreshIcon data-tooltip-id="my-tooltip-t"
                  data-tooltip-content="Refrescar esta lista"
                  className="justify-start h-7 w-7 text-blue-600 mt-0 ml-4 mr-0 mt-3 cursor-pointer font-semibold hover:text-green"
                  onClick={() => {
                    setCurrentPage(1);
                    setPageSize(12)
                  }} />
              </div>
            </Search>
          </div>
          <div className="sm:col-span-5 flex">
            <div className="mt-5 pl-4">
              <button onClick={() => handleNewConfig()}
                className="flex rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <PlusCircleIcon name="check" className="h-5 w-8 text-white-500 leading-6" color="#FFFFFF" />
                Agregar configuración
              </button>
            </div>
            <div className="mt-5 pl-4">
              <button onClick={() => handleNewConfigUrl()}
                className="flex rounded-md bg-green-700 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <PlusCircleIcon name="check" className="h-5 w-8 text-white-500 leading-6" color="#FFFFFF" />
                API Docs
              </button>
            </div>
          </div>
        </div>
      </div>*/}
      <Modal isOpen={showModal} onClose={handleCloseModal} classSize='max-w-md'>
        <div className="border-b border-gray-900/10 pb-12">
          <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="col-span-full flex items-center">
              <InformationCircleIcon name="mail" className="h-6 w-10 text-blue-500" color="#ff0000" />
              <p className="text-gray-500">You want to perform this action.</p>
            </div>
            <div className="col-span-full text-sm">
              <p className="text-gray-500">The configuration is {configData.isActive ? 'active' : 'inactive'}, do you want to {configData.isActive ? 'inactive' : 'active'} it?</p>
              <p className="text-gray-500 font-semibold">Yes to continue activate the config with name:</p> <strong>{configData.name}</strong>
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-end gap-x-6">
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none pr-4">
              <ArrowCircleLeftIcon name="success" className="h-6 w-8 text-white" color="#FFFFFF" />
            </div>
            <button onClick={handleCloseModal} type="button" className="bg-gray-500 hover:bg-blue-500 rounded-md px-3 py-1.5 pl-12 text-sm font-semibold leading-6 text-white">
              {getSafeKeyFromStorage('Cancel')}
            </button>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none mr-4">
              <SaveAsIcon name="success" className="h-6 w-8 text-white-500" color="#FFFFFF" />
            </div>

            <button
              onClick={() => handleActivate(configData)}
              className={`rounded-md bg-blue-600 px-3 py-2 pl-12 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600`}
            >
              {getSafeKeyFromStorage('Yes')}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ConfigDataPage;