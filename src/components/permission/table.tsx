import { getAllCategories, getAllPermissionsByCategory } from '@/api/permission';
import { Permission } from '@/models/permission.entity';
import { PermissionCategory } from '@/models/permissionCategory.entity';
import { EyeIcon, PencilIcon, StopIcon } from '@heroicons/react/outline';
import { StarIcon, TrashIcon } from '@heroicons/react/solid';
import React, { useEffect, useState } from 'react';
import './table.css';

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

const Table: React.FC<TableProps> = ({ data, actions, children }) => {
  const [idPermissionCategorySelected, setIdPermissionCategorySelected] = useState<string | null>();
  const [permissionsCategory, setPermissionsCategory] = useState<PermissionCategory[]>([]);
  const [error, setError] = useState('');
  const [permissions, setPermissions] = useState<Permission[]>(data);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const processResponse = await getAllCategories(1, 50);
        if (processResponse) {
          setPermissionsCategory(processResponse.permissionsCategory);
        }
      } catch (error) {
        setError(error.message);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setPermissions(data);
  }, [data]);

  const handleFilter = (e) => {
    setIdPermissionCategorySelected(e);
    getPermissionsByCategory(e);
  };

  //#region FILTER
  const getPermissionsByCategory = async (idPermissionCategory: string) => {
    try {
      const permissionResponse = await getAllPermissionsByCategory(idPermissionCategory, 1, 50);
      if (permissionResponse) {
        setPermissions(permissionResponse.permissions);
      }
    } catch (error) {
      setError(error.message);
    }
  };
  //#endregion

  return (
    <div id='permissions' className="relative overflow-x-auto">
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
            <tr className={`mt-0 mb-0 hover:bg-blue-100 border-b`}
              key={`tr_permission_${record.serial}`} >
              <th className={`${record.deleted ? 'text-red-800' : ''} text-sm px-2 py-2`}>{record.serial}{`${record.deleted ? '[Deleted]' : ''}`}</th>
              <td className={`text-sm px-2 py-2`}>{record.name}{/* <br></br>Users assigned [10]*/}</td>
              <td className={`text-sm px-2 py-2`}>{record.description}</td>
              <td className={`text-sm px-2 py-2`}>{record.permissionCategory?.name}</td>
              <td className={`text-sm px-2 py-2`}>{record.isActive ? 'Yes' : 'No'}</td>
              <td className={`text-sm px-2 py-2`}>{record.createdBy}</td>
              <td className={`text-sm px-2 py-2`}>{record.createdAt?.toLocaleString().replace('T', ' ').substring(0, 19)}</td>
              {actions.map((action) => (
                <td className={`text-center px-2 py-0 text-sm`} key={action.name}>
                  <button style={{ margin: '0px auto' }} className={`text-sm px-2 py-2 ${action.name === 'Status' && record.name ? 'action-red inline-block px-2 py-1.5 text-red'
                    : action.name === 'Status' && !record.name ? 'action-red inline-block px-1 py-1.5 bg-green-700 text-white'
                      : 'action-blue inline-block px-3 py-1.5 text-white rounded-md hover:text-white'}`}
                    onClick={() => {
                      if (record.deleted != undefined && !record.deleted) {
                        action.handler(record);
                      }
                    }}>
                    {action.name === 'Edit' && <PencilIcon name="edit" className="h-5 w-5" color={record.deleted ? 'gray' : action.color} data-tooltip-id="my-tooltip-p" data-tooltip-content={`${record.deleted ? '' : 'Edit this permission'}`} />}
                    {action.name === 'Status' && record.isActive && <StarIcon name="success" className="h-5 w-5" color={record.deleted ? 'gray' : action.color} data-tooltip-id="my-tooltip-p" data-tooltip-content={`${record.deleted ? '' : 'Is activate, click for inactivate'}`} />}
                    {action.name === 'Status' && !record.isActive && <StopIcon name="success" className="h-5 w-5" color={record.deleted ? 'gray' : action.color} data-tooltip-id="my-tooltip-p" data-tooltip-content={`${record.deleted ? '' : 'Inactive permission, click for activate'}`} />}
                    {action.name === 'Delete' && record.name && <TrashIcon name="delete" className="h-5 w-5" color={record.deleted ? 'gray' : action.color} data-tooltip-id="my-tooltip-p" data-tooltip-content={`${record.deleted ? '' : 'Delete'}`} />}
                    {action.name === 'View' && record.name && <EyeIcon name="view" className="h-5 w-5" color={record.deleted ? 'gray' : action.color} data-tooltip-id="my-tooltip-p" data-tooltip-content={`${record.deleted ? '' : 'Preview detail this permission'}`} />}
                  </button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {/*<button onClick={handleAction}>Realizar acción</button>*/}
    </div>
  );
};

export default Table;