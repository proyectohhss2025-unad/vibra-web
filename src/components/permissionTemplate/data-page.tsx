'use client'

import { getAllPermissionTemplates, softDeletePermissionTemplate, updateStatusPermissionTemplate } from '@/api/permissionTemplate';
import { PermissionTemplate } from '@/models/permissionTemplate.entity';
import { User } from '@/models/user.entity';
import { AuthContext } from '@/services/auth';
import { getSafeKeyObjectFromStorage } from '@/utils/safe-token-storage';
import { CogIcon, FolderAddIcon, StatusOnlineIcon } from '@heroicons/react/outline';
import { CheckIcon, InformationCircleIcon, RefreshIcon } from '@heroicons/react/solid';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import "../../../app/globals.css";
import Modal from '../layouts/modal/modal';
import MiniTemplateDataPage from '../permission/mini-template-data-page';
import Search from '../search/search';
import Pagination from '../ui/table/pagination';
import Table from './table';
import './table.css';

const PermissionTemplateDataPage: React.FC = () => {
  const { token, user } = useContext(AuthContext);
  const user_: User = JSON.parse(getSafeKeyObjectFromStorage('user')) ?? {};

  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<PermissionTemplate[]>([]);
  const [countData, setCountData] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [permissionTemplateSelected, setPermissionTemplateSelected] = useState<any>();
  const [showModal, setShowModal] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [showModalPermissions, setShowModalPermissions] = useState(false);
  const router = useRouter();

  useEffect((): any => {
    const fetchData = async () => {
      const { data, length } = await getAllPermissionTemplates(currentPage, pageSize);
      setData(data);
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

  const handleEdit = (permissionTemplate: PermissionTemplate) => {
    router.push(`/permissionTemplate/permission-template?_id=${permissionTemplate._id
      }&serial=${permissionTemplate.serial}&name=${permissionTemplate.name}&description=${permissionTemplate.description
      }&isActive=${permissionTemplate.isActive}`);
  };

  const handleChangeUpdateStatus = async (permissionTemplate: PermissionTemplate) => {
    try {
      if (permissionTemplate._id) {
        const deleteResponse = await updateStatusPermissionTemplate(permissionTemplate._id, !permissionTemplate.isActive);
        if (deleteResponse) {
          handleCloseModal();
        }
      }
    } catch (error) {
    }
  };

  const handleChangeSoftDelete = async (permissionTemplate: PermissionTemplate) => {
    try {
      if (permissionTemplate._id) {
        const deleteResponse = await softDeletePermissionTemplate(permissionTemplate._id);
        if (deleteResponse) {
          handleCloseModalDelete();
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleChange = async (e) => {
    setPermissionTemplateSelected(e);
  }

  //#region MODALS
  const handleOpenModalPermissions = (permissionTemplate: PermissionTemplate) => {
    setPermissionTemplateSelected(permissionTemplate);
    setShowModalPermissions(true);
  };

  const handleOpenModal = (permissionTemplate: PermissionTemplate) => {
    setPermissionTemplateSelected(permissionTemplate);
    setShowModal(true);
  };

  const handleOpenModalDelete = (permissionTemplate: PermissionTemplate) => {
    setPermissionTemplateSelected(permissionTemplate);
    setShowModalDelete(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleCloseModalDelete = () => {
    setShowModalDelete(false);
  };

  const handleCloseModalPermissions = () => {
    setShowModalPermissions(false);
  };

  //#endregion

  const handleNewPermissionTemplate = async () => {
    router.push('/permissionTemplate/permissionTemplate');
  };

  const handleNewPermissionTemplateUrl = async () => {
    // window.open('http://localhost:3001/api-docs/', '_blank');
  };

  const handlePermissionTemplateSelected = async (permissions: any[]) => {
    console.log('Permissions.length in data-page: ', permissions?.length)
    setPermissionTemplateSelected({
      ...permissionTemplateSelected,
      permissions
    });
  }

  return (
    <div className='w-full h-full px-4'>
      {/*showNotification && (
        <Notification
          type="success"
          message="This is a success notification!"
          onClose={handleCloseNotification}
        />
      )*/}
      <div className="col-span-full mt-2 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-12">
        <div className="sm:col-span-5">
          <CogIcon data-tooltip-id="my-tooltip-p" data-tooltip-content="Learn more about permissionTemplates"
            style={{ float: 'left' }} name="permissionTemplate" className="mt-4 h-8 w-8 text-blue-500" color="#EAEAEA" />
          <h1 className="flex h1-2 px-2 py-2">
            Permission templates</h1>
        </div>
        <div className="flex justify-end sm:col-span-7">
          <div className="px-2 py-1">
            <Search isOpen={showModal} onClose={handleCloseModal} setData={setData} entity='permissionTemplate' setIsLoading={setIsLoading}>
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
                onClick={() => { router.push('/permission-template/permission-template') }}
              >
                <span className={'ml-2'}>
                  <FolderAddIcon name="drowndown" className="h-5 w-8 text-white leading-6" color="#337ab7" />
                </span>
                <span className={'text-white'}>Add permissions template</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <Table data={data} actions={[
        { name: 'Permissions', handler: handleOpenModalPermissions, color: 'blue' },
        { name: 'Status', handler: handleOpenModal, color: 'green' },
        { name: 'View', handler: handleEdit, color: 'blue' },
        { name: 'Edit', handler: handleEdit, color: 'blue' },
        { name: 'Delete', handler: handleOpenModalDelete, color: 'red' }
      ]}>
        <th scope="col">Serial</th>
        <th scope="col">Name</th>
        <th scope="col">Description</th>
        <th scope="col">Is active</th>
        <th scope="col">Created By</th>
        <th scope="col">Created At</th>
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
              <p className="text-gray-500 font-semibold">Yes to continue {permissionTemplateSelected?.isActive ? 'inactivate' : 'activate'} the permissionTemplate with name: </p> <strong>{permissionTemplateSelected?.name}</strong>
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-x-6">
          <button onClick={handleCloseModal} className="flex text-sm font-semibold leading-6 text-gray-900 bg-white-600 px-3 py-2">
            <StatusOnlineIcon name="acceptButton" className="h-6 w-8 text-white-500 leading-6" color="#FFFFFF" />
            Cancel
          </button>
          <button onClick={() => handleChangeUpdateStatus(permissionTemplateSelected)}
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
              <p className="text-gray-500 font-semibold">Yes to continue soft delete the permissionTemplates with name: </p><strong>{permissionTemplateSelected?.name}</strong>
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-x-6">
          <button onClick={handleCloseModalDelete} className="text-sm font-semibold leading-6 text-gray-900 bg-white-600 px-3 py-2">
            Cancel
          </button>
          <button onClick={() => handleChangeSoftDelete(permissionTemplateSelected)}
            className="flex rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <CheckIcon name="acceptButton" className="h-6 w-8 text-blue-500 leading-6" color="#ff0000" />
            Yes
          </button>
        </div>
      </Modal>

      <Modal isOpen={showModalPermissions} onClose={handleCloseModalPermissions} classSize='max-w-6xl h-[42rem]'>
        <div className="pb-1">
          <MiniTemplateDataPage template_={permissionTemplateSelected} setPermissions_={handlePermissionTemplateSelected} />
        </div>
      </Modal>

    </div>
  );
};

export default PermissionTemplateDataPage;