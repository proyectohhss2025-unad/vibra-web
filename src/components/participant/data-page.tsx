'use client'

import { getAllParticipants, setParticipantActive } from '@/api/participant';
import { Participant } from '@/models/participant.entity';
import { User } from '@/models/user.entity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/registry/new-york/ui/card';
import { AuthContext } from '@/services/auth';
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
import './participant.css';
import Table from './table';
import ParticipantComponent from './participant';
import { useTabs } from '@/services/contexts/tabs-context';

const ParticipantDataPage: React.FC = () => {
  const user_: User = JSON.parse(getSafeKeyObjectFromStorage('user')) ?? {};
  const hiddenAPIDocumentation_: any = getSafeKeyFromStorage('hiddenAPIDocumentation') ?? false;

  const { openTab } = useTabs();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<Participant[]>([]);
  const [countData, setCountData] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [participantData, setParticipantData] = useState<any>();
  const [message, setMessage] = useState<string>('');
  const [hiddenAPIDocumentation, setHiddenAPIDocumentation] = useState<any>();

  const { token } = useContext(AuthContext);
  const router = useRouter();

  useEffect((): any => {
    setHiddenAPIDocumentation(hiddenAPIDocumentation_);
  }, [hiddenAPIDocumentation_]);

  useEffect((): any => {
    const fetchData = async () => {
      const { participants, count } = await getAllParticipants(currentPage, pageSize);
      setData(participants);
      setCountData(count);
    }

    fetchData();

    if (!token) {
      router.push('/layout');
    }

  }, [token, router, currentPage, pageSize, countData]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleEdit = (participant: Participant) => {
    openTab(
      `/Participante?_id=${participant?._id}&origin=participant`,
      "Participante",
      <ParticipantComponent participantId={participant?._id} />
    );
  };

  const handleActivate = async (participant: Participant) => {
    setShowModal(false);
    try {
      const response = await setParticipantActive(participant?._id ?? '', !participant?.isActive, user_.name);
      if (response) {
        setCountData(0);
        setMessage(`Participant ${response?.name} is update successful`);
      } else {
        setMessage('Error change status of participant');
      }
    } catch (error) {
      setMessage(error.message);
    }
  };

  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = (participant: Participant) => {
    setParticipantData(participant);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleNewParticipant = async () => {
    openTab(
      `/Participante`,
      "Participante",
      <ParticipantComponent participantId={undefined} />
    );
  };

  const handleNewParticipantUrl = async () => {
    // window.open('http://localhost:3001/api-docs/', '_blank');
  };

  return (
    <div className='w-full h-full px-4 pt-4'>
      <div className="hidden flex-col md:flex">
        <div className="flex-1 space-y-4 pt-2">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight ml-2">Panel general de gestión de participantes</h2>
            <div className="flex items-center space-x-2">
              {!hiddenAPIDocumentation && <div className="mt-0 pl-4">
                <button onClick={() => handleNewParticipantUrl()}
                  className="flex rounded-md bg-green-700 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                  <PlusCircleIcon name="check" className="h-5 w-8 text-white-500 leading-6" color="#FFFFFF" />
                  Documentation API
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
            <div>Participantes.</div>
            <div className="flex items-center justify-end sm:col-span-7">
              <div className="flex px-2 py-1">
                <Search isOpen={showModal} onClose={handleCloseModal} setData={setData} entity='participant' setIsLoading={setIsLoading}>
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
                <button onClick={() => handleNewParticipant()}
                  className="flex rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  <PlusCircleIcon name="check" className="h-5 w-8 text-white-500 leading-6" color="#FFFFFF" />
                  Agregar participante
                </button>
              </div>
            </div>
          </CardTitle>
          <CardDescription className='mt-0 mb-0' style={{ marginTop: '-16px' }}>
            Todos los usuarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table data={data} actions={[
            { name: 'Edit', handler: handleEdit, color: '#d1e7f2' },
            { name: 'Status', handler: handleOpenModal, color: 'white' }
          ]}>
            <th >Nombre</th>
            <th >Documento</th>
            <th >Dirección</th>
            <th >Telefono</th>
            <th >Email</th>
            <th >Usuario</th>
            <th >Paticipaciones</th>
          </Table>
          <Pagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={countData} // Total number of items (from API response)
            onPageChange={handlePageChange}
            setPageSize={setPageSize}
          />
        </CardContent>
      </Card>
      <Modal isOpen={showModal} onClose={handleCloseModal} classSize='max-w-md'>
        <div className="border-b border-gray-900/10 pb-12">
          <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="col-span-full flex items-center">
              <InformationCircleIcon name="mail" className="h-6 w-10 text-blue-500" color="#ff0000" />
              <p className="text-gray-500">You want to perform this action.</p>
            </div>
            <div className="col-span-full text-sm">
              <p className="text-gray-500">The configuration is {participantData?.isActive ? 'active' : 'inactive'}, do you want to {participantData?.isActive ? 'inactive' : 'active'} it?</p>
              <p className="text-gray-500 font-semibold">Yes to continue activate the customer with name:</p> <strong>{participantData?.name}</strong>
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-end gap-x-6">
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none pr-4">
              <ArrowCircleLeftIcon name="success" className="h-6 w-8 text-white" color="#FFFFFF" />
            </div>
            <button onClick={handleCloseModal} type="button" className="bg-gray-500 hover:bg-blue-500 rounded-md px-3 py-1.5 pl-12 text-sm font-semibold leading-6 text-white">
              Cancel
            </button>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none mr-4">
              <SaveAsIcon name="success" className="h-6 w-8 text-white-500" color="#FFFFFF" />
            </div>

            <button
              onClick={() => handleActivate(participantData)}
              className={`rounded-md bg-blue-600 px-3 py-2 pl-12 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600`}
            >
              Yes
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ParticipantDataPage;
