import { config } from '@/config/config';
import axios from 'axios';
import logger from '../config/logger-dev';

const environment = process.env.NODE_ENV || 'development';

const configAPI = {
  baseURL: config[environment].apiDashboard,
};

/**
 * Solicita un enlace de restablecimiento de contraseña.
 * @param email Correo electrónico del usuario
 */
export const forgotPassword = async (email: string) => {
  try {
    const response = await axios.post(
      `${configAPI.baseURL}/api/password-reset/forgot-password`,
      { email },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data;
  } catch (error) {
    logger.error('forgotPassword error:', error);
    throw error;
  }
};

/**
 * Valida si un token de restablecimiento sigue vigente.
 * @param token Token JWT recibido por correo
 */
export const validateResetToken = async (token: string) => {
  try {
    const response = await axios.get(
      `${configAPI.baseURL}/api/password-reset/validate-token`,
      {
        params: { token },
      },
    );
    return response.data;
  } catch (error) {
    logger.error('validateResetToken error:', error);
    throw error;
  }
};

/**
 * Restablece la contraseña usando un token válido.
 * @param token Token JWT de restablecimiento
 * @param newPassword Nueva contraseña
 */
export const resetPassword = async (
  token: string,
  newPassword: string,
) => {
  try {
    const response = await axios.post(
      `${configAPI.baseURL}/api/password-reset/reset-password`,
      { token, newPassword },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data;
  } catch (error) {
    logger.error('resetPassword error:', error);
    throw error;
  }
};
