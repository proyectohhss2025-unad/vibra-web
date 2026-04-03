'use client'

import { getAllCompanies, setActive } from '@/api/company';
import { Company } from '@/models/company.entity';
import { User } from '@/models/user.entity';
import { AuthContext } from '@/services/auth';
import { getSafeKeyFromStorage, getSafeKeyObjectFromStorage } from '@/utils/safe-token-storage';
import { PlusCircleIcon } from '@heroicons/react/outline';
import { ArrowCircleLeftIcon, InformationCircleIcon, LibraryIcon, RefreshIcon, SaveAsIcon } from '@heroicons/react/solid';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import "../../../app/globals.css";
import Notification from '../layouts/icon/notification-inline';
import Modal from '../layouts/modal/modal';
import Search from '../search/search';
import Pagination from '../ui/table/pagination';
import './company.css';
import Table from './table';
import { useTabs } from '@/services/contexts/tabs-context';
import CompanyComponent from './company';

const CompanyDataPage: React.FC = () => {
  const user_: User = JSON.parse(getSafeKeyObjectFromStorage('user')) ?? {};
  const hiddenAPIDocumentation_: any = getSafeKeyFromStorage('hiddenAPIDocumentation') ?? false;

  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<Company[]>([]);
  const [countData, setCountData] = useState(1);
  const [message, setMessage] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [companyData, setCompanyData] = useState<any>();
  const [hiddenAPIDocumentation, setHiddenAPIDocumentation] = useState<any>();
  const [pendingTabUrl, setPendingTabUrl] = useState<string>('');

  const { token } = useContext(AuthContext);
  const router = useRouter();
  const { openTab } = useTabs();

  useEffect((): any => {
    setHiddenAPIDocumentation(hiddenAPIDocumentation_);
  }, [hiddenAPIDocumentation_]);

  useEffect((): any => {
    const fetchData = async () => {
      const { companies, length } = await getAllCompanies(currentPage, pageSize);
      setData(companies);
      setCountData(length);
    }

    fetchData();

    if (!token) {
      router.push('/layout');
    }

  }, [token, router, currentPage, pageSize, countData]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleEdit = (company: Company) => {
    //router.push(`/company/company?_id=${company._id}`);
    try {
      const resolvedCompanyId = company?._id ? String(company._id) : '';
      if (!resolvedCompanyId) {
        return;
      }
      openTab(`/Company/${resolvedCompanyId}`, 'Editar compañia', <CompanyComponent companyId={resolvedCompanyId} />);

    } catch (error) {
      console.error("Error opening edit tab:", error);
      setMessage('Error al abrir la pestaña de edición');
    }
  };

  const handleActivate = async (company: Company) => {
    setShowModal(false);
    try {
      const configResponse = await setActive(company?._id ?? '', !company?.isActive, user_.name);
      if (configResponse) {
        setCountData(0);
        setMessage('Status company is update successful');
      } else {
        setMessage('Error change status of company');
      }
    } catch (error) {
      setMessage(error.message);
    }
  };

  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = (company: Company) => {
    setCompanyData(company);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleNewCompany = async () => {
    router.push('/company/company');
  };

  const handleNewCompanyUrl = async () => {
    // window.open('http://localhost:3001/api-docs/', '_blank');
  };

  return (
    <div className='w-full h-full px-4'>
      <div className="col-span-full mt-2 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-12">
        <div className="flex items-center sm:col-span-3">
          <LibraryIcon
            style={{ float: 'left' }} name="permissionTemplate" className="mt-1 h-8 w-8 text-blue-500 mr-2" color="#EAEAEA" />
          <h1 className="h1-2 px-4 py-2">Instituciones Educativas</h1>
        </div>
        <div className="sm:col-span-2 mt-1">
          <Notification message={message} />
        </div>
        <div className="flex justify-end sm:col-span-7">
          <div className="flex px-1 py-1">
            <Search isOpen={showModal} onClose={handleCloseModal} setData={setData} entity='company' setIsLoading={setIsLoading}>
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
          <div className="sm:col-span-4 flex">
            <div className="mt-5 pl-4">
              <button onClick={() => handleNewCompany()}
                className="flex rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <PlusCircleIcon name="check" className="h-5 w-8 text-white-500 leading-6" color="#FFFFFF" />
                Add company
              </button>
            </div>
            {!hiddenAPIDocumentation && <div className="mt-5 pl-4">
              <button onClick={() => handleNewCompanyUrl()}
                className="flex rounded-md bg-green-700 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <PlusCircleIcon name="check" className="h-5 w-8 text-white-500 leading-6" color="#FFFFFF" />
                Documentation API
              </button>
            </div>}
          </div>
        </div>
      </div>
      <Table data={data} actions={[{ name: 'Edit', handler: handleEdit, color: '#d1e7f2' }, { name: 'Status', handler: handleOpenModal, color: 'white' }]}>
        <th >Name</th>
        <th >Document</th>
        <th >Address</th>
        <th >Phone number</th>
        <th >Email</th>
        <th >Manager</th>
        <th >User admin</th>
        <th >Is main</th>
      </Table>
      <Pagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={countData}
        onPageChange={handlePageChange}
        setPageSize={setPageSize}
      />
      <Modal isOpen={showModal} onClose={handleCloseModal} classSize='max-w-md'>
        <div className="border-b border-gray-900/10 pb-12">
          <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="col-span-full flex items-center">
              <InformationCircleIcon name="mail" className="h-6 w-10 text-blue-500" color="#ff0000" />
              <p className="text-gray-500">You want to perform this action.</p>
            </div>
            <div className="col-span-full text-sm">
              <p className="text-gray-500">The configuration is {companyData?.isActive ? 'active' : 'inactive'}, do you want to {companyData?.isActive ? 'inactive' : 'active'} it?</p>
              <p className="text-gray-500 font-semibold">Yes to continue activate the company with name:</p> <strong>{companyData?.name}</strong>
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
              onClick={() => handleActivate(companyData)}
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

export default CompanyDataPage;