
import { getConfigById, hasAccessToConfig } from '@/api/config';
import { getAll } from '@/api/user';
import { User } from '@/models/user.entity';
import logger from '@/config/logger-dev';
import { getSafeKeyObjectFromStorage } from '@/utils/safe-token-storage';
import { BellIcon } from '@heroicons/react/outline';
import React, { useEffect, useState } from 'react';
import Avatar from 'react-avatar';
import { twMerge } from 'tailwind-merge';
import UserListItem from './user-list-item';

const UserList: React.FC<any> = () => {
    const user_: User = JSON.parse(getSafeKeyObjectFromStorage('user')) ?? {};
    const [viewList, setViewList] = useState<boolean>(false);

    // #region CONFIG
    useEffect(() => {
        const fetchData = async () => {
            const configResponse = await getConfigById('665536e38c716c7e190822a2');
            if (!configResponse) {
                logger.warn('Config not found');
                return;
            }
            const hasAccess = await hasAccessToConfig(configResponse._id, user_.documentNumber);

            if (hasAccess) {
                // logger.info('The user does have permissionTemplate for access to API documentation');
                setViewList(true);
            }
        }
        fetchData();
    }, [user_]);
    //#endregion 

    const [data, setData] = useState<any[]>([]);

    useEffect((): any => {
        const fetchData = async () => {
            try {
                const { users, length } = await getAll(1, 50);
                setData(users);
            } catch (error) {
                setData([]);
            }
        }
        fetchData();
    }, []);

    return (
        <ul className="list-none h-10 p-1 max-w-64 rounded-md">
            {viewList && <h1 className='text-md font-bold border-b border-gray-300 pb-2'>Online users</h1>}
            {viewList && data.map((user: any) => (
                <UserListItem key={user._id} user={user} isCollapsed={false} />
            ))}
        </ul>
    );
};

export default UserList;