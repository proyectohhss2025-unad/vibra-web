import { Permission } from '@/models/permission.entity';
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

const PermissionAssignedTable: React.FC<TableProps> = ({ data, actions, children }) => {
  const [error, setError] = useState('');
  const [permissions, setPermissions] = useState<Permission[]>(data);

  useEffect(() => {
    setPermissions(data);
  }, [data]);

  return (
    <div className="relative overflow-x-auto bg-white">
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
            <tr className={`mt-0 mb-0 hover:bg-neutral-100 border-b`}
              key={`tr_permission_${record.serial}`} >

              <th className={`${record.deleted ? 'text-red-800' : ''} text-sm px-2 py-2`}>{record.serial}</th>
              <td className={`text-sm px-2 py-2 ${record.deleted === true ? ' bg-gray-200 ' : ' bg-white '}`}>{record.name}</td>
              <td className={`${record.deleted ? 'text-red-800' : ''} text-sm px-2 py-2`}>
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  checked={record?.isActive}
                  onChange={(e) => { }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/*<button onClick={handleAction}>Realizar acción</button>*/}
    </div>
  );
};

export default PermissionAssignedTable;