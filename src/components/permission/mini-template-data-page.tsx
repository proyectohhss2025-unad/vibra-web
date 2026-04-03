'use client'

import { getAllPermissions } from '@/api/permission';
import { Permission } from '@/models/permission.entity';
import { PermissionTemplate } from '@/models/permissionTemplate.entity';
import { User } from '@/models/user.entity';
import { AuthContext } from '@/services/auth';
import { getSafeKeyObjectFromStorage } from '@/utils/safe-token-storage';
import { CheckIcon, InformationCircleIcon } from '@heroicons/react/outline';
import { ArrowNarrowLeftIcon } from '@heroicons/react/solid';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import "../../../app/globals.css";
import Modal from '../layouts/modal/modal';
import Notification from '../ui/notification/notification';
import './mini-table.css';
import MiniTemplateTable from './mini-template-table';
import { addPermissionToTemplate } from '@/api/permissionTemplate';

interface MiniTemplateDataPageProps {
  template_: any;
  setPermissions_: (permissions: any[]) => void;
}

const MiniTemplateDataPage: React.FC<MiniTemplateDataPageProps> = ({ template_, setPermissions_ }) => {
  const { token, user } = useContext(AuthContext);
  const user_: User = JSON.parse(getSafeKeyObjectFromStorage('user')) ?? {};

  const [permissions, setPermissions] = useState<any[]>(template_?.permissions);
  const [permissionSelected, setPermissionSelected] = useState<Permission>();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [template, setTemplate] = useState<any>(template_);
  const [messageNotification, setMessageNotification] = useState<string>('');
  const [typeNotification, setTypeNotification] = useState<'success' | 'info' | 'warning' | 'error'>('info');
  const [showModal, setShowModal] = useState(false);

  const router = useRouter();

  useEffect((): any => {
    const fetchData = async () => {
      const { permissions: permissionsAll_ } = await getAllPermissions(currentPage, pageSize);
      console.log('permissions 1: ', template_?.permissions);
      console.log('permissionsAll_ 1: ', permissionsAll_);
      permissionsAll_?.map((item: Permission) => {
        // console.log('item._id: ', item._id);
        const permissionExist = template_?.permissions?.find((option) => option._id === item._id);
        //
        if (permissionExist) {
          // console.log('permissionExist: ', permissionExist);
          item.isAssigned = true;
        }
      });

      setPermissions(permissionsAll_);
    }

    fetchData();
    setTemplate(template_);

    if (!token) {
      router.push('/layout');
    }
  }, [token, router, currentPage, pageSize, template_, template_?.permissions?.length]);

  const handleAddPermissionToTemplate = async () => {
    try {
      if (permissionSelected?._id && template_?._id) {
        const response = await addPermissionToTemplate(permissionSelected?._id, template_?._id);
        if (response?.permissionTemplate) {
          console.log('response add:', response?.permissionTemplate?.permissions);
          //setPermissions([...permissions, response.permissions]);
          setPermissions_(response?.permissionTemplate?.permissions);

          setMessageNotification('Permission saved successfully');
          setTypeNotification('info');
          setShowNotification(true);
        }
        if (response?.message) {
          setMessageNotification(response?.message);
          setTypeNotification('warning');
          setShowNotification(true);
        }
      }
    } catch (error) {
      setTypeNotification('error');
      setShowNotification(true);
      setMessageNotification('Error assigning permission to template');
    }
    handleCloseModal();
  };

  //#region MODALS
  const handleOpenModalConfirmation = (permission: Permission) => {
    setPermissionSelected(permission);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };
  //#endregion

  //#region NOTIFICATIONS
  const [showNotification, setShowNotification] = useState(false);

  const handleCloseNotification = () => {
    setShowNotification(false);
  };
  //#endregion

  return (
    <div id='mini-table-permission' className='w-full h-full px-4'>
      {showNotification && <Notification type={typeNotification} message={messageNotification} setMessage={setMessageNotification} onClose={handleCloseNotification} />}
      <MiniTemplateTable
        permissions_={permissions}
        template_={template}
        actions={[
          { name: 'Action', handler: handleOpenModalConfirmation, color: 'green' }
        ]} setPermissions_={setPermissions}>
        <th scope="col">Serial</th>
        <th scope="col">Name</th>
        <th scope="col">Description</th>
      </MiniTemplateTable>

      <Modal isOpen={showModal} onClose={handleCloseModal}>
        <div className="border-b border-gray-900/10 pb-12">
          <div className="mt-0 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 leading-6">
            <div className="col-span-full flex items-center">
              <InformationCircleIcon name="titleModal" className="h-6 w-10 text-blue-500" color="#ff0000" />
              <p className="text-gray-500">You want to perform this action.</p>
            </div>
            <div className="col-span-full text-sm ">Yes, to continue assigning the permission:
              <p className="text-gray-500 font-semibold"><strong>{permissionSelected?.name}</strong> </p>
              at template with name:  <strong>{template_?.name}</strong>
            </div>
          </div>
        </div>
        <div className="mt-3 flex justify-end gap-x-6">
          <button onClick={handleCloseModal} className="flex pt-2 rounded-md text-sm font-semibold leading-6 text-gray-500 bg:text-white bg-gray-300 hover:bg-gray-600 px-3 py-2">
            <ArrowNarrowLeftIcon name="acceptButton" className="h-6 w-8 leading-6 " />
            Cancel
          </button>
          <button onClick={handleAddPermissionToTemplate}
            className="flex pt-2 rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <CheckIcon name="acceptButton" className="h-6 w-8 text-white-500 leading-6" color="#FFFFFF" />
            Yes
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default MiniTemplateDataPage;