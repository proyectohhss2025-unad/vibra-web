'use client'

import { getAllPermissionsByUser, softDeletePermissionToTemplate, updateStatusPermission } from '@/api/permission';
import { Permission } from '@/models/permission.entity';
import { UserPermission } from '@/models/userPermission.entity';
import React, { useEffect, useState } from 'react';
import "../../../app/globals.css";
import './permission-assigned-table.css';
import PermissionUserTable from './permission-user-table';
import { User } from '@/models/user.entity';
import { getSafeKeyObjectFromStorage } from '@/utils/safe-token-storage';
import Modal from '../layouts/modal/modal';
import { ArrowNarrowLeftIcon, CheckIcon, InformationCircleIcon } from '@heroicons/react/solid';

interface PermissionUserDataPageProps {
  permissions: any[];
  userID: string;
}

const PermissionUserDataPage: React.FC<PermissionUserDataPageProps> = ({ permissions, userID }) => {
  const user_: User = JSON.parse(getSafeKeyObjectFromStorage('user')) ?? {};
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [permissionSelected, setPermissionSelected] = useState<any>();
  const [data, setData] = useState<Permission[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (userID) {
          const permissionsResponse = await getAllPermissionsByUser(userID, 1, 100);
          if (permissionsResponse) {
            const permissionsAux: Permission[] = [];
            permissionsResponse.userPermissions.map((permission: UserPermission) => {
              if (!permission?.deleted) {
                permissionsAux.push(permission?.permission);
              }
            })
            setData(permissionsAux);
          }
        }
      } catch (error) {
        console.log('error: ', error)
      }
    };

    fetchData();
  }, [permissions, userID]);

  const handleChangeUpdateStatus = async (permission: Permission) => {
    try {
      if (permission._id) {
        const response = await updateStatusPermission(permission._id, !permission.isActive);
        if (response) {
          console.log('response', response);
          //handleCloseModal();
        }
      }
    } catch (error) {
    }
  };

  const handleChangeDeletePermissionTemplate = async (userPermission: any) => {
    try {
      console.log('userPermission:', userPermission);
      if (userPermission?._id) {
        const response = await softDeletePermissionToTemplate(userPermission?._id, user_?._id ?? '');
        if (response) {
          console.log('response delete', response);
        }
      }
    } catch (error) {
    }
  };

  //#region MODALS
  const handleOpenModalDeleteConfirmation = (userPermission: Permission) => {
    setPermissionSelected(userPermission);
    setShowModalDelete(true);
  };

  const handleCloseModalDelete = () => {
    setShowModalDelete(false);
  };
  //#endregion

  return (
    <div id='permission-assigned-table' className='w-full h-full px-0'>
      <PermissionUserTable data={data} actions={[
        { name: 'Status', handler: handleChangeUpdateStatus, color: 'green' },
        { name: 'Delete', handler: handleOpenModalDeleteConfirmation, color: 'red' }
      ]}>
        <th scope="col">Serial</th>
        <th scope="col">Name</th>
      </PermissionUserTable>


      <Modal isOpen={showModalDelete} onClose={handleCloseModalDelete}>
        <div className="border-b border-gray-900/10 pb-12">
          <div className="mt-0 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 leading-6">
            <div className="col-span-full flex items-center">
              <InformationCircleIcon name="titleModal" className="h-6 w-10 text-blue-500" color="#ff0000" />
              <p className="text-gray-500">You want to perform this action.</p>
            </div>
            <div className="col-span-full text-sm ">Yes, to continue deleting the user permission:
              <p className="text-gray-500 font-semibold"><strong>{permissionSelected?.name}</strong> </p>
              at user selected.
            </div>
          </div>
        </div>
        <div className="mt-3 flex justify-end gap-x-6">
          <button onClick={handleCloseModalDelete} className="flex pt-2 rounded-md text-sm font-semibold leading-6 text-gray-500 bg:text-white bg-gray-300 hover:bg-gray-600 px-3 py-2">
            <ArrowNarrowLeftIcon name="acceptButton" className="h-6 w-8 leading-6 " />
            Cancel
          </button>
          <button onClick={handleChangeDeletePermissionTemplate}
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

export default PermissionUserDataPage;