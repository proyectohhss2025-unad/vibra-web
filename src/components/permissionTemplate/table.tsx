import { getAllPermissionTemplatesByCategory } from '@/api/permissionTemplate';
import { PermissionTemplate } from '@/models/permissionTemplate.entity';
import { CubeIcon, EyeIcon, LibraryIcon, PencilIcon, StopIcon } from '@heroicons/react/outline';
import { StarIcon, TrashIcon } from '@heroicons/react/solid';
import React, { useEffect, useState } from 'react';
import './table.css';

interface Action {
  name: string;
  color: string;
  handler: (permissionTemplate: PermissionTemplate) => void;
}

interface TableProps {
  data: PermissionTemplate[];
  actions: Action[];
  children?: React.ReactNode;
}

const Table: React.FC<TableProps> = ({ data, actions, children }) => {
  const [idPermissionTemplateCategorySelected, setIdPermissionTemplateCategorySelected] = useState<string | null>();
  const [error, setError] = useState('');
  const [permissionTemplates, setPermissionTemplates] = useState<PermissionTemplate[]>(data);

  useEffect(() => {
    setPermissionTemplates(data);
  }, [data]);

  const handleFilter = (e) => {
    setIdPermissionTemplateCategorySelected(e);
    getPermissionTemplatesByCategory(e);
  };

  //#region FILTER
  const getPermissionTemplatesByCategory = async (idPermissionTemplateCategory: string) => {
    try {
      const permissionTemplateResponse = await getAllPermissionTemplatesByCategory(idPermissionTemplateCategory, 1, 50);
      if (permissionTemplateResponse) {
        setPermissionTemplates(permissionTemplateResponse.permissionTemplates);
      }
    } catch (error) {
      setError(error.message);
    }
  };
  //#endregion

  return (
    <div id='permissionTemplates' className="relative overflow-x-auto">
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
          {permissionTemplates.map((record) => (
            <tr className={`mt-0 mb-0 hover:bg-blue-100 border-b`}
              key={`tr_permissionTemplate_${record.serial}`} >
              <th className={`${record.deleted ? 'text-red-800' : ''} text-sm px-2 py-2`}>{record.serial}{`${record.deleted ? '[Deleted]' : ''}`}</th>
              <td className={`text-sm px-2 py-2 ${record.deleted === true ? ' bg-gray-200 ' : ' '}`}>{record.name} <br></br>Roles assigned [10]</td>
              <td className={`text-sm px-2 py-2 ${record.deleted === true ? ' bg-gray-200 ' : ' '}`}>{record.description}</td>
              <td className={`text-sm px-2 py-2 ${record.deleted === true ? ' bg-gray-200 ' : ' '}`}>{record.isActive ? 'Yes' : 'No'}</td>
              <td className={`text-sm px-2 py-2 ${record.deleted === true ? ' bg-gray-200 ' : ' '}`}>{record.createdBy}</td>
              <td className={`text-sm px-2 py-2 ${record.deleted === true ? ' bg-gray-200 ' : ' '}`}>{record.createdAt?.toLocaleString().replace('T', ' ').substring(0, 19)}</td>
              {actions.map((action) => (
                <td className={`text-sm px-2 py-2 ${record.deleted === true ? ' bg-gray-200' : ' '} text-center px-2 py-0 text-sm`} key={action.name}>
                  <button style={{ margin: '0px auto' }} className={`flex text-sm px-2 py-2 hover:text-gray-800 ${record.deleted === true ? ' bg-gray-200' : ''} ${action.name === 'Status' && record.name ? 'action-red inline-block px-2 py-1.5 text-red'
                    : action.name === 'Status' && !record.name ? 'action-red inline-block px-1 py-1.5 bg-green-700'
                      : 'action-blue inline-block px-3 py-1.5'}`}
                    onClick={() => {
                      if (record.deleted != undefined && !record.deleted) {
                        action.handler(record);
                      }
                    }}>
                    {action.name === 'Permissions' && <CubeIcon name="templates" className="h-5 w-5 text-white-500" color={record.deleted ? 'gray' : action.color} data-tooltip-id="my-tooltip-p" data-tooltip-content={`${record.deleted ? '' : 'Edit templates'}`} />}
                    {action.name === 'Edit' && <PencilIcon name="edit" className="h-5 w-5 text-white-500" color={record.deleted ? 'gray' : action.color} data-tooltip-id="my-tooltip-p" data-tooltip-content={`${record.deleted ? '' : 'Edit this permissionTemplate'}`} />}
                    {action.name === 'Status' && record.isActive && <StarIcon name="success" className="h-5 w-5" color={record.deleted ? 'gray' : action.color} data-tooltip-id="my-tooltip-p" data-tooltip-content={`${record.deleted ? '' : 'Is activate, click for inactivate'}`} />}
                    {action.name === 'Status' && !record.isActive && <StopIcon name="success" className="h-5 w-5" color={record.deleted ? 'gray' : action.color} data-tooltip-id="my-tooltip-p" data-tooltip-content={`${record.deleted ? '' : 'Inactive permissionTemplate, click for activate'}`} />}
                    {action.name === 'Delete' && record.name && <TrashIcon name="delete" className="h-5 w-5" color={record.deleted ? 'gray' : action.color} data-tooltip-id="my-tooltip-p" data-tooltip-content={`${record.deleted ? '' : 'Delete'}`} />}
                    {action.name === 'View' && record.name && <EyeIcon name="view" className="h-5 w-5" color={record.deleted ? 'gray' : action.color} data-tooltip-id="my-tooltip-p" data-tooltip-content={`${record.deleted ? '' : 'Preview detail this permissionTemplate'}`} />}
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