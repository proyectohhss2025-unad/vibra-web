import React, { useEffect, useState } from 'react';
import Avatar from 'react-avatar';
import { twMerge } from 'tailwind-merge';
import { getAvatarUrl } from '@/utils/avatar';

/** Ícono simple para identificar la plataforma */

const PlatformIcon: React.FC<{ platform: string }> = ({ platform }) => {
  if (platform === 'mobile') {
    return (
      <svg className="w-3 h-3 inline-block ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    );
  }
  return (
    <svg className="w-3 h-3 inline-block ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
};

const UserListItem: React.FC<{ key: any, user: any, isCollapsed: boolean }> = ({ user, isCollapsed }) => {
  const [user_, setUser_] = useState<any>(user);
  const [isCollapsed_, setIsCollapsed_] = useState<boolean>(isCollapsed);

  const avatarProps: any = {
    size: isCollapsed ? 32 : 37,
    round: true,
    src: getAvatarUrl(user_?.avatar),
  };

  // Los usuarios conectados por socket siempre están activos
  const c = twMerge(
    `flex rounded-md items-center py-1 shadow`,
    'bg-green-600 text-white'
  );

  useEffect(() => {
    setUser_(user);
    setIsCollapsed_(isCollapsed);
  }, [user, isCollapsed]);

  return (
    <li className={c}>
      <Avatar {...avatarProps} className='ml-1' />
      {!isCollapsed_ && <div className="mx-2 py-0 flex-1 min-w-0">
        <div className="ml-2 space-y-1">
          <p className="text-sm font-medium leading-none truncate flex items-center">
            {user_.name}
            {user_.platform && <PlatformIcon platform={user_.platform} />}
          </p>
          <p className="text-xs bg-green-700 rounded-md px-1 inline-block truncate max-w-full">
            {user_.role?.name || user_.platform || 'connected'}
          </p>
        </div>
      </div>}
    </li>
  );
};

export default UserListItem;
