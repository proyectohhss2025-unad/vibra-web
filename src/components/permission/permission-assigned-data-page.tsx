'use client'

import { updateStatusPermission } from '@/api/permission';
import { Permission } from '@/models/permission.entity';
import { PermissionTemplate } from '@/models/permissionTemplate.entity';
import { User } from '@/models/user.entity';
import { AuthContext } from '@/services/auth';
import { getSafeKeyObjectFromStorage } from '@/utils/safe-token-storage';
import React, { useContext, useEffect, useState } from 'react';
import "../../../app/globals.css";
import { usePermissionTemplateContext } from '../permissionTemplate/permission-template-provider';
import PermissionAssignedTable from './permission-assigned-table';
import './permission-assigned-table.css';

interface PermissionAssignedTableProps {
  permissionTemplateData_: PermissionTemplate;
}

const PermissionAssignedDataPage: React.FC = () => {
  const { permissionTemplateData } = usePermissionTemplateContext();
  const { token, user } = useContext(AuthContext);
  const user_: User = JSON.parse(getSafeKeyObjectFromStorage('user')) ?? {};

  const [data, setData] = useState<Permission[]>([]);

  useEffect(() => {
    console.log('permissionTemplateData.permissions in permission assigned: ', permissionTemplateData.permissions);
    setData(permissionTemplateData.permissions ?? []);
  }, [permissionTemplateData.permissions]);

  const handleChangeUpdateStatus = async (permission: Permission) => {
    try {
      if (permission._id) {
        const response = await updateStatusPermission(permission._id, !permission.isActive);
        if (response) {
          //handleCloseModal();
        }
      }
    } catch (error) {
    }
  };

  return (
    <div id='permission-assigned-table' className='w-full h-full px-4'>
      <PermissionAssignedTable data={data} actions={[
        { name: 'Status', handler: handleChangeUpdateStatus, color: 'green' }
      ]}>
        <th scope="col">Serial</th>
        <th scope="col">Name</th>
      </PermissionAssignedTable>
    </div>
  );
};

export default PermissionAssignedDataPage;