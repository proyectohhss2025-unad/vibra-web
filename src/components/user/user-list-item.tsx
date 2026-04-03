import React, { useEffect, useState } from 'react';
import Avatar from 'react-avatar';
import { twMerge } from 'tailwind-merge';

const UserListItem: React.FC<{ key: any, user: any, isCollapsed: boolean }> = ({ user, isCollapsed }) => {
  const [user_, setUser_] = useState<any>(user);
  const [isCollapsed_, setIsCollapsed_] = useState<boolean>(isCollapsed);

  const avatarProps: any = {
    size: isCollapsed ? 32 : 37,
    round: true,
    src: `/avatars/${user_?.avatar}`, // Default avatar if none provided
  };

  const c = twMerge(`flex rounded-md items-center py-1 shadow`, user_?.isLogged ? 'bg-green-600 text-white' : 'bg-white text-gray-600');

  useEffect(() => {
    setUser_(user);
    setIsCollapsed_(isCollapsed);
  }, [user, isCollapsed]);

  return (
    <li className={c}>
      <Avatar {...avatarProps} className='ml-1' />
      {!isCollapsed_ && <div className="mx-2 py-0">
        <div className="ml-2 space-y-1">
          <p className="text-sm font-medium leading-none">{user_.name}</p>
          <p className="text-xs text-muted-foreground bg-white rounded-md px-1">
            {user_.role?.name}
          </p>
        </div>
      </div>}
    </li>
  );
};

export default UserListItem;
