'use client'

import { getAllPermissionTemplates } from '@/api/permissionTemplate';
import { createRole } from '@/api/role';
import { Permission } from '@/models/permission.entity';
import { PermissionTemplate } from '@/models/permissionTemplate.entity';
import { Role } from '@/models/role.entity';
import { User } from '@/models/user.entity';
import { AuthContext } from '@/services/auth';
import { getSafeKeyObjectFromStorage } from '@/utils/safe-token-storage';
import { ArrowCircleLeftIcon, UserCircleIcon } from '@heroicons/react/outline';
import { CheckCircleIcon, InformationCircleIcon, PlusCircleIcon, SaveAsIcon, StarIcon, SupportIcon, ViewListIcon } from '@heroicons/react/solid';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import '../../components/ui/notification/notification.css';
import ToggleSwitch from '../forms/toggleSwitch';
import NotificationInline from '../layouts/icon/notification-inline';
import DropdownMenuButton from '../layouts/menu/dropdown-menu-button';
import './role.css';

const RoleComponent = () => {

    const user_: User = JSON.parse(getSafeKeyObjectFromStorage('user')) ?? {};
    const { token, otp } = useContext(AuthContext);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    useEffect(() => {
        setIsAuthenticated(!!token && !!otp);
    }, [token, otp]);

    const router = useRouter();

    const [userSession, setUserSession] = useState<User>(user_);
    const roleClean: Role = {
        _id: '',
        serial: '',
        name: '',
        description: '',
        createdAt: new Date(Date.now()),
        createdBy: userSession.name
    };

    const [role, setRole] = useState<Role>(roleClean);
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissionsTemplates, setPermissionsTemplates] = useState<PermissionTemplate[]>([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [idRoleTemplateSelected, setIdRoleTemplateSelected] = useState<string | null>();
    const [validateForm, setValidateForm] = useState<boolean>(false);

    const [roleID, setRoleID] = useState<any>();
    const [roleSerial, setRoleSerial] = useState<string>('');
    const [roleName, setRoleName] = useState<string>('');
    const [roleDescription, setRoleDescription] = useState<string>('');
    const [roleIsActive, setRoleIsActive] = useState<boolean>(false);
    const [roleIsSuperAdmin, setRoleIsSuperAdmin] = useState<boolean>(false);
    const [rolePermissionTemplate, setRolePermissionTemplate] = useState<PermissionTemplate>();
    const [labelSelected, setLabelSelected] = useState<string>('Select template');
    const [optionsPermissionsTemplate, setOptionsPermissionsTemplate] = useState<any[]>([]);

    const { register, formState: { errors } } = useForm({
        defaultValues: {
            value: role.isActive || true,
        },
    });

    const locale = 'en-US';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const processResponse = await getAllPermissionTemplates(1, 50);
                if (processResponse) {
                    setPermissionsTemplates(processResponse.permissionTemplates);

                    processResponse.permissionTemplates.forEach((element: PermissionTemplate, index) => {
                        optionsPermissionsTemplate?.push({ _id: element._id, description: element?.description, name: element.name, value: index, label: element.name, icon: 'CheckCircleIcon' });
                    });
                    setOptionsPermissionsTemplate(optionsPermissionsTemplate);
                }
            } catch (error) {
                setError(error.message);
            }
        };
        fetchData();
    }, []);

    //#region USE EFFECT
    useEffect(() => {
        if (router.query._id) {
            setRoleID(router.query._id as unknown as string);
            setRoleSerial(router.query.serial as unknown as string);
            setRoleName(router.query.name as unknown as string);
            setRoleDescription(router.query.description as string);
            setRoleIsActive(router.query.isActive as unknown as boolean);
            setRoleIsSuperAdmin(router.query.isSuperAdmin as unknown as boolean);
            setRolePermissionTemplate(router.query.permissionTemplate as unknown as PermissionTemplate);
            console.log('rolePermissionTemplateId: ', router.query.permissionTemplateId as string);
            setIdRoleTemplateSelected(router.query.permissionTemplateId as string);

            const selectedOption = permissionsTemplates.find(
                (option) => option._id === router.query.permissionTemplateId as string
            );
            console.log('selectedOption: ', selectedOption);
            if (selectedOption) {
                const permissions = sortByProperty(selectedOption?.permissions ?? [], 'serial')
                selectedOption.permissions = permissions;
                console.log('selectedOption._id:', selectedOption._id);
                setIdRoleTemplateSelected(selectedOption._id);
                setRolePermissionTemplate(selectedOption);
                setLabelSelected(selectedOption?.name)
            }
            //setIsNewRole(false);
        }
    }, [router, permissionsTemplates]);

    useEffect(() => {
        setError('');
        setSuccess('');
        const setData = async () => {
            try {
                console.log('roleID: ', roleID);
                setRole({
                    _id: roleID || '',
                    serial: roleSerial,
                    name: roleName,
                    description: roleDescription,
                    isActive: roleIsActive,
                    permissionTemplate: rolePermissionTemplate,
                    isSuperAdmin: roleIsSuperAdmin,
                    createdAt: new Date(Date.now()),
                    createdBy: userSession.name,
                });
                // setIsNewRole(false);
            } catch (error) {
                setError(error.message);
            }
        }
        if (roleID) {
            setData();
        }
    }, [roleID, idRoleTemplateSelected, roleDescription, roleIsActive, roleIsSuperAdmin, roleName, rolePermissionTemplate, roleSerial, userSession.name]);

    useEffect(() => {
        if (roleName && roleDescription && roleIsActive && roleIsSuperAdmin && rolePermissionTemplate) {
            setValidateForm(true);
        }
    }, [roleName, roleDescription, roleIsActive, idRoleTemplateSelected, rolePermissionTemplate, roleIsSuperAdmin]);

    useEffect(() => {
        const selectedOption = permissionsTemplates.find(
            (option) => option._id === idRoleTemplateSelected
        );
        console.log('selectedOption: ', selectedOption);
        if (selectedOption) {
            const permissions = sortByProperty(selectedOption?.permissions ?? [], 'serial')
            selectedOption.permissions = permissions;
            console.log('selectedOption._id:', selectedOption._id);
            setIdRoleTemplateSelected(selectedOption._id);
            setRolePermissionTemplate(selectedOption);
        }
    }, [rolePermissionTemplate?.permissions, permissionsTemplates, idRoleTemplateSelected]);

    //#endregion

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const roleCopy = { ...role }; // Create a copy of the activity object to prevent mutating the original state directly
            roleCopy.name = roleName;
            roleCopy.description = roleDescription;
            roleCopy.isActive = roleIsActive;
            roleCopy.isSuperAdmin = roleIsSuperAdmin;
            roleCopy.permissionTemplate = rolePermissionTemplate;
            const roleResponse = await createRole(roleCopy);
            if (roleResponse) {
                setSuccess('Role created successfully');
                setRole(roleClean);
            } else {
                setError('Error creating role');
            }
        } catch (error) {
            setError(error.message);
        }
    };

    const handleCancel = () => {
        router.replace('/role/role-table');
    };

    //#region SELECT
    const sortByProperty = (
        list: Permission[],
        propertyName: string
    ): Permission[] => {
        const sortedList = list.sort((a, b) => {
            return a[propertyName] - b[propertyName];
        });

        return sortedList;
    }

    const searchByProperty = (
        list: Permission[],
        propertyName: string,
        searchValue: number
    ): Permission[] => {
        const filteredList = list.filter(
            (item) => item[propertyName] === searchValue
        );

        return filteredList;
    }

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const r = e.target.value as unknown as PermissionTemplate;
        console.log('e:', r._id);
        const selectedOption = permissionsTemplates.find(
            (option) => option._id === e.target.value
        );

        if (selectedOption) {
            const permissions = sortByProperty(selectedOption?.permissions ?? [], 'serial')
            selectedOption.permissions = permissions;
            setRolePermissionTemplate(selectedOption);
            handleOnChangeTemplate(selectedOption);
        }
    };
    //#endregion

    const handleOnChangeTemplate = (e: PermissionTemplate) => {
        console.log('e:', e._id);
        setIdRoleTemplateSelected(e._id);
        setRolePermissionTemplate(e);
    };

    const handleChangeIsActive = (e: any) => {
        setRoleIsActive(e);
    };

    const handleChangeIsSuperAdmin = (e: any) => {
        setRoleIsSuperAdmin(e);
    };

    const handleChangeSelected = (option: any) => {
        console.log('Selected option: ', option);
        if (!option) {
            return;
        }

        setLabelSelected(option?.label);
        setIdRoleTemplateSelected(option?._id);
    };

    const renderOption = ({ label }) => label;

    if (!isAuthenticated) {
        return;
    }

    return (
        <div id='activity' className='mb-9'>
            {!success && <form onSubmit={handleSubmit}>
                <div className="flex space-y-12 w-full max-w-4xl max-h-dvh">
                    <div className="pb-8">
                        <StarIcon data-tooltip-id="my-tooltip-t"
                            data-tooltip-content="Generate support and new features"
                            style={{ float: 'right' }} className="justify-end h-7 w-7 text-blue-600 mt-0 mr-2"
                            onClick={() => {
                                // setShowModal(true);
                                //setIsLoading(true);
                            }} />
                        <SupportIcon data-tooltip-id="my-tooltip-t"
                            data-tooltip-content="Init tour"
                            style={{ float: 'right' }} className='justify-end h-7 w-7 text-blue-600 mt-0 mr-2'
                        />
                        <h1 className="h1-2 flex text-base font-semibold leading-9 text-gray-900">
                            <UserCircleIcon data-tooltip-id="my-tooltip-t"
                                data-tooltip-content="The approval process loads the information of the .cvs file, in a collection within a database"
                                style={{ float: 'left' }} name="info" className="h-10 w-10 text-blue-600 mt-0 mr-2" color="#ff0000" /> User roles
                        </h1>
                        <NotificationInline message={success} />
                        <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-12">
                            <div className="sm:col-span-2">
                                <label htmlFor="roleFlowPositionInProcess" className="block text-sm font-medium leading-6 text-gray-900">
                                    Is super admin
                                </label>
                                <div className="mt-3">
                                    <div className="flex sm:max-w-md">

                                        <ToggleSwitch initialValue={roleIsSuperAdmin} label="" handleChange={handleChangeIsSuperAdmin} />
                                    </div>
                                </div>
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="roleSerial" className="block text-sm font-medium leading-6 text-gray-900">
                                    Serial
                                </label>
                                <div className="mt-2">
                                    <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-500 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600 sm:max-w-md">
                                        <span className="flex select-none items-center pl-2 text-gray-500 sm:text-sm">No. </span>
                                        <input
                                            type="text"
                                            name="roleSerial"
                                            id="roleSerial"
                                            value={roleSerial}
                                            disabled
                                            onChange={(e) => {
                                                setRoleSerial(e.target.value);
                                            }}
                                            className="text-lg md:font-bold block flex-1 text-bold border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-800 focus:ring-0 sm:text-sm sm:leading-6"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="sm:col-span-6">
                                <label htmlFor="roleName" className="block text-sm font-medium leading-6 text-gray-900">
                                    Name or alias
                                </label>
                                <div className="mt-2">
                                    <div className="bg-white flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600 sm:max-w-md">
                                        <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">Name: </span>
                                        <input
                                            type="text"
                                            name="roleName"
                                            id="roleName"
                                            value={roleName}
                                            onChange={(e) => {
                                                setRoleName(e.target.value);
                                            }}
                                            className="text-lg md:font-bold block flex-1 text-bold border-0 bg-transparent py-1.5 pl-6 text-gray-900 placeholder:text-gray-800 focus:ring-0 sm:text-sm sm:leading-6"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="roleFlowPositionInProcess" className="block text-sm font-medium leading-6 text-gray-900">
                                    Is active
                                </label>
                                <div className="mt-3">
                                    <div className="flex sm:max-w-md">
                                        <ToggleSwitch initialValue={roleIsActive} label="" handleChange={handleChangeIsActive} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-9">
                            <div className="sm:col-span-9">
                                <label htmlFor="first-name" className="block text-sm font-medium leading-6 text-gray-900">
                                    Description
                                    <InformationCircleIcon data-tooltip-id="my-tooltip-p" data-tooltip-content="Add description for more info about this role!"
                                        style={{ float: 'right' }} name="info" className="h-6 w-6 text-blue-500" color="#ff0000" />
                                </label>
                                <div className="mt-1">
                                    <textarea
                                        name="description"
                                        id="description"
                                        data-tooltip-id="my-tooltip-t" data-tooltip-content="Notes!"
                                        value={roleDescription}
                                        onChange={(e) => {
                                            setRoleDescription(e.target.value);
                                        }}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-12">
                            <div className="sm:col-span-4">
                                <label htmlFor="first-name" className="block text-sm font-medium leading-6 text-gray-900 mb-2">
                                    Permissions template
                                </label>
                                <DropdownMenuButton
                                    label={labelSelected}
                                    options={optionsPermissionsTemplate}
                                    renderOption={renderOption}
                                    onSelect={handleChangeSelected}
                                    valueSelected={labelSelected}
                                />
                            </div>
                        </div>
                        <div className="mt-0 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-7">
                        </div>
                    </div>
                </div>
                {rolePermissionTemplate?.permissions && rolePermissionTemplate?.permissions?.length > 0 && <div className={`block mb-2 text-md font-medium text-gray-900 dark:text-gray-300`}>
                    Permissions in the template
                </div>}
                <ul
                    className="list-none p-0"
                >
                    {rolePermissionTemplate?.permissions?.map((item) => (
                        <li
                            key={item._id}
                            className="cursor-move py-1 px-3 bg-gray-100 max-w-4xl rounded-md m-1 text-sm"
                            draggable="true"
                        >
                            <strong>[{item.serial}] {item.name}</strong> - {item.permissionCategory?.name} - {item.description}
                        </li>
                    ))}
                </ul>
                <div className="mt-6 flex items-center justify-end gap-x-6">
                    <div className="relative">
                        <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none pr-4">
                            <ArrowCircleLeftIcon name="success" className="h-6 w-8 text-white-500" color="#FFFFFF" />
                        </div>
                        <button onClick={handleCancel} type="button" className="rounded-md bg-blue-500 hover:bg-blue-600 px-3 py-1.5 pl-12 text-sm font-semibold leading-6 text-white">
                            Go back
                        </button>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none mr-4">
                            <SaveAsIcon name="success" className="h-6 w-8 text-white-500" color="#FFFFFF" />
                        </div>
                        <button
                            type="submit"
                            disabled={!validateForm}
                            className={`${validateForm ? 'bg-blue-600 hover:bg-blue-500 ' : 'bg-gray-500 hover:bg-gray-500 '}rounded-md px-3 py-2 pl-12 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600`}
                        >
                            Save role
                        </button>
                    </div>
                </div>
            </form>}
            {success && <div className="fixed inset-0 flex items-center justify-center z-50" style={{ pointerEvents: 'auto' }} >
                <div className="bg-white rounded-lg shadow-lg p-8" >
                    <div className="flex h-6 items-center justify-center pt-2">
                        <CheckCircleIcon name="beakerIcon" className="h-9 w-9 text-white-500 mr-2" color="#3c763d" />
                        <div className="text-sm leading-6">
                            <label className="font-medium text-gray-900">
                                Success in the update role
                            </label>
                        </div>
                    </div>

                    <div className="mt-0 grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-10">
                        <div className="sm:col-span-5">
                            <div className="relative mt-8">
                                <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none mr-20">
                                    <ViewListIcon name="viewListIcon" className="h-6 w-8 text-white-500" color="#FFFFFF" />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => router.push('/role/role-table')}
                                    className="rounded-md bg-green-600 px-3 py-2 pl-12 text-sm font-semibold shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 text-white"
                                >
                                    Go back
                                </button>
                            </div>
                        </div>
                        <div className="sm:col-span-5">
                            <div className="relative mt-8">
                                <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none mr-20">
                                    <PlusCircleIcon name="success" className="h-6 w-8 text-white-500" color="#FFFFFF" />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => router.replace('/role/role')}
                                    className="rounded-md bg-blue-600 px-3 py-2 pl-12 text-sm font-semibold shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 text-white"
                                >
                                    New role
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>}
        </div>
    );
};

export default RoleComponent;