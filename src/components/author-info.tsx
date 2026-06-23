import { AuthContext } from '@/services/auth';
import Image from 'next/image';
import { memo, useContext } from 'react';
import '../styles/author-photo.css';
import { FULL_NAME } from '../utils/constants';
import { getAvatarUrl } from '@/utils/avatar';

const AuthorInfoComponent: React.FC<any> = ({ isCollapsed, onAvatarClick }) => {
  const { user, token, mainCompany } = useContext(AuthContext);

  if (!token || !user) {
    return null;
  }

  return (
    <div className="author-photo-container mt-2 mb-2 border-b border-gray-200 pb-3 mx-2">
      <button
        type="button"
        onClick={onAvatarClick}
        className="flex-shrink-0 focus:outline-none"
        title="Ver mi perfil"
      >
        <Image
          src={getAvatarUrl(user?.avatar)}
          alt={FULL_NAME}
          width={48}
          height={48}
          className="cursor-pointer"
        />
      </button>
      {!isCollapsed && <div className="author-info">
        <div className='text-gray-800 text-sm font-semibold truncate'>{user?.name}</div>
        <div className='text-gray-500 text-xs truncate'>@{user?.username}</div>
        <div className='text-gray-600 text-xs font-medium truncate'>{user?.role?.name}</div>
        <div className='text-gray-400 text-[10px] truncate'>{mainCompany?.name || user?.company?.name || ''}</div>
      </div>}
    </div>
  );
};

export default memo(AuthorInfoComponent);
