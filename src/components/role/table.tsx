import { getAllRolesByCategory } from '@/api/role';
import { Role } from '@/models/role.entity';
import { EyeIcon, LibraryIcon, PencilIcon, StopIcon } from '@heroicons/react/outline';
import { StarIcon, TemplateIcon, TrashIcon } from '@heroicons/react/solid';
import React, { useEffect, useState } from 'react';
import './table.css';

interface Action {
  name: string;
  color: string;
  handler: (role: Role) => void;
}

interface TableProps {
  data: Role[];
  actions: Action[];
  children?: React.ReactNode;
}

const Table: React.FC<TableProps> = ({ data, actions, children }) => {
  const [idRoleCategorySelected, setIdRoleCategorySelected] = useState<string | null>();
  const [error, setError] = useState('');
  const [roles, setRoles] = useState<Role[]>(data);

  useEffect(() => {
    setRoles(data);
  }, [data]);

  const handleFilter = (e) => {
    setIdRoleCategorySelected(e);
    getRolesByCategory(e);
  };

  //#region FILTER
  const getRolesByCategory = async (idRoleCategory: string) => {
    try {
      const roleResponse = await getAllRolesByCategory(idRoleCategory, 1, 50);
      if (roleResponse) {
        setRoles(roleResponse.roles);
      }
    } catch (error) {
      setError(error.message);
    }
  };
  //#endregion

  return (
    <div id="roles" className="relative overflow-x-auto">
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
          {roles.map((record) => (
            <tr className={`mt-0 mb-0 hover:bg-blue-100 border-b`}
              key={`tr_role_${record.serial}`} >
              <th className={`${record.deleted ? 'text-red-800' : ''} text-sm px-2 py-2`}>{record.serial}{`${record.deleted ? '[Deleted]' : ''}`}</th>
              <td className={`text-sm px-2 py-2 ${record.deleted === true ? ' bg-gray-100 ' : ' '}`}>{record.name} <br></br>Users assigned [10]</td>
              <td className={`text-sm px-2 py-2 ${record.deleted === true ? ' bg-gray-100 ' : ' '}`}>{record.description}</td>
              <td className={`text-sm px-2 py-2 ${record.deleted === true ? ' bg-gray-100 ' : ' '}`}>{record.isSuperAdmin ? 'Yes' : 'No'}</td>
              <td className={`text-sm px-2 py-2 ${record.deleted === true ? ' bg-gray-100 ' : ' '}`}>{record.isActive ? 'Yes' : 'No'}</td>
              <td className={`text-sm px-2 py-2 ${record.deleted === true ? ' bg-gray-100 ' : ' '}`}>{record.createdBy}</td>
              <td className={`text-sm px-2 py-2 ${record.deleted === true ? ' bg-gray-100 ' : ' '}`}>{record.createdAt?.toLocaleString().replace('T', ' ').substring(0, 19)}</td>
              {actions.map((action) => (
                <td className={`text-sm px-2 py-2 ${record.deleted === true ? ' bg-gray-100' : ' '} text-left px-2 py-0 text-sm`} key={action.name}>
                  <button style={{ margin: '0px auto' }} className={`flex text-sm px-2 py-2 hover:text-gray-800 ${record.deleted === true ? ' bg-gray-100' : ''} ${action.name === 'Status' && record.name ? 'action-red inline-block px-2 py-1.5 text-red'
                    : action.name === 'Status' && !record.name ? 'action-red inline-block px-1 py-1.5 bg-green-700'
                      : 'action-blue inline-block px-3 py-1.5 rounded-md'}`}
                    onClick={() => {
                      if (record.deleted != undefined && !record.deleted) {
                        action.handler(record);
                      }
                    }}>
                    {action.name === 'Templates' && <div className='w-full flex items-center left-0'><TemplateIcon name="templates" className="h-5 w-5 text-blue-500" color={record.deleted ? 'gray' : ''} data-tooltip-id="my-tooltip-p" data-tooltip-content={`${record.deleted ? '' : 'Edit template'}`} />{action.name === 'Templates' ? record.permissionTemplate?.name : ''}</div>}
                    {action.name === 'Edit' && <PencilIcon name="edit" className="h-5 w-5" color={record.deleted ? 'gray' : action.color} data-tooltip-id="my-tooltip-p" data-tooltip-content={`${record.deleted ? '' : 'Edit this role'}`} />}
                    {action.name === 'Status' && record.isActive && <StarIcon name="success" className="h-5 w-5" color={record.deleted ? 'gray' : action.color} data-tooltip-id="my-tooltip-p" data-tooltip-content={`${record.deleted ? '' : 'Is activate, click for inactivate'}`} />}
                    {action.name === 'Status' && !record.isActive && <StopIcon name="success" className="h-5 w-5" color={record.deleted ? 'gray' : action.color} data-tooltip-id="my-tooltip-p" data-tooltip-content={`${record.deleted ? '' : 'Inactive role, click for activate'}`} />}
                    {action.name === 'Delete' && record.name && <TrashIcon name="delete" className="h-5 w-5" color={record.deleted ? 'gray' : action.color} data-tooltip-id="my-tooltip-p" data-tooltip-content={`${record.deleted ? '' : 'Delete'}`} />}
                    {action.name === 'View' && record.name && <EyeIcon name="view" className="h-5 w-5" color={record.deleted ? 'gray' : action.color} data-tooltip-id="my-tooltip-p" data-tooltip-content={`${record.deleted ? '' : 'Preview detail this role'}`} />}
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