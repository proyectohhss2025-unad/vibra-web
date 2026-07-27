import axios from 'axios';
import { authLogout } from '@/api/auth-login';
import { getMainCompany } from '@/api/company';
import { getConfigById, hasAccessToConfig } from '@/api/config';
import { getAllPermissionsByUser, getMyPermissions } from '@/api/permission';
import { getByUserId as getParticipantByUserId } from '@/api/participant';
import InfoApp from '@/components/info-app';
import Footer from '@/components/layouts/footer/footer';
import Sidebar from '@/components/layouts/sidebar/sidebar';
import { User } from '@/models/user.entity';
import { AuthContext, AuthContextValue, ParticipantContextData } from '@/services/auth';
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
  const [resolvedPermissions, setResolvedPermissions] = useState<any>(null);
  const [mainCompany, setMainCompany] = useState<any>();
  const [participant, setParticipant] = useState<ParticipantContextData | null>(null);
  const [apiIsOnline, setApiIsOnline] = useState<boolean>(true);
  const router = useRouter();

  // Inicializar header de autorización si hay token en localStorage
  if (token_) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token_}`;
  }

  // Inicializar fetch patch si hay token en localStorage
  if (token_ && typeof window !== 'undefined') {
    const origFetch = window.fetch.bind(window);
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : '';
      if (!url.includes('/api/auth/') && url.includes('/api/')) {
        const headers = new Headers(init?.headers);
        headers.set('Authorization', `Bearer ${token_}`);
        return origFetch(input, { ...init, headers });
      }
      return origFetch(input, init);
    };
  }

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

  // #endregion

  // #region RESOLVED PERMISSIONS (desde GET /api/auth/my-permissions)
  useEffect(() => {
    if (token) {
      // Limpiar permisos anteriores para evitar que el sidebar
      // muestre items del usuario previo mientras carga los nuevos.
      setResolvedPermissions(null);
      getMyPermissions()
        .then((data) => {
          if (data) setResolvedPermissions(data);
        })
        .catch((error) => {
          logger.error('Error fetching resolved permissions:', error);
        });
    }
  }, [token]);
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

  // #region PARTICIPANT DATA

  // Cargar participante desde localStorage al montar
  useEffect(() => {
    const stored = getSafeKeyObjectFromStorage('participant');
    if (stored) {
      try {
        setParticipant(JSON.parse(stored));
      } catch { /* ignorar */ }
    }
  }, []);

  // Cargar participante desde API cuando el usuario está disponible
  useEffect(() => {
    const fetchParticipant = async () => {
      const userId = user_?._id || (user as any)?._id;
      if (!userId) return;
      try {
        const data = await getParticipantByUserId(userId);
        if (data) {
          setParticipant(data as unknown as ParticipantContextData);
          localStorage.setItem('participant', JSON.stringify(data));
        }
      } catch (error) {
        logger.warn('No se pudo cargar el participante:', error);
      }
    };
    if (user_?._id || (user as any)?._id) {
      fetchParticipant();
    }
  }, [user_?._id, (user as any)?._id]);

  //#endregion

  const patchFetchWithToken = (token: string) => {
    if (typeof window !== 'undefined') {
      const originalFetch = window.fetch.bind(window);
      window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === 'string' ? input : input instanceof URL ? input.href : '';
        const isPublicRoute =
          url.includes('/api/auth/login') ||
          url.includes('/api/auth/register') ||
          url.includes('/api/auth/health');
        if (!isPublicRoute && url.includes('/api/')) {
          const headers = new Headers(init?.headers);
          headers.set('Authorization', `Bearer ${token}`);
          return originalFetch(input, { ...init, headers });
        }
        return originalFetch(input, init);
      };
    }
  };

  const handleLogin = (newToken: string, newOtp: string) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
    setOtp(newOtp);
    localStorage.setItem('otp', newOtp);
    // Configurar axios para enviar token en todas las peticiones
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    // Parchear fetch global para incluir token
    patchFetchWithToken(newToken);
  };

  const handleLogout = async () => {
    const response: any = await authLogout(user_?.sub ?? '');
    // Limpiar header de autorización
    delete axios.defaults.headers.common['Authorization'];
    if (response?.logout) {
      localStorage.removeItem('token');
      localStorage.removeItem('otp');
      localStorage.removeItem('user');
      localStorage.removeItem('participant');
      localStorage.removeItem('selectedItem');
      localStorage.removeItem('expandedItem');

      console.log('Saliendo de la sesión');
      router.push('/');
      setToken(null);
      setOtp(null);
      setParticipant(null);
      setResolvedPermissions(null);
    }
  };

  // Use useMemo to memoize the value object
  const value: AuthContextValue = useMemo(
    () => ({ token, setToken, otp, setOtp, handleLogin, handleLogout, user, setUser, user_, permissions, resolvedPermissions, mainCompany, setMainCompany, participant, setParticipant }),
    [token, setToken, otp, setOtp, handleLogin, handleLogout, user, setUser, user_, permissions, resolvedPermissions, mainCompany, setMainCompany, participant, setParticipant]
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
