'use client'

import { createPermission, getAllCategories } from '@/api/permission';
import { Permission } from '@/models/permission.entity';
import { PermissionCategory } from '@/models/permissionCategory.entity';
import { User } from '@/models/user.entity';
import { AuthContext } from '@/services/auth';
import { getSafeKeyObjectFromStorage } from '@/utils/safe-token-storage';
import { ArrowCircleLeftIcon, BeakerIcon, BellIcon, UserCircleIcon } from '@heroicons/react/outline';
import { CheckCircleIcon, InformationCircleIcon, PlusCircleIcon, SaveAsIcon, StarIcon, SupportIcon, ViewListIcon } from '@heroicons/react/solid';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import '../../components/ui/notification/notification.css';
import Checkbox from '../forms/checkbox';
import Select from '../forms/select';
import NotificationInline from '../layouts/icon/notification-inline';
import './permission.css';
import ToggleSwitch from '../forms/toggleSwitch';
import DropdownMenuButton from '../layouts/menu/dropdown-menu-button';

const PermissionComponent = () => {

    const user_: User = JSON.parse(getSafeKeyObjectFromStorage('user')) ?? {};
    const { token, otp } = useContext(AuthContext);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [labelSelected, setLabelSelected] = useState<string>('Select category');

    useEffect(() => {
        setIsAuthenticated(!!token && !!otp);
    }, [token, otp]);

    const router = useRouter();
    const [userSession, setUserSession] = useState<User>(user_);
    const permissionClean: Permission = {
        _id: '',
        serial: '',
        name: '',
        description: '',
        createdAt: new Date(Date.now()),
        createdBy: userSession.name,
        permissionCategory: new PermissionCategory(),
        isAssigned: false
    };

    const [permission, setPermission] = useState<Permission>(permissionClean);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [permissionsCategory, setPermissionsCategory] = useState<PermissionCategory[]>([]);
    const [idPermissionCategorySelected, setIdPermissionCategorySelected] = useState<string | null>();
    const [validateForm, setValidateForm] = useState<boolean>(false);

    const [permissionID, setPermissionID] = useState<any>();
    const [permissionSerial, setPermissionSerial] = useState<string>('');
    const [permissionName, setPermissionName] = useState<string>('');
    const [permissionDescription, setPermissionDescription] = useState<string>('');
    const [permissionIsActive, setPermissionIsActive] = useState<boolean>(false);
    const [permissionPermissionCategory, setPermissionPermissionCategory] = useState<string>('');
    const [optionsPermissionsCategory, setOptionsPermissionsCategory] = useState<any[]>([]);

    const { register, formState: { errors } } = useForm({
        defaultValues: {
            value: permission.isActive || true,
        },
    });

    const locale = 'en-US';

    //#region USE EFFECT
    useEffect(() => {
        if (router.query._id) {
            setPermissionID(router.query._id as unknown as string);
            setPermissionSerial(router.query.serial as unknown as string);
            setPermissionName(router.query.name as unknown as string);
            setPermissionDescription(router.query.description as string);
            setPermissionIsActive(router.query.isActive as unknown as boolean);
            setPermissionPermissionCategory(router.query.permissionCategory as unknown as string);
            setIdPermissionCategorySelected(router.query.permissionCategory as unknown as string);


            const selectedOptionDocumentType: any = optionsPermissionsCategory.find((option) => option._id === router.query.permissionCategory);
            setLabelSelected(selectedOptionDocumentType?.name);

        }
    }, [router.query._id, optionsPermissionsCategory?.length]);

    useEffect(() => {
        setError('');
        setSuccess('');
        const setData = async () => {
            try {
                //logger.info('permissionID: ', permissionID);
                setPermission({
                    _id: permissionID || '',
                    serial: permissionSerial,
                    name: permissionName,
                    description: permissionDescription,
                    permissionCategory: {
                        _id: permissionPermissionCategory
                    } as unknown as PermissionCategory,
                    createdAt: new Date(Date.now()),
                    createdBy: userSession.name,
                    isAssigned: false
                });
            } catch (error) {
                setError(error.message);
            }
        }
        if (permissionID) {
            setData();
        }
    }, [permissionID, permissionPermissionCategory, permissionDescription, permissionName, permissionSerial, userSession.name]);

    useEffect(() => {
        if (permissionName && permissionDescription && permissionIsActive && idPermissionCategorySelected) {
            setValidateForm(true);
        }
    }, [permissionName, permissionDescription, permissionIsActive, idPermissionCategorySelected]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const processResponse = await getAllCategories(1, 50);
                if (processResponse) {
                    setPermissionsCategory(processResponse.permissionsCategory);

                    processResponse.permissionsCategory.forEach((element: PermissionCategory, index) => {
                        optionsPermissionsCategory?.push({ _id: element?._id, description: element?.description, name: element.name, value: index, label: element.name, icon: 'CheckCircleIcon' });
                    });
                    setOptionsPermissionsCategory(optionsPermissionsCategory);
                }
            } catch (error) {
                setError(error.message);
            }
        };
        fetchData();
    }, []);


    //#endregion

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const permissionCopy = { ...permission }; // Create a copy of the activity object to prevent mutating the original state directly
            permissionCopy.name = permissionName;
            permissionCopy.description = permissionDescription;
            permissionCopy.isActive = permissionIsActive;
            permissionCopy.permissionCategory = {
                _id: idPermissionCategorySelected
            } as unknown as PermissionCategory;

            const permissionResponse = await createPermission(permissionCopy);
            if (permissionResponse) {
                setSuccess('Permission created successfully');
                setPermission(permissionClean);
            } else {
                setError('Error creating permission');
            }
        } catch (error) {
            setError(error.message);
        }
    };

    const handleCancel = () => {
        router.replace('/permission/permission-table');
    };

    const handleOnChange = (e: any) => {
        setIdPermissionCategorySelected(e)
    };

    const handleChangeSelected = (option: any) => {
        console.log('Selected option: ', option);
        if (!option) {
            return;
        }

        setLabelSelected(option?.label);
        setIdPermissionCategorySelected(option?._id);
    };


    const handleChange = (e: any) => {
        setPermissionIsActive(e);
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
                                style={{ float: 'left' }} name="info" className="h-10 w-10 text-blue-600 mt-0 mr-2" color="#ff0000" /> User permissions
                        </h1>
                        <NotificationInline message={success} />
                        <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-12">
                            <div className="sm:col-span-4">
                                <label htmlFor="permissionSerial" className="block text-sm font-medium leading-6 text-gray-900 mb-2">
                                    Category
                                </label>
                                <DropdownMenuButton
                                    label={labelSelected}
                                    options={optionsPermissionsCategory}
                                    renderOption={renderOption}
                                    onSelect={handleChangeSelected}
                                    valueSelected={labelSelected}
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="permissionSerial" className="block text-sm font-medium leading-6 text-gray-900">
                                    Serial
                                </label>
                                <div className="mt-2">
                                    <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600 sm:max-w-md">
                                        <span className="flex select-none items-center pl-2 text-gray-500 sm:text-sm">No. </span>
                                        <input
                                            type="text"
                                            name="permissionSerial"
                                            id="permissionSerial"
                                            value={permissionSerial}
                                            placeholder='Autogenerate'
                                            disabled
                                            onChange={(e) => {
                                                setPermissionSerial(e.target.value);
                                            }}
                                            className="text-lg md:font-bold block flex-1 text-bold border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-800 focus:ring-0 sm:text-sm sm:leading-6"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="sm:col-span-4">
                                <label htmlFor="permissionName" className="block text-sm font-medium leading-6 text-gray-900">
                                    Name or alias
                                </label>
                                <div className="mt-2">
                                    <div className="bg-white flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-600 sm:max-w-md">
                                        <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">Name: </span>
                                        <input
                                            type="text"
                                            name="permissionName"
                                            id="permissionName"
                                            value={permissionName}
                                            onChange={(e) => {
                                                setPermissionName(e.target.value);
                                            }}
                                            className="text-lg md:font-bold block flex-1 text-bold border-0 bg-transparent py-1.5 pl-6 text-gray-900 placeholder:text-gray-800 focus:ring-0 sm:text-sm sm:leading-6"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="permissionFlowPositionInProcess" className="block text-sm font-medium leading-6 text-gray-900">
                                    Is active
                                </label>
                                <div className="mt-3">
                                    <div className="flex sm:max-w-md">
                                        <ToggleSwitch initialValue={permissionIsActive} label="" handleChange={handleChange} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-9">
                            <div className="sm:col-span-9">
                                <label htmlFor="first-name" className="block text-sm font-medium leading-6 text-gray-900">
                                    Description
                                    <InformationCircleIcon data-tooltip-id="my-tooltip-p" data-tooltip-content="Add description for more info about this permission!"
                                        style={{ float: 'right' }} name="info" className="h-6 w-6 text-blue-500" color="#ff0000" />
                                </label>
                                <div className="mt-1">
                                    <textarea
                                        name="description"
                                        id="description"
                                        data-tooltip-id="my-tooltip-t" data-tooltip-content="Notes!"
                                        value={permissionDescription}
                                        onChange={(e) => {
                                            setPermissionDescription(e.target.value);
                                        }}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mt-0 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-7">
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex items-center justify-end gap-x-6">
                    <div className="relative">
                        <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none pr-4">
                            <ArrowCircleLeftIcon name="success" className="h-6 w-8 text-white" color="#FFFFFF" />
                        </div>
                        <button onClick={handleCancel} type="button" className="bg-blue-500 rounded hover:bg-blue-600 px-3 py-1.5 pl-12 text-sm font-semibold leading-6 text-white">
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
                            Save permission
                        </button>
                    </div>
                </div>
            </form>}
            {
                success && <div className="fixed inset-0 flex items-center justify-center z-50" style={{ pointerEvents: 'auto' }} >
                    <div className="bg-white rounded-lg shadow-lg p-8" >
                        <div className="flex h-6 items-center justify-center pt-2">
                            <CheckCircleIcon name="beakerIcon" className="h-9 w-9 text-white-500 mr-2" color="#3c763d" />
                            <div className="text-sm leading-6">
                                <label className="font-medium text-gray-900">
                                    Success in the update permission
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
                                        onClick={() => router.push('/permission/permission-table')}
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
                                        onClick={() => router.replace('/permission/permission')}
                                        className="rounded-md bg-blue-600 px-3 py-2 pl-12 text-sm font-semibold shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 text-white"
                                    >
                                        New permission
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>}
        </div>
    );
};

export default PermissionComponent;