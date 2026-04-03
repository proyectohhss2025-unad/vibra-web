import { Permission } from '@/models/permission.entity';
import React, { useEffect, useState } from 'react';

interface Action {
  name: string;
  color: string;
  handler: (permission: Permission) => void;
}

interface TableProps {
  permissions_: any[];
  actions: Action[];
  children?: React.ReactNode;
}

const PermissionTemplateTable: React.FC<TableProps> = ({ permissions_, actions, children }) => {
  const [error, setError] = useState('');
  const [permissions, setPermissions] = useState<any>(permissions_);

  useEffect(() => {
    setPermissions(permissions_);
  }, [permissions_?.length]);

  return (
    <div className="scrollbar-div relative overflow-x-auto bg-white">
      <div className={`text-md font-bold border-b border-gray-300 pb-2`}>
        Permissions assigned to the template
      </div>
      <table className="rounded-lg min-w-full text-left text-sm mt-2">
        <thead className="uppercase tracking-wider border-b-2">
          <tr>
            {children}
            {actions.map((action) => (
              <th scope="col" className="text-left px-3 py-3" key={action.name}>{action.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {permissions?.map((record: any) => (
            <tr className={`mt-0 mb-0 hover:bg-blue-100 border-b`}
              key={`tr_permission_${record?.serial}`} >

              <th className={`text-sm px-1 py-1`}>{record?.serial}</th>
              <td className={`text-sm px-1 py-1`}>{record?.name}</td>
              <td className={`text-sm px-1 py-1`}>
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-md focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  checked={record?.isActive}
                  onChange={(e) => {

                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PermissionTemplateTable;