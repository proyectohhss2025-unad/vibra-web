'use client'

import { getConfigById, hasAccessToConfig } from '@/api/config';
import { getAllCategories, getAllPermissions, getAllPermissionsByCategory, softDeletePermission, updateStatusPermission } from '@/api/permission';
import { Permission } from '@/models/permission.entity';
import { PermissionCategory } from '@/models/permissionCategory.entity';
import { User } from '@/models/user.entity';
import { AuthContext } from '@/services/auth';
import { getSafeKeyObjectFromStorage } from '@/utils/safe-token-storage';
import { FolderAddIcon, KeyIcon, StatusOnlineIcon } from '@heroicons/react/outline';
import { CheckIcon, DocumentAddIcon, InformationCircleIcon, RefreshIcon } from '@heroicons/react/solid';
import axios from 'axios';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import "../../../app/globals.css";
import logger from '../../config/logger-dev';
import Notification from '../layouts/icon/notification-inline';
import DropdownMenuButton from '../layouts/menu/dropdown-menu-button';
import Modal from '../layouts/modal/modal';
import Search from '../search/search';
import Pagination from '../ui/table/pagination';
import Table from './table';
import './table.css';

import { config } from '@/config/config';
const environment = process.env.NODE_ENV || 'development';
const configAPI = {
  baseURL: config[environment].apiDashboard,
};

