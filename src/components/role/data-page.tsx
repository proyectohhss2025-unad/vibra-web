'use client'

import { getConfigById, hasAccessToConfig } from '@/api/config';
import { getAllRoles, softDeleteRole, updateStatusRole } from '@/api/role';
import { Role } from '@/models/role.entity';
import { User } from '@/models/user.entity';
import { AuthContext } from '@/services/auth';
import { getSafeKeyObjectFromStorage } from '@/utils/safe-token-storage';
import { CogIcon, FolderAddIcon, StatusOnlineIcon } from '@heroicons/react/outline';
import { CheckIcon, DocumentAddIcon, InformationCircleIcon, RefreshIcon } from '@heroicons/react/solid';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import "../../../app/globals.css";
import logger from '../../config/logger-dev';
import Modal from '../layouts/modal/modal';
import Search from '../search/search';
import Pagination from '../ui/table/pagination';
import Table from './table';
import './table.css';

const RoleDataPage: React.FC = () => {
  const { token, user } = useContext(AuthContext);
  const user_: User = JSON.parse(getSafeKeyObjectFromStorage('user')) ?? {};
  const [isLoading, setIsLoading] = useState(false);

  const [data, setData] = useState<Role[]>([]);
  const [countData, setCountData] = useState(1);
  const [hiddenAPIDocumentation, setHiddenAPIDocumentation] = useState<boolean>(false);
  const [userSession, setUserSession] = useState<any>(user_);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [roleData, setRoleData] = useState<Role>({
    _id: '',
    serial: '',
    name: '',
    description: '',
    isActive: true,
    createdAt: new Date(Date.now()),
    createdBy: user_.name,
  });

  const [showModal, setShowModal] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const router = useRouter();

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
        // logger.info('The user does have role for access to API documentation');
        setHiddenAPIDocumentation(true);
      }
    }
    fetchData();
  }, [userSession]);

  useEffect((): any => {
    const fetchData = async () => {
      const { items, length } = await getAllRoles(currentPage, pageSize);
      setData(items);
      setCountData(length);
      setIsLoading(false);
    }
    setIsLoading(true);
    fetchData();
    if (!token) {
      router.push('/layout');
    }
  }, [token, router, currentPage, pageSize, showModalDelete]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleEdit = (role: Role) => {
    router.push(`/role/role?_id=${role._id
      }&serial=${role.serial}&name=${role.name}&description=${role.description
      }&isActive=${role.isActive}&isSuperAdmin=${role.isSuperAdmin}&permissionTemplate=${role.permissionTemplate
      }&permissionTemplateId=${role.permissionTemplate?._id}`);
  };

  const handleChangeUpdateStatus = async (role: Role) => {
    try {
      if (role._id) {
        const deleteResponse = await updateStatusRole(role._id, !role.isActive);
        if (deleteResponse) {
          handleCloseModal();
        }
      }
    } catch (error) {
    }
  };

  const handleChangeSoftDelete = async (role: Role) => {
    try {
      if (role._id) {
        const deleteResponse = await softDeleteRole(role._id);
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
  const handleOpenModal = (role: Role) => {
    setRoleData(role);
    setShowModal(true);
  };

  const handleOpenModalDelete = (role: Role) => {
    setRoleData(role);
    setShowModalDelete(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleCloseModalDelete = () => {
    setShowModalDelete(false);
  };

  //#endregion
  const handleNewRole = async () => {
    router.push('/role/role');
  };

  const handleNewRoleUrl = async () => {
    // window.open('http://localhost:3001/api-docs/', '_blank');
  };

  return (
    <div className='w-full h-full px-4'>
      <div className="col-span-full mt-2 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-12">
        <div className="sm:col-span-2">
          <CogIcon data-tooltip-id="my-tooltip-p" data-tooltip-content="Learn more about roles"
            style={{ float: 'left' }} name="role" className="mt-4 h-8 w-8 text-blue-500" color="#EAEAEA" />
          <h1 className="flex h1-2 px-2 py-2">
            User roles</h1>
        </div>
        <div className="flex justify-end sm:col-span-10">
          <div className="px-2 py-1">
            <Search isOpen={showModal} onClose={handleCloseModal} setData={setData} entity='role' setIsLoading={setIsLoading}>
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
          <div className="flex">
            <div className="mt-5 pl-4">
              <button
                className={`flex items-center justify-between w-full px-3.5 py-1.5 rounded-md bg-blue-800 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                onClick={() => { router.push('/role/role') }}
              >
                <span className={'ml-2'}>
                  <FolderAddIcon name="drowndown" className="h-5 w-8 text-white leading-6" color="#337ab7" />
                </span>
                <span className={'text-white'}>Add Role</span>
              </button>
            </div>
            <div className="mt-5 pl-4">
              {hiddenAPIDocumentation &&
                <button onClick={() => handleNewRoleUrl()}
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
        { name: 'Templates', handler: handleOpenModal, color: 'blue' },
        { name: 'Status', handler: handleOpenModal, color: 'green' },
        { name: 'View', handler: handleEdit, color: 'blue' },
        { name: 'Edit', handler: handleEdit, color: 'blue' },
        { name: 'Delete', handler: handleOpenModalDelete, color: 'red' }
      ]}>
        <th>Serial</th>
        <th>Name</th>
        <th>Description</th>
        <th>Super admin</th>
        <th>Active</th>
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
              <p className="text-gray-500 font-semibold">Yes to continue {roleData.isActive ? 'inactivate' : 'activate'} the role with name: </p> <strong>{roleData.name}</strong>
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-x-6">
          <button onClick={handleCloseModal} className="flex text-sm font-semibold leading-6 text-gray-900 bg-white-600 px-3 py-2">
            <StatusOnlineIcon name="acceptButton" className="h-6 w-8 text-white-500 leading-6" color="#FFFFFF" />
            Cancel
          </button>
          <button onClick={() => handleChangeUpdateStatus(roleData)}
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
              <p className="text-gray-500 font-semibold">Yes to continue soft delete the roles with name: </p><strong>{roleData.name}</strong>
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-x-6">
          <button onClick={handleCloseModalDelete} className="text-sm font-semibold leading-6 text-gray-900 bg-white-600 px-3 py-2">
            Cancel
          </button>
          <button onClick={() => handleChangeSoftDelete(roleData)}
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

export default RoleDataPage;