"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/registry/new-york/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/registry/new-york/ui/tabs';
import { Button } from '@/registry/new-york/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/registry/new-york/ui/avatar';
import { CameraIcon, TrashIcon, UploadIcon, CheckCircledIcon } from '@radix-ui/react-icons';
import api from '@/api/axios-instance';
import logger from '@/config/logger-dev';
import { AvatarGalleryItem } from '@/models/user.entity';
import { getAvatarUrl as getAvatarUrlUtil } from '@/utils/avatar';

// ─── Helpers ──────────────────────────────────────────────────────────────

/**
 * Resuelve la URL de un item de la galería (con type conocido).
 */
function getGalleryItemUrl(item: AvatarGalleryItem): string {
  if (item.type === 'upload') {
    return `${getAvatarUrlUtil(item.src)}`;
  }
  return getAvatarUrlUtil(item.src);
}

// ─── Props ─────────────────────────────────────────────────────────────────

interface AvatarGalleryModalProps {
  /** Usuario actual (debe tener _id o sub) */
  user: Record<string, any>;
  /** Callback cuando se cambia el avatar activo */
  onAvatarChange?: (newAvatar: string) => void;
  /** Control externo del open (opcional) */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Trigger como prop explícito */
  trigger?: React.ReactNode;
  /** Trigger como children (alternativa a `trigger`) */
  children?: React.ReactNode;
}

// ─── Componente Principal ──────────────────────────────────────────────────

export const AvatarGalleryModal: React.FC<AvatarGalleryModalProps> = ({
  user,
  onAvatarChange,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
  trigger,
  children,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen ?? internalOpen;
  const setOpen = externalOnOpenChange ?? setInternalOpen;

  const [gallery, setGallery] = useState<AvatarGalleryItem[]>([]);
  const [activeAvatar, setActiveAvatar] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('presets');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const userId = user?._id || user?.sub || user?.userId || '';

  // ─── Cargar galería ───
  const loadGallery = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/users/avatar/gallery');
      setGallery(res.data?.gallery ?? []);
      setActiveAvatar(res.data?.activeAvatar ?? '');
    } catch (err: any) {
      logger.error('Error loading avatar gallery:', err);
      setError('No se pudo cargar la galería de avatares');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (open) loadGallery();
  }, [open, loadGallery]);

  // ─── Seleccionar avatar activo ───
  const handleSelect = async (item: AvatarGalleryItem) => {
    setError('');
    try {
      const res = await api.post('/api/users/avatar/select', { galleryId: item.id });
      setActiveAvatar(res.data?.avatar ?? item.src);
      onAvatarChange?.(res.data?.avatar ?? item.src);
    } catch (err: any) {
      logger.error('Error selecting avatar:', err);
      setError('No se pudo seleccionar el avatar');
    }
  };

  // ─── Subir imagen ───
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    setUploadSuccess(false);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/api/users/avatar/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Recargar galería para mostrar el nuevo item
      await loadGallery();
      if (res.data?.avatar) {
        setActiveAvatar(res.data.avatar);
        onAvatarChange?.(res.data.avatar);
      }
      // Feedback visual: cambiar a "Mis subidas" y mostrar éxito
      setUploadSuccess(true);
      setActiveTab('uploads');
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err: any) {
      logger.error('Error uploading avatar:', err);
      setError(err?.response?.data?.message?.[0] || err?.response?.data?.message || 'Error al subir la imagen');
    } finally {
      setUploading(false);
      // Resetear el input file para poder seleccionar el mismo archivo de nuevo
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ─── Eliminar item (solo uploads) ───
  const handleDelete = async (item: AvatarGalleryItem) => {
    if (item.type !== 'upload') return;
    setError('');
    try {
      await api.delete(`/api/users/avatar/${item.id}`);
      await loadGallery();
    } catch (err: any) {
      logger.error('Error deleting avatar:', err);
      setError('No se pudo eliminar la imagen');
    }
  };

  // ─── Presets disponibles ───
  const presets = gallery.filter((i) => i.type === 'preset');
  const uploads = gallery.filter((i) => i.type === 'upload');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {(trigger || children) && <DialogTrigger asChild>{trigger || children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Administrar mis avatares</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-lg bg-gray-200 p-1">
            <TabsTrigger value="presets"
              className="rounded-md px-4 py-2 text-sm font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-700 hover:bg-gray-100">
              Prediseñados
            </TabsTrigger>
            <TabsTrigger value="uploads"
              className="rounded-md px-4 py-2 text-sm font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-700 hover:bg-gray-100">
              Mis subidas
            </TabsTrigger>
          </TabsList>

          {uploadSuccess && (
            <div className="flex items-center gap-2 mt-3 mb-1 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
              <CheckCircledIcon className="h-4 w-4 text-green-600 shrink-0" />
              <span>Imagen subida correctamente</span>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 font-medium mt-2 mb-0">{error}</p>
          )}

          {/* ─── TAB: PREDISEÑADOS ───────────────────────────────────── */}
          <TabsContent value="presets" className="py-4">
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-8">Cargando...</p>
            ) : presets.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No hay avatares prediseñados disponibles</p>
            ) : (
              <div className="grid grid-cols-5 gap-3">
                {presets.map((item) => {
                  const isActive = item.src === activeAvatar;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className={`relative flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all hover:border-blue-400 cursor-pointer ${
                        isActive ? 'border-amber-400 bg-amber-50' : 'border-gray-200'
                      }`}
                      title={isActive ? 'Avatar activo' : 'Seleccionar'}
                    >
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={getGalleryItemUrl(item)} alt={item.src} />
                        <AvatarFallback>A</AvatarFallback>
                      </Avatar>
                      {isActive && (
                        <span className="absolute -top-1 -right-1 bg-amber-400 rounded-full p-0.5">
                          <CheckCircledIcon className="h-4 w-4 text-white" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ─── TAB: MIS SUBIDAS ────────────────────────────────────── */}
          <TabsContent value="uploads" className="py-4">
            {/* Botón de subir */}
            <div className="mb-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={handleUpload}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="gap-2"
              >
                <UploadIcon className="h-4 w-4" />
                {uploading ? 'Subiendo...' : 'Subir nueva imagen'}
              </Button>
              <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, GIF, WebP — Máx 5MB</p>
            </div>

            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-8">Cargando...</p>
            ) : uploads.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                <CameraIcon className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-muted-foreground">Aún no has subido imágenes</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3">
                {uploads.map((item) => {
                  const isActive = item.src === activeAvatar;
                  return (
                    <div key={item.id} className="relative group">
                      <button
                        onClick={() => handleSelect(item)}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all hover:border-blue-400 cursor-pointer w-full ${
                          isActive ? 'border-amber-400 bg-amber-50' : 'border-gray-200'
                        }`}
                        title={isActive ? 'Avatar activo' : 'Seleccionar'}
                      >
                        <Avatar className="h-14 w-14">
                          <AvatarImage src={getGalleryItemUrl(item)} alt={item.label || 'Avatar'} />
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        {isActive && (
                          <span className="absolute top-1 right-1 bg-amber-400 rounded-full p-0.5">
                            <CheckCircledIcon className="h-4 w-4 text-white" />
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="absolute -bottom-1 -right-1 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        title="Eliminar"
                      >
                        <TrashIcon className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Cerrar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AvatarGalleryModal;
