'use client'

import { addPermissionToUser, getAllPermissions } from '@/api/permission';
import { Permission } from '@/models/permission.entity';
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
import MiniUserTable from './mini-user-table';

interface MiniUserDataPageProps {
  permissions: any[];
  userId: string;
  userName: string;
  setPermissions: (permissions: Permission[]) => void;
}

const MiniUserDataPage: React.FC<MiniUserDataPageProps> = ({ permissions, userId, userName, setPermissions }) => {
  const { token, user } = useContext(AuthContext);
  const user_: User = JSON.parse(getSafeKeyObjectFromStorage('user')) ?? {};

  const [data, setData] = useState<Permission[]>([]);
  const [permissionSelected, setPermissionSelected] = useState<Permission>();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [messageNotification, setMessageNotification] = useState<string>('');
  const [typeNotification, setTypeNotification] = useState<'success' | 'info' | 'warning' | 'error'>('info');

  const [isLoading, setIsLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);

  const router = useRouter();

  useEffect((): any => {
    const fetchData = async () => {
      const { permissions: permissions_ } = await getAllPermissions(currentPage, pageSize);
      //console.log('permissions: ', permissions);
      //console.log('permissions_: ', permissions_);
      permissions_.map((item: Permission) => {
        //console.log('item._id: ', item._id);
        const permissionExist = permissions.find((option) => option._id === item._id);
        //console.log('permissionExist: ', permissionExist);
        if (permissionExist) {
          item.isAssigned = true;
        }
      });
      setData(permissions_);
      //console.log('permissions_: ', permissions_);
    }
    fetchData();
    if (!token) {
      router.push('/layout');
    }
  }, [token, router, permissions.length, currentPage, pageSize]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleChangeAddPermissionToUser = async () => {
    try {
      if (permissionSelected?._id && userId) {
        const response = await addPermissionToUser(permissionSelected?._id, userId, true);
        if (response.userPermission) {
          setPermissions([]);
        }
      }
    } catch (error) {
      setTypeNotification('error');
      setShowNotification(true);
      setMessageNotification('Error assigning permission to user');
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

  const handleShowNotification = () => {
    setShowNotification(true);
  };

  const handleCloseNotification = () => {
    setShowNotification(false);
  };
  //#endregion

  return (
    <div id='mini-table-permission' className='w-full h-full px-4'>
      {showNotification && <Notification type={typeNotification} message={messageNotification} setMessage={setMessageNotification} onClose={handleCloseNotification} />}

      <MiniUserTable
        data={data}
        userID={userId}
        actions={[
          { name: 'Action', handler: handleOpenModalConfirmation, color: 'green' }
        ]} setPermissions_={setPermissions}>
        <th scope="col">Serial</th>
        <th scope="col">Name</th>
        <th scope="col">Description</th>
      </MiniUserTable>

      <Modal isOpen={showModal} onClose={handleCloseModal}>
        <div className="border-b border-gray-900/10 pb-12">
          <div className="mt-0 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 leading-6">
            <div className="col-span-full flex items-center">
              <InformationCircleIcon name="titleModal" className="h-6 w-10 text-blue-500" color="#ff0000" />
              <p className="text-gray-500">¿Quieres realizar esta acción?</p>
            </div>
            <div className="col-span-full text-sm ">Si, para continuar asignando el permiso:
              <strong>{permissionSelected?.name} </strong>
              al usuario:  <strong>{userName}</strong>
            </div>
          </div>
        </div>
        <div className="mt-3 flex justify-end gap-x-6">
          <button onClick={handleCloseModal} className="flex pt-2 rounded-md text-sm font-semibold leading-6 text-gray-500 bg:text-white bg-gray-300 hover:bg-gray-600 px-3 py-2">
            <ArrowNarrowLeftIcon name="acceptButton" className="h-6 w-8 leading-6 " />
            Cancelar
          </button>
          <button onClick={handleChangeAddPermissionToUser}
            className="flex pt-2 rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <CheckIcon name="acceptButton" className="h-6 w-8 text-white-500 leading-6" color="#FFFFFF" />
            Si
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default MiniUserDataPage;