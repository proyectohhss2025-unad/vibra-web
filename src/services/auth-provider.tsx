import { authLogout } from '@/api/auth-login';
import { getMainCompany } from '@/api/company';
import { getConfigById, hasAccessToConfig } from '@/api/config';
import { getAllPermissionsByUser } from '@/api/permission';
import InfoApp from '@/components/info-app';
import Footer from '@/components/layouts/footer/footer';
import Sidebar from '@/components/layouts/sidebar/sidebar';
import { User } from '@/models/user.entity';
import { AuthContext, AuthContextValue } from '@/services/auth';
import { getSafeKeyFromStorage, getSafeKeyObjectFromStorage } from '@/utils/safe-token-storage';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';
import { Tooltip } from 'react-tooltip';
import logger from '../config/logger-dev';

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token_ = getSafeKeyFromStorage('token');
  const otp_ = getSafeKeyFromStorage('otp');
  const user_: User = JSON.parse(getSafeKeyObjectFromStorage('user')) ?? {};

  const [token, setToken] = useState<string | null>(token_ ?? null);
  const [otp, setOtp] = useState<string | null>(otp_ ?? null);
  const [user, setUser] = useState<any | null>(user_);
  const [permissions, setPermissions] = useState<any>();
  const [mainCompany, setMainCompany] = useState<any>();
  const [apiIsOnline, setApiIsOnline] = useState<boolean>(true);
  const router = useRouter();

  // #region COMPANY DATA 

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user_._id) {
          const mainCompany = await getMainCompany();
          if (mainCompany) {
            setMainCompany(mainCompany.company);
            setApiIsOnline(true);
          } else {
            setApiIsOnline(false);
          }
          // logger.info('mainCompany: ', mainCompany.company)
        }
      } catch (error) {
        setApiIsOnline(false);
        logger.error('Error: ', error)
        return (
          <>Api is outline</>
        )
      }
    };
    fetchData();
  }, []);

  //#endregion

  // #region CONFIG FF 

  useEffect(() => {
    const fetchData = async () => {
      const configResponse = await getConfigById('6663674b5d58c8a6a2bc67ce');
      if (!configResponse) {
        logger.warn('Config not found');
        return;
      }
      const hasAccess = await hasAccessToConfig(configResponse._id, user_.documentNumber);
      if (hasAccess) {
        logger.info('The user does have permission for access to API documentation');
        localStorage.setItem('hiddenAPIDocumentation', "true");
      } else {
        localStorage.setItem('hiddenAPIDocumentation', "false");
      }
    }
    fetchData();
  }, [user_]);

  //#endregion 

  // #region USER PERMISSIONS 
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user_._id) {
          const permissions_ = await getAllPermissionsByUser(user_._id, 1, 100);
          if (permissions_) {
            setPermissions(permissions_);
          }
          // logger.info('permissions_: ', permissions_)
        }
      } catch (error) {
        logger.error('error: ', error)
      }
    };
    if (!permissions) {
      fetchData();
    }
  }, [user_, permissions]);
  //#endregion

  const handleLogin = (newToken: string, newOtp: string) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
    setOtp(otp);
    localStorage.setItem('otp', newOtp);
  };

  const handleLogout = async () => {
    const response: any = await authLogout(user_?.sub ?? '');
    if (response?.logout) {
      localStorage.removeItem('token');
      localStorage.removeItem('otp');
      localStorage.removeItem('user');
      localStorage.removeItem('selectedItem');
      localStorage.removeItem('expandedItem');

      console.log('Saliendo de la sesión');
      router.push('/');
      setToken(null);
      setOtp(null);
    }
  };

  // Use useMemo to memoize the value object
  const value: AuthContextValue = useMemo(
    () => ({ token, setToken, otp, setOtp, handleLogin, handleLogout, user, setUser, user_, permissions, mainCompany, setMainCompany }),
    [token, setToken, otp, setOtp, handleLogin, handleLogout, user, setUser, user_, permissions, mainCompany, setMainCompany]
  );

  if (!apiIsOnline) {
    return (
      <>
        <InfoApp></InfoApp>
        <div className='font-bold text-2xl text-center mt-40'>El API no se encuentra en línea.</div>
        <div className='font-semibold text-md text-center mt-4'>Por favor contacte un administrador del sistema para reactivar el API!</div>
      </>
    )
  }

  return (
    <>
      {apiIsOnline && <AuthContext.Provider value={value} >
        <Sidebar />
        {children}
        <Tooltip id="my-tooltip-p" place={'top-end'} variant='error' />
        <Tooltip id="my-tooltip-pe" place={'top-start'} variant='error' />
        <Tooltip id="my-tooltip-t" place={'bottom-end'} />
        <Tooltip id="my-tooltip-l" place={'left-start'} variant='info' />
        <Tooltip id="my-tooltip-r" place={'left-end'} />
        <Footer />
      </AuthContext.Provider>}
    </>
  );
};

export default AuthProvider;
