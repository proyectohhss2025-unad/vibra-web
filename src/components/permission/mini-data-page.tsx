'use client'

import { getAllPermissions } from '@/api/permission';
import { addPermissionToTemplate } from '@/api/permissionTemplate';
import { Permission } from '@/models/permission.entity';
import { PermissionTemplate } from '@/models/permissionTemplate.entity';
import { User } from '@/models/user.entity';
import { AuthContext } from '@/services/auth';
import { getSafeKeyObjectFromStorage } from '@/utils/safe-token-storage';
import { CheckIcon, InformationCircleIcon, StatusOnlineIcon } from '@heroicons/react/outline';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import "../../../app/globals.css";
import Modal from '../layouts/modal/modal';
import { usePermissionTemplateContext } from '../permissionTemplate/permission-template-provider';
import MiniTable from './mini-table';
import './mini-table.css';

interface MiniTableProps {
  permissionTemplateData_: PermissionTemplate;
  setPermissionTemplateData_: (value: PermissionTemplate) => void;
}

const MiniDataPage: React.FC = () => {
  const { permissionTemplateData, setPermissionTemplateData } = usePermissionTemplateContext();

  const { token, user } = useContext(AuthContext);
  const user_: User = JSON.parse(getSafeKeyObjectFromStorage('user')) ?? {};

  const [data, setData] = useState<Permission[]>([]);
  const [permissionSelected, setPermissionSelected] = useState<Permission>();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);

  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // setData(permissionTemplateData.permissions ?? []);
    console.log('permissionTemplateData.permissions in mini: ', permissionTemplateData.permissions);
    //setPermissionTemplateData(permissionTemplateData);

    // console.log('permissionTemplateData.permissions in mini: ', permissionTemplateData.permissions);
  }, [permissionTemplateData.permissions]);

  useEffect((): any => {
    const fetchData = async () => {
      const { permissions } = await getAllPermissions(currentPage, pageSize);
      setData(permissions);
    }

    fetchData();

    if (!token) {
      router.push('/layout');
    }

  }, [token, router, currentPage, pageSize]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleChangeAddPermissionToTemplate = async () => {
    try {
      if (permissionSelected?._id && permissionTemplateData._id) {
        const response = await addPermissionToTemplate(permissionSelected?._id, permissionTemplateData._id);
        if (response) {
          handleCloseModal();
          //console.log('response', response);
          permissionTemplateData.permissions = response.permissions;
          setPermissionTemplateData(permissionTemplateData);
        }

        handleCloseModal();
      }
    } catch (error) {
    }
  };

  //#region MODALS
  const handleOpenModalConfirmation = (permission: Permission) => {
    //setPermissionData(permission);
    setPermissionSelected(permission);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };
  //#endregion



  return (
    <div id='mini-table-permission' className='w-full h-full px-4'>
      <MiniTable data={data} actions={[
        { name: 'Action', handler: handleOpenModalConfirmation, color: 'green' }
      ]}>
        <th scope="col">Serial</th>
        <th scope="col">Name</th>
        <th scope="col">Description</th>
      </MiniTable>

      <Modal isOpen={showModal} onClose={handleCloseModal}>
        <div className="border-b border-gray-900/10 pb-12">
          <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="col-span-full flex items-center">
              <InformationCircleIcon name="titleModal" className="h-6 w-10 text-blue-500" color="#ff0000" />
              <p className="text-gray-500">You want to perform this action.</p>
            </div>
            <div className="col-span-full text-sm">
              <p className="text-gray-500"></p>
              <p className="text-gray-500 font-semibold">Yes to continue assigned {permissionSelected?.name} at permissionTemplate with name: </p> <strong>{permissionTemplateData.name}</strong>
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-x-6">
          <button onClick={handleCloseModal} className="flex text-sm font-semibold leading-6 text-gray-900 bg-white-600 px-3 py-2">
            <StatusOnlineIcon name="acceptButton" className="h-6 w-8 text-white-500 leading-6" color="#FFFFFF" />
            Cancel
          </button>
          <button onClick={handleChangeAddPermissionToTemplate}
            className="flex rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <CheckIcon name="acceptButton" className="h-6 w-8 text-white-500 leading-6" color="#FFFFFF" />
            Yes
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default MiniDataPage;