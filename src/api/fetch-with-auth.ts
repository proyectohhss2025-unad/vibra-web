import { getSafeKeyFromStorage } from '@/utils/safe-token-storage';

/**
 * Wrapper de fetch que agrega automáticamente el token JWT
 * en el header Authorization si existe en localStorage.
 *
 * Uso: reemplazar `fetch(url, options)` por `fetchWithAuth(url, options)`
 */
export const fetchWithAuth = async (
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> => {
  const token = getSafeKeyFromStorage('token');

  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string>),
  };

  // Solo agregar token si no es una ruta pública
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  const isPublicRoute =
    url.includes('/api/auth/login') ||
    url.includes('/api/auth/register') ||
    url.includes('/api/auth/health');

  if (token && !isPublicRoute) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(input, {
    ...init,
    headers,
  });
};
