import React from 'react';
import Avatar from 'react-avatar';
import { twMerge } from 'tailwind-merge';

const ParticipantListItem: React.FC<any> = ({ user }) => {
  const avatarProps: any = {
    size: 40,
    round: true,
    src: user.avatarUrl || 'https://i.pravatar.com/150', // Default avatar if none provided
  };

  const c = twMerge('flex items-center py-2', user.id % 2 === 0 ? 'bg-gray-100' : 'bg-white');

  return (
    <div className={c}>
      <Avatar {...avatarProps} />
      <div className="ml-2">
        <p className="text-sm font-medium">{user.name}</p>
        {user.avatarUrl && <p className="text-xs text-gray-500">{`User Avatar: ${user.avatarUrl}`}</p>}
      </div>
    </div>
  );
};

const ParticipantList: React.FC<any> = ({ users }) => {
  return (
    <ul className="list-none p-0">
      {users.map((user: any) => (
        <ParticipantListItem key={user._id} user={user} />
      ))}
    </ul>
  );
};

export default ParticipantList;