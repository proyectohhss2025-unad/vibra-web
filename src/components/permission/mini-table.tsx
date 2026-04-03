import { getAllCategories, getAllPermissionsByCategory } from '@/api/permission';
import { Permission } from '@/models/permission.entity';
import { PermissionCategory } from '@/models/permissionCategory.entity';
import { ArrowRightIcon, CheckCircleIcon, RefreshIcon } from '@heroicons/react/outline';
import React, { useEffect, useState } from 'react';
import Select from '../forms/select';
import Search from '../search/search';

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

const MiniTable: React.FC<TableProps> = ({ data, actions, children }) => {
  const [idPermissionCategorySelected, setIdPermissionCategorySelected] = useState<string | null>();
  const [permissionsCategory, setPermissionsCategory] = useState<PermissionCategory[]>([]);
  const [error, setError] = useState('');
  const [permissions, setPermissions] = useState<Permission[]>(data);
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="relative overflow-x-auto">
      <div className="relative mb-3 float-right sm:block">
        <div className="mt-0 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-12">
          <div className="flex sm:col-span-6 items-left justify-start">
            <Search isOpen={true} onClose={() => { }} setData={setPermissions} entity='permission' setIsLoading={setIsLoading}>
              <div className='flex justify-end align-items mb-3'>
                <RefreshIcon data-tooltip-id="my-tooltip-t"
                  data-tooltip-content="Refrescar esta lista"
                  className="justify-start h-7 w-7 text-blue-600 ml-4 mr-0 mt-3 cursor-pointer font-semibold hover:text-green"
                  onClick={() => {
                    console.log('');
                  }} />
              </div>
            </Search>
          </div>
          <div className="sm:col-span-6">
            <Select label='Category' options={permissionsCategory} selectedValue={idPermissionCategorySelected} onChange={handleFilter} className='mt-1 flex' classNameLabel='mt-3 mr-4' />
          </div>
        </div>
      </div>
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
            <tr className={`mt-0 mb-0 hover:bg-neutral-200 border-b`}
              key={`tr_permission_${record.serial}`} >
              <th className={`${record.deleted ? 'text-red-800' : ''} text-sm px-2 py-2`}>{record.serial}{`${record.deleted ? '[Deleted]' : ''}`}</th>
              <td className={`text-sm px-2 py-2 ${record.deleted === true ? ' bg-gray-200 ' : ''}`}>{record.name} <br></br>Templates assigned [10]</td>
              <td className={`text-sm px-2 py-2 ${record.deleted === true ? ' bg-gray-200 ' : ''}`}>{record.description}</td>
              {actions.map((action) => (
                <td className={`text-sm px-2 py-2 ${record.deleted === true ? ' bg-gray-200' : ''} text-center px-2 py-0 text-sm`} key={action.name}>
                  <button style={{ margin: '0px auto' }} className={`text-sm px-2 py-2 ${record.deleted === true ? ' bg-gray-200' : ''} ${action.name === 'Status' && record.name ? 'action-red inline-block px-2 py-1.5 text-red hover:bg-white'
                    : action.name === 'Status' && !record.name ? 'action-red inline-block px-1 py-1.5 bg-green-700 text-white hover:bg-white'
                      : 'action-blue inline-block px-3 py-1.5 text-white rounded-md hover:bg-white hover:text-white'}`}
                    onClick={() => {
                      if (record.deleted != undefined && !record.deleted) {
                        action.handler(record);
                      }
                    }}>
                    {action.name === 'Action' && record.isActive && <ArrowRightIcon name="success" className="h-5 w-5" color={record.deleted ? 'gray' : action.color} data-tooltip-id="my-tooltip-p" data-tooltip-content={`${record.deleted ? '' : 'Permission not assigned to template, click for assigned'}`} />}
                    {action.name === 'Action' && !record.isActive && <CheckCircleIcon name="success" className="h-5 w-5" color={record.deleted ? 'gray' : action.color} data-tooltip-id="my-tooltip-p" data-tooltip-content={`${record.deleted ? '' : 'Permission assigned, click for remove assign'}`} />}
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

export default MiniTable;