const PermissionDataPage: React.FC = () => {
  const { token, user } = useContext(AuthContext);
  const user_: User = JSON.parse(getSafeKeyObjectFromStorage('user')) ?? {};
  const [isLoading, setIsLoading] = useState(false);
  const [labelSelected, setLabelSelected] = useState<string>('Select category');
  const [optionsPermissionsCategory, setOptionsPermissionsCategory] = useState<any[]>([]);

  const [data, setData] = useState<Permission[]>([]);
  const [countData, setCountData] = useState(1);
  const [hiddenAPIDocumentation, setHiddenAPIDocumentation] = useState<boolean>(false);
  const [userSession, setUserSession] = useState<any>(user_);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [permissionData, setPermissionData] = useState<Permission>({
    _id: '',
    serial: '',
    name: '',
    description: '',
    permissionCategory: new PermissionCategory(),
    isActive: true,
    createdAt: new Date(Date.now()),
    createdBy: user_.name,
    isAssigned: false
  });

  const [showModal, setShowModal] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [message, setMessage] = useState<string>('');

  const [idPermissionCategorySelected, setIdPermissionCategorySelected] = useState<string | null>();
  const [permissionsCategory, setPermissionsCategory] = useState<PermissionCategory[]>([]);
  const [error, setError] = useState('');
  const [permissions, setPermissions] = useState<Permission[]>(data);

  const router = useRouter();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const processResponse = await getAllCategories(1, 50);
        if (processResponse) {
          setPermissionsCategory(processResponse.permissionsCategory);

          processResponse.permissionsCategory.forEach((element: PermissionCategory, index) => {
            optionsPermissionsCategory?.push({ _id: element._id, description: element?.description, name: element.name, value: index, label: element.name, icon: 'CheckCircleIcon' });
          });
          setOptionsPermissionsCategory(optionsPermissionsCategory);
        }
      } catch (error) {
        setError(error.message);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      // #region CONFIG
      const configResponse = await getConfigById('6663674b5d58c8a6a2bc67ce');
      if (!configResponse) {
        logger.warn('Config not found');
        return;
      }
      const hasAccess = await hasAccessToConfig(configResponse._id, userSession.documentNumber);
      //#endregion 
      if (hasAccess) {
        // logger.info('The user does have permission for access to API documentation');
        setHiddenAPIDocumentation(true);
      }
    }
    fetchData();
  }, [userSession]);

  useEffect((): any => {

    const fetchData = async () => {
      const { permissions, length } = await getAllPermissions(currentPage, pageSize);
      setData(permissions);
      setCountData(length);
    }

    fetchData();

    if (!token) {
      router.push('/layout');
    }

  }, [token, router, currentPage, pageSize, showModalDelete]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleEdit = (permission: Permission) => {
    router.push(`/permission/permission?_id=${permission._id
      }&serial=${permission.serial}&name=${permission.name}&description=${permission.description
      }&isActive=${permission.isActive}&permissionCategory=${permission.permissionCategory?._id}`);
    /* router.push('/permission/permission', { 
      query: { 
        _id: permission._id, 
        permissionNumber: permission.permissionNumber, 
        totalValue: permission.totalValue, 
        dateIssue: permission.dateIssue, 
        expirationDate: permission.expirationDate, 
        permissionStatus: permission.permissionStatus?.name
      } 
    }); */
    // router.push('/permission/permission', { query: { id: permissionData } });
  };

  const downloadPDF_ = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    try {
      const content = 'PDF Content';
      const response = await fetch(`${configAPI.baseURL}/api/pdf/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      });

      if (!response.ok) {
        throw new Error('Error al obtener el PDF');
      }

      const pdfBase64 = await response.text(); // Obtiene el PDF en base64 como texto
      console.log('pdfBase64:', pdfBase64);

      const bytes = Uint8Array.from(atob(pdfBase64), c => c.charCodeAt(0)); // Convierte la cadena decodificada a un arreglo de bytes
      const blob = new Blob([bytes], { type: 'application/pdf' }); // Crea el blob con los byte

      const url = URL.createObjectURL(blob);
      console.log('url:', url);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'generated.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error al generar el PDF:', error);
    }
  };

  const downloadPDF = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('content', '<div>Hello world!</div>');

    /*const response = await fetch(`${configAPI.baseURL}/api/pdf/generate`, {
      method: 'POST',
      body: {
        content: '<div>Hello world!</div>'
      }
    })*/
    const response = await axios.post(`${configAPI.baseURL}/api/pdf/generate`, {
      content: '<div>Hello world!</div>'
    });

    console.log('pdf:', response.data);
    /*
      .then(response => {
        if (!response.ok) {
          throw new Error('Error al obtener el PDF');
        }

        return response.blob();
      })
      .then(blob => {*/
    const url = URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'generated.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    /*)})
    .catch(error => {
      console.error('Error al generar el PDF:', error);
    });*/
  }

  const handleChangeUpdateStatus = async (permission: Permission) => {
    try {
      if (permission._id) {
        const responseUpdate = await updateStatusPermission(permission._id, !permission.isActive);
        if (responseUpdate) {
          handleCloseModal();
          setMessage(responseUpdate?.message);
          setCountData(0);
        }
      }
    } catch (error) {
      setMessage(error);
    }
  };

  const handleChangeSoftDelete = async (permission: Permission) => {
    try {
      if (permission._id) {
        const deleteResponse = await softDeletePermission(permission._id);
        if (deleteResponse) {
          handleCloseModalDelete();
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleChange = async (e) => {

  }

  //#region MODALS
  const handleOpenModal = (permission: Permission) => {
    setPermissionData(permission);
    setShowModal(true);
  };

  const handleOpenModalDelete = (permission: Permission) => {
    setPermissionData(permission);
    setShowModalDelete(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleCloseModalDelete = () => {
    setShowModalDelete(false);
  };

  //#endregion
  const handleNewPermission = async () => {
    router.push('/permission/permission');
  };
  const handleNewPermissionUrl = async () => {
    // window.open('http://localhost:3001/api-docs/', '_blank');
  };

  //#region FILTER
  const getPermissionsByCategory = async (idPermissionCategory: string) => {
    try {
      const permissionResponse = await getAllPermissionsByCategory(idPermissionCategory, 1, 50);
      if (permissionResponse) {
        setPermissions(permissionResponse.permissions);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleChangeSelected = (option: any) => {
    if (!option) {
      return;
    }

    setLabelSelected(option?.label);
    setIdPermissionCategorySelected(option?._id);
  };

  const handleFilter = (e) => {
    setIdPermissionCategorySelected(e);
    getPermissionsByCategory(e);
  };

  const renderOption = ({ label }) => label;

  //#endregion
  return (
    <div className='w-full h-full px-4'>
      <div className="col-span-full mt-2 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-12">
        <div className="sm:col-span-4">
          <KeyIcon data-tooltip-id="my-tooltip-p" data-tooltip-content="Add description for more info about this permission!"
            style={{ float: 'left' }} name="permission" className="mt-4 h-8 w-8 text-blue-500" color="#EAEAEA" />
          <h1 className="flex h1-2 px-2 py-2">
            Permissions to system features</h1>
        </div>
        <div className="sm:col-span-3 mt-1">
          {message != '' && <Notification message={message} />}
        </div>
        <div className="flex justify-end sm:col-span-5">
          <div className="px-2 py-1">
            <Search isOpen={showModal} size={9} onClose={handleCloseModal} setData={setData} entity='permission' setIsLoading={setIsLoading}>
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
          <div className="sm:col-span-12 mt-5">
            <DropdownMenuButton
              label={labelSelected}
              options={optionsPermissionsCategory}
              renderOption={renderOption}
              onSelect={handleChangeSelected}
              valueSelected={labelSelected}
              minWidth='min-w-44'
            />
          </div>
          <div className="flex">
            <div className="mt-5 pl-4">
              <button
                className={`flex items-center justify-between w-full px-3.5 py-1.5 rounded-md bg-blue-800 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                onClick={() => { router.push('/permission/permission') }}
              >
                <span className={'ml-2'}>
                  <FolderAddIcon name="drowndown" className="h-5 w-8 text-white leading-6" color="#337ab7" />
                </span>
                <span className={'text-white'}>Add Permission</span>
              </button>
            </div>
            <div className="mt-5 pl-4">
              {hiddenAPIDocumentation &&
                <button onClick={() => handleNewPermissionUrl()}
                  className="flex rounded-md bg-green-700 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  <DocumentAddIcon name="documentationAPI" className="h-5 w-8 text-white-500 leading-6" color="#FFFFFF" />
                  Documentation API
                </button>}
              {/*<button onClick={(e) => downloadPDF_(e)}
              className="flex rounded-md bg-green-700 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <DocumentDownloadIcon name="documentationAPI" className="h-5 w-8 text-white-500 leading-6" color="#FFFFFF" />
              PDF
            </button>*/}
            </div>
          </div>
        </div>
      </div>
      <Table data={data} actions={[
        { name: 'Status', handler: handleOpenModal, color: 'green' },
        { name: 'View', handler: handleEdit, color: 'blue' },
        { name: 'Edit', handler: handleEdit, color: 'blue' },
        { name: 'Delete', handler: handleOpenModalDelete, color: 'red' }
      ]}>
        <th>Serial</th>
        <th>Name</th>
        <th>Description</th>
        <th>Category</th>
        <th>Is active</th>
        <th>Created By</th>
        <th>Created At</th>
      </Table>
      <Pagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={countData}
        onPageChange={handlePageChange}
        setPageSize={setPageSize}
      />
      <Modal isOpen={showModal} onClose={handleCloseModal}>
        <div className="border-b border-gray-900/10 pb-12">
          <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="col-span-full flex items-center">
              <InformationCircleIcon name="titleModal" className="h-6 w-10 text-blue-500" color="#ff0000" />
              <p className="text-gray-500">You want to perform this action.</p>
            </div>
            <div className="col-span-full text-sm">
              <p className="text-gray-500"></p>
              <p className="text-gray-500 font-semibold">Yes to continue {permissionData.isActive ? 'inactivate' : 'activate'} the permission with name: </p> <strong>{permissionData.name}</strong>
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-x-6">
          <button onClick={handleCloseModal} className="flex text-sm font-semibold leading-6 text-gray-900 bg-white-600 px-3 py-2">
            <StatusOnlineIcon name="acceptButton" className="h-6 w-8 text-white-500 leading-6" color="#FFFFFF" />
            Cancel
          </button>
          <button onClick={() => handleChangeUpdateStatus(permissionData)}
            className="flex rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <CheckIcon name="acceptButton" className="h-6 w-8 text-white-500 leading-6" color="#FFFFFF" />
            Yes
          </button>
        </div>
      </Modal>
      <Modal isOpen={showModalDelete} onClose={handleCloseModalDelete}>
        <div className="border-b border-gray-900/10 pb-12">
          <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="col-span-full flex items-center">
              <InformationCircleIcon name="titleModal" className="h-6 w-10 text-blue-500" color="#ff0000" />
              <p className="text-gray-500">You want to perform this action.</p>
            </div>
            <div className="col-span-full text-sm">
              <p className="text-gray-500 font-semibold">Yes to continue soft delete the permissions with name: </p><strong>{permissionData.name}</strong>
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-x-6">
          <button onClick={handleCloseModalDelete} className="text-sm font-semibold leading-6 text-gray-900 bg-white-600 px-3 py-2">
            Cancel
          </button>
          <button onClick={() => handleChangeSoftDelete(permissionData)}
            className="flex rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <CheckIcon name="acceptButton" className="h-6 w-8 text-blue-500 leading-6" color="#ff0000" />
            Yes
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default PermissionDataPage;