import { Permission } from '@/models/permission.entity';
import { PencilIcon, StarIcon, StopIcon, TrashIcon, EyeIcon } from '@heroicons/react/solid';
import React, { useEffect, useState } from 'react';

interface Action {
  name: string;
  color: string;
  handler: (permission: Permission) => void;
}

interface TableProps {
  data: Permission[];
  actions: Action[];
  children?: React.ReactNode;
}

const PermissionUserTable: React.FC<TableProps> = ({ data, actions, children }) => {
  const [error, setError] = useState('');
  const [permissions, setPermissions] = useState<Permission[]>(data);

  useEffect(() => {
    setPermissions(data);
  }, [data]);

  return (
    <div className="scrollbar-div relative overflow-x-auto bg-white">
      <label className={`block mb-2 text-md font-semibold text-gray-900 dark:text-gray-300`}>
        Permissions assigned to the user
      </label>
      <table className="rounded-lg min-w-full text-left text-sm">
        <thead className="uppercase tracking-wider border-b-2">
          <tr>
            {children}
            {actions.map((action) => (
              <th scope="col" className="text-left px-3 py-3" key={action.name}>{action.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {permissions.map((record) => (
            <tr className={`${record?.deleted ? 'bg-gray-500' : ''} mt-0 mb-0 hover:bg-blue-100 border-b`}
              key={`tr_permission_${record.serial}`} >

              <th className={`text-sm px-1 py-0`}>{record.serial}</th>
              <td className={`text-sm px-1 py-0`}>{record.name}</td>
              {actions.map((action) => (
                <td className={`text-center px-2 py-0 text-sm`} key={action.name}>
                  <button style={{ margin: '0px auto' }} className={`text-sm px-2 py-1 ${action.name === 'Status' && record.name ? 'action-red inline-block px-2 py-1 text-red-500'
                    : action.name === 'Status' && !record.name ? 'action-red inline-block px-1 py-1.5 bg-green-700 text-white'
                      : 'action-blue inline-block px-3 py-1.5 text-white rounded-md hover:text-white'}`}
                    onClick={() => {
                      if (record.deleted != undefined && !record.deleted) {
                        action.handler(record);
                      }
                    }}>
                    {action.name === 'Status' && record.isActive && <StarIcon name="success" className="h-5 w-5" color={record.deleted ? 'gray' : action.color} data-tooltip-id="my-tooltip-p" data-tooltip-content={`${record.deleted ? '' : 'Is activate, click for inactivate'}`} />}
                    {action.name === 'Status' && !record.isActive && <StopIcon name="success" className="h-5 w-5" color={record.deleted ? 'gray' : action.color} data-tooltip-id="my-tooltip-p" data-tooltip-content={`${record.deleted ? '' : 'Inactive permission, click for activate'}`} />}
                    {action.name === 'Delete' && record.name && <TrashIcon name="delete" className="h-5 w-5" color={record.deleted ? 'gray' : action.color} data-tooltip-id="my-tooltip-p" data-tooltip-content={`${record.deleted ? '' : 'Delete'}`} />}
                  </button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PermissionUserTable;