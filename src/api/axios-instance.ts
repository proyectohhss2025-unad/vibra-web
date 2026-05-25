import { config } from '@/config/config';
import { getSafeKeyFromStorage } from '@/utils/safe-token-storage';
import axios from 'axios';

const environment = process.env.NODE_ENV || 'development';

const api = axios.create({
  baseURL: config[environment].apiDashboard,
});

// Interceptor: agrega el token JWT a todas las peticiones
api.interceptors.request.use(
  (axiosConfig) => {
    const token = getSafeKeyFromStorage('token');
    if (token) {
      axiosConfig.headers.Authorization = `Bearer ${token}`;
    }
    return axiosConfig;
  },
  (error) => Promise.reject(error),
);

// Interceptor: redirige al login si hay 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      // Solo redirigir si no estamos ya en el login
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  },
);

export default api;
