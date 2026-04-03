'use client'

import { updateStatusPermission } from '@/api/permission';
import { Permission } from '@/models/permission.entity';
import React, { useEffect, useState } from 'react';
import "../../../app/globals.css";
import './permission-assigned-table.css';
import PermissionTemplateTable from './permission-template-table';

interface PermissionUserDataPageProps {
  permissions_: any[];
  template_: any;
}

const PermissionTemplateDataPage: React.FC<PermissionUserDataPageProps> = ({ permissions_, template_ }) => {
  //const { token, user } = useContext(AuthContext);
  //const user_: User = JSON.parse(getSafeKeyObjectFromStorage('user')) ?? {};

  const [permissions, setPermissions] = useState<any[]>([]);
  const [template, setTemplate] = useState<any>(template_);

  useEffect(() => {
    setTemplate(template_);
  }, [template_]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (template?._id) {
          const permissionsTemplate = template?.permissions;
          //console.log('permissionsTemplate: ', permissionsTemplate);
          if (permissionsTemplate) {
            const permissionsAux: Permission[] = [];
            permissionsTemplate?.map((permission: any) => {
              permissionsAux.push(permission);
            });
            setPermissions(permissionsAux);
          }
        }
      } catch (error) {
        console.log('error: ', error)
      }
    };

    fetchData();
  }, [template]);

  const handleChangeUpdateStatus = async (permission: Permission) => {
    try {
      if (permission._id) {
        const response = await updateStatusPermission(permission?._id, !permission?.isActive);
        if (response) {
          console.log('response', response);
          //handleCloseModal();
        }
      }
    } catch (error) {
    }
  };

  return (
    <div id='permission-assigned-table' className='w-full h-full px-0'>
      <PermissionTemplateTable permissions_={permissions} actions={[{ name: 'Status', handler: handleChangeUpdateStatus, color: 'green' }]}>
        <th scope="col">Serial</th>
        <th scope="col">Name</th>
      </PermissionTemplateTable>
    </div>
  );
};

export default PermissionTemplateDataPage;