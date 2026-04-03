import { AuthContext } from '@/services/auth';
import { getSafeKeyObjectFromStorage } from '@/utils/safe-token-storage';
import Image from 'next/image';
import { memo, useContext, useEffect, useState } from 'react';
import '../styles/author-photo.css';
import { FULL_NAME } from '../utils/constants';

const AuthorInfoComponent: React.FC<any> = ({ isCollapsed }) => {
  const user_: any = JSON.parse(getSafeKeyObjectFromStorage('user')) ?? {};
  const { token, otp, mainCompany } = useContext(AuthContext);
  const [user, setUser] = useState<any>(user_);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    setIsAuthenticated(!!token);
    setUser(user_);
  }, [token]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="author-photo-container mt-4 border-b border-gray-300 pb-4 mx-1">
      <Image
        src={`/avatars/${user?.avatar}`}
        alt={FULL_NAME}
        width={isCollapsed ? 180 : 400}
        height={isCollapsed ? 150 : 300}
        className={`img-fluid ${isCollapsed ? 'pl-1' : ''}`}
      />
      {!isCollapsed && <div className="author-info">
        <div className='flex text-gray-600 mt-1 text-sm justify-start font-semibold'>{user?.name}</div>
        <div className='flex mt-1 text-xs justify-start'>Usuario: {user?.username}</div>
        <div className='flex text-gray-600 border-t-1 mt-1 text-xs justify-start font-medium'>{user?.role?.name}</div>
        <div className='flex text-gray-600 border-t-1 mt-1 text-xs justify-start'>{/*user?.company?.name*/}...</div>
      </div>}
    </div>
  );
};

export default memo(AuthorInfoComponent);   
