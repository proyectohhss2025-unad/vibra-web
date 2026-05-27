import { createFeedback } from '@/api/feedback';
import { getAllCategories, getAllPermissionsByCategory } from '@/api/permission';
import { Permission } from '@/models/permission.entity';
import { PermissionCategory } from '@/models/permissionCategory.entity';
import { ArrowRightIcon, CheckIcon, ExclamationIcon, RefreshIcon, StarIcon, UserCircleIcon } from '@heroicons/react/solid';
import { useTour } from '@reactour/tour';
import React, { useEffect, useState } from 'react';
import FeedbackModal from '../feedback/feedback-modal';
import Loading from '../layouts/loading/loading';
import DropdownMenuButton from '../layouts/menu/dropdown-menu-button';
import Search from '../search/search';
import Notification from '../ui/notification/notification';
import PermissionUserDataPage from './permission-user-data-page';

interface Action {
  name: string;
  color: string;
  handler: (permission: Permission) => void;
}

interface TableProps {
  data: Permission[];
  actions: Action[];
  children?: React.ReactNode;
  userID: string;
  setPermissions_: (permissions: Permission[]) => void;
}

const MiniUserTable: React.FC<TableProps> = ({ data, userID, actions, setPermissions_, children }) => {
  const [idPermissionCategorySelected, setIdPermissionCategorySelected] = useState<string | null>();
  const [permissionsCategory, setPermissionsCategory] = useState<PermissionCategory[]>([]);
  const [error, setError] = useState('');
  const [permissions, setPermissions] = useState<Permission[]>(data);
  const [isLoading, setIsLoading] = useState(false);
  const [labelSelectedPermissionCategory, setLabelSelectedPermissionCategory] = useState<string>('Select a category');
  const [optionsPermissionCategory, setOptionsPermissionCategory] = useState<any[]>([]);
  const [showModalFeedback, setShowModalFeedback] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [typeNotification, setTypeNotification] = useState<'success' | 'info' | 'warning' | 'error'>('info');

  const { setIsOpen } = useTour();


  useEffect(() => {
    const fetchData = async () => {
      try {
        const processResponse = await getAllCategories(1, 50);
        if (processResponse) {
          setPermissionsCategory(processResponse.permissionsCategory);

          processResponse.permissionsCategory.forEach((element: PermissionCategory, index) => {
            optionsPermissionCategory?.push({ _id: element._id, description: element?.description, name: element.name, value: index, label: element.name, icon: 'CheckCircleIcon' });
          });
          setOptionsPermissionCategory(optionsPermissionCategory);
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

  const handleChangeSelectedPermissionCategory = (option: any) => {
    if (!option) {
      return;
    }
    setLabelSelectedPermissionCategory(option?.label);
    setIdPermissionCategorySelected(option?._id);
    getPermissionsByCategory(option?._id);
  };

  const renderOption = ({ label }) => label;
  //#endregion

  const handleFeedbackSubmit = async (message: string, type: 'improvement' | 'support') => {
    try {
      const response: any = await createFeedback({
        _id: '',
        title: 'Feedback from activity module',
        description: message,
        isFeature: type == 'improvement',
        isSupport: type == 'support',
        createdAt: new Date(Date.now()),
        createdBy: '', //user_.name
      });

      if (response) {
        setMessage('Comments sent successfully');
        setIsLoading(false);
      }
    } catch (error) {
      setMessage(`${error}`);
    }
  };

  return (
    <div className="grid grid-cols overflow-x-auto">
      <div className="items-center mb-3">
        <div className="mt-0 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-12">
          <div className="flex sm:col-span-4 items-left justify-start">
            <h1 className="h1-2 flex text-base font-semibold leading-9 text-gray-900 mt-3">
              <UserCircleIcon style={{ float: 'left' }} name="info" className="h-10 w-10 text-blue-600 mt-0 mr-2" color="#ff0000" /> Permisos
            </h1>
          </div>
          <div className="sm:col-span-4 items-left flex justify-start">
            <Search isOpen={true} onClose={() => { }} setData={setPermissions} entity='permission' setIsLoading={setIsLoading}>
              <div className='flex justify-end align-items mb-3'>
                <RefreshIcon data-tooltip-id="my-tooltip-t"
                  data-tooltip-content="Refrescar esta lista"
                  className="justify-start h-7 w-7 text-blue-600 ml-4 mr-0 mt-3 cursor-pointer font-semibold hover:text-green"
                  onClick={() => {
                    setPermissions_([]);
                    //console.log('Refrescar esta lista');
                  }} />
              </div>
            </Search>
          </div>
          <div className="sm:col-span-4 mt-4 mr-2">
            <DropdownMenuButton
              label={labelSelectedPermissionCategory}
              options={optionsPermissionCategory}
              renderOption={renderOption}
              onSelect={handleChangeSelectedPermissionCategory}
              valueSelected={labelSelectedPermissionCategory}
            />
          </div>
        </div>
      </div>
      <div className="w-full mt-2 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-12">
        <div className="sm:col-span-8">
          <div className='scrollbar-div' style={{ height: "52vh", overflowY: "auto" }}>
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
                    <td className={`${record.deleted ? 'text-red-800 bg-gray-200 ' : ''} text-sm px-1 py-1`}>{record.serial}{`${record.deleted ? '[Del]' : ''}`}</td>
                    <td className={`text-sm px-1 py-1 ${record.deleted === true ? ' bg-gray-200 ' : ' '}`}>{record.name}</td>
                    <td className={`text-sm px-1 py-1 ${record.deleted === true ? ' bg-gray-200 ' : ' '}`}>{record.description}</td>
                    {actions.map((action) => (
                      <td className={`text-sm px-1 py-1 ${record.deleted === true ? ' bg-gray-200' : ''} text-center px-2 py-0 text-sm`} key={action.name}>
                        <button style={{ margin: '0px auto' }} className={`text-sm px-1 py-1 ${record.deleted === true ? ' bg-gray-200' : ''} ${action.name === 'Status' && record.name ? 'action-red inline-block px-1 py-1 text-red'
                          : action.name === 'Status' && !record.name ? 'action-red inline-block px-1 py-1 bg-green-700 text-white'
                            : 'action-blue inline-block px-1 py-1 text-white rounded-md hover:text-white'}`}
                          onClick={() => {
                            if (record.deleted != undefined && !record.deleted && !record.isAssigned) {
                              action.handler(record);
                            }
                          }}>
                          {record.isAssigned && <CheckIcon name="success" className="h-5 w-5" color='green' data-tooltip-id="my-tooltip-p" data-tooltip-content='Permission is assigned' />}
                          {!record.isAssigned && action.name === 'Action' && record.isActive && <ArrowRightIcon name="success" className="h-5 w-5" color={record.deleted ? 'gray' : action.color} data-tooltip-id="my-tooltip-p" data-tooltip-content={`${record.deleted ? '' : 'Permission not assigned to template, click for assigned'}`} />}
                          {!record.isAssigned && action.name === 'Action' && !record.isActive && <ExclamationIcon name="inactive" className="h-5 w-5" color={record.deleted ? 'red' : action.color} data-tooltip-id="my-tooltip-p" data-tooltip-content={`${record.deleted ? '' : 'Permission assigned, click for remove assign'}`} />}
                        </button>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="sm:col-span-4">
          {<PermissionUserDataPage permissions={permissions} userID={userID} />}
        </div>
      </div>
      <div className='flex items-center'>
        <StarIcon
          style={{ float: 'right' }} className="justify-end h-7 w-7 text-blue-600 mt-0 mr-2"
          onClick={() => {
            setShowModalFeedback(true);
            setIsLoading(true);
          }} />
        {message != '' && <Notification type={'success'} message={message} setMessage={setMessage} onClose={() => { setMessage('') }} />}
      </div>
      <FeedbackModal
        isOpen={showModalFeedback}
        initialType="improvement"
        onClose={() => {
          setShowModalFeedback(false);
          setIsLoading(false);
        }}
        onSubmit={async (data) => {
          await handleFeedbackSubmit(data.description, data.type as 'improvement' | 'support');
        }}
      />
      {isLoading && <div className="loading-container"><Loading /></div>}
    </div>
  );
};

export default MiniUserTable;