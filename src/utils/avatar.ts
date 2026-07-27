/**
 * Utilidades para resolución de URLs de avatar.
 *
 * Unifica la lógica para determinar si un avatar es:
 * - Preset: se sirve desde /avatars/{filename}
 * - Upload (GridFS): se sirve desde /api/users/avatar/stream/{fileId}
 */

const API_BASE = process.env.NODE_ENV === 'production'
  ? 'https://vibraunad.com.co'
  : 'http://localhost:4000';

/**
 * Resuelve la URL completa de un avatar a partir de su valor almacenado.
 * @param avatar - El valor de user.avatar (filename o fileId de 24 hex)
 * @returns URL completa del avatar
 */
export function getAvatarUrl(avatar: string | undefined | null): string {
  if (!avatar) return `${API_BASE}/avatars/default-avatar.svg`;
  const isFileId = /^[a-f0-9]{24}$/i.test(avatar);
  if (isFileId) {
    return `${API_BASE}/api/users/avatar/stream/${avatar}`;
  }
  // Normalizar extensión: la BD guarda "06.png" pero los archivos son "06.jpg"
  const normalized = avatar.replace(/\.png$/i, '.jpg');
  return `${API_BASE}/avatars/${normalized}`;
}
