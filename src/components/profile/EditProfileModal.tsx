"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/registry/new-york/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/new-york/ui/tabs";
import { Input } from "@/registry/new-york/ui/input";
import { Button } from "@/registry/new-york/ui/button";
import { Label } from "@/registry/new-york/ui/label";
import { Pencil1Icon } from "@radix-ui/react-icons";
import { SaveIcon, ShieldIcon } from "lucide-react";
import api from "@/api/axios-instance";
import logger from "@/config/logger-dev";
import usePasswordStrength from "@/hooks/usePasswordStrength";
import Select from "@/components/forms/select";
import { getSafeKeyFromStorage, getSafeKeyObjectFromStorage } from "@/utils/safe-token-storage";

function PasswordStrengthIndicator({ password }: { password: string }) {
  const strength = usePasswordStrength(password ?? '');
  if (!password) return null;
  return (
    <div className="mt-1.5">
      <div className="h-1 w-full rounded-full bg-gray-200 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${strength.barPercent}%`, backgroundColor: strength.color }} />
      </div>
      {strength.label && <p className="text-xs font-semibold mt-0.5" style={{ color: strength.color }}>{strength.label}</p>}
    </div>
  );
}

interface EditProfileModalProps {
  user: Record<string, any>;
  onUpdate?: () => void;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

function updateLocalUser(updates: Record<string, any>) {
  try {
    const current = getSafeKeyObjectFromStorage('user') || {};
    localStorage.setItem('user', JSON.stringify({ ...current, ...updates }));
  } catch { }
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ user: initialUser, onUpdate }) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("datos");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [docTypes, setDocTypes] = useState<{ _id: string; name: string; description: string }[]>([]);

  const [form, setForm] = useState({
    name: "", email: "", username: "", documentType: "", documentNumber: "",
    phoneNumber: "", address: "", gender: "", birthDate: "",
  });

  const userId = initialUser?._id || initialUser?.sub || initialUser?.userId || '';

  useEffect(() => {
    if (!open) return;
    setError("");
    setSuccess("");

    const stored = getSafeKeyObjectFromStorage('user') || {};
    const resolveDocType = (dt: any) => dt?._id || dt?.toString() || dt || '';
    setForm({
      name: stored.name ?? initialUser.name ?? "",
      email: stored.email ?? initialUser.email ?? "",
      username: stored.username ?? initialUser.username ?? "",
      documentType: resolveDocType(stored.documentType) || resolveDocType(initialUser.documentType) || "",
      documentNumber: stored.documentNumber ?? initialUser.documentNumber ?? "",
      phoneNumber: stored.phoneNumber ?? initialUser.phoneNumber ?? "",
      address: stored.address ?? initialUser.address ?? "",
      gender: stored.gender ?? initialUser.gender ?? "",
      birthDate: stored.birthDate ?? initialUser.birthDate ?? "",
    });

    api.get('/api/document-types/all').then((res) => {
      setDocTypes(Array.isArray(res.data) ? res.data : []);
    }).catch(() => setDocTypes([]));

    if (userId) {
      api.get(`/api/users/id/${userId}`).then((res) => {
        if (res.data) {
          const u = res.data;
          const docType = u.documentType?._id || u.documentType?.toString() || u.documentType || '';
          setForm((prev) => ({
            ...prev,
            name: u.name ?? prev.name,
            email: u.email ?? prev.email,
            username: u.username ?? prev.username,
            documentType: docType,
            documentNumber: u.documentNumber ?? prev.documentNumber,
            phoneNumber: u.phoneNumber ?? prev.phoneNumber,
            address: u.address ?? prev.address,
            gender: u.gender ?? prev.gender,
            birthDate: u.birthDate ? u.birthDate.split('T')[0] : prev.birthDate,
          }));
        }
      }).catch(() => { });
    }
  }, [open, userId]);

  const passwordForm = useForm<PasswordFormData>({
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const handleOpenChange = useCallback((isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) { setError(""); setSuccess(""); passwordForm.reset(); }
  }, [passwordForm]);

  const handleTabChange = (value: string) => {
    setActiveTab(value); setError(""); setSuccess("");
  };

  const handlePasswordSubmit = async (data: PasswordFormData) => {
    setError(""); setSuccess("");
    if (data.newPassword !== data.confirmPassword) { setError("Las contraseñas no coinciden"); return; }
    if (data.newPassword.length < 8) { setError("La nueva contraseña debe tener al menos 8 caracteres"); return; }
    setLoading(true);
    try {
      await api.post("/api/auth/change-password", { currentPassword: data.currentPassword, newPassword: data.newPassword });
      setSuccess("Contraseña actualizada correctamente");
      passwordForm.reset();
      setTimeout(() => handleOpenChange(false), 1500);
    } catch (err: any) {
      logger.error("Error al cambiar contraseña:", err);
      setError(err?.response?.data?.message?.[0] || err?.response?.data?.message || "Error al cambiar la contraseña");
    } finally { setLoading(false); }
  };

  const handlePersonalSubmit = async () => {
    setError(""); setSuccess("");
    if (!userId) { setError("ID de usuario no encontrado"); return; }
    setLoading(true);
    try {
      const payload: Record<string, any> = { _id: userId, ...form };
      if (!payload.birthDate) delete payload.birthDate;
      await api.post("/api/users", payload);
      updateLocalUser(form);
      setSuccess("Datos actualizados correctamente");
      onUpdate?.();
      setTimeout(() => handleOpenChange(false), 1500);
    } catch (err: any) {
      logger.error("Error al actualizar datos:", err);
      setError(err?.response?.data?.message?.[0] || err?.response?.data?.message || "Error al actualizar los datos");
    } finally { setLoading(false); }
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Pencil1Icon className="h-4 w-4" /> Editar Perfil
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Editar Perfil</DialogTitle></DialogHeader>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-lg bg-gray-200 p-1">
            <TabsTrigger value="datos"
              className={`rounded-md px-4 py-2 text-sm font-semibold transition-all ${activeTab === "datos" ? "bg-white text-gray-900 shadow-sm" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"}`}>
              Datos Personales
            </TabsTrigger>
            <TabsTrigger value="seguridad"
              className={`rounded-md px-4 py-2 text-sm font-semibold transition-all ${activeTab === "seguridad" ? "bg-white text-gray-900 shadow-sm" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"}`}>
              Seguridad
            </TabsTrigger>
          </TabsList>

          <TabsContent value="datos" className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">Actualiza tu información personal.</p>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input autoComplete="off" id="name" value={form.name} onChange={(e) => updateField("name", e.target.value)} placeholder="Tu nombre" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input autoComplete="off" id="email" type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} placeholder="correo@ejemplo.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Nombre de usuario</Label>
                <Input autoComplete="off" id="username" value={form.username} onChange={(e) => updateField("username", e.target.value)} placeholder="usuario" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="documentType">Tipo de documento</Label>
                  <Select id="documentType" label="" options={docTypes} selectedValue={form.documentType} onChange={(e: any) => updateField("documentType", e.target.value)} withLabel={false} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="documentNumber">Número de documento</Label>
                  <Input autoComplete="off" id="documentNumber" value={form.documentNumber} onChange={(e) => updateField("documentNumber", e.target.value)} placeholder="123456789" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Teléfono</Label>
                <Input autoComplete="off" id="phoneNumber" value={form.phoneNumber} onChange={(e) => updateField("phoneNumber", e.target.value)} placeholder="3001234567" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input autoComplete="off" id="address" value={form.address} onChange={(e) => updateField("address", e.target.value)} placeholder="Calle 1 # 2-3" />
              </div>
            </div>
            {success && activeTab === "datos" && <p className="text-sm text-green-600 font-medium">{success}</p>}
            {error && activeTab === "datos" && <p className="text-sm text-red-600 font-medium">{error}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>Cancelar</Button>
              <Button onClick={handlePersonalSubmit} disabled={loading}><SaveIcon className="w-4 h-4" /> {loading ? "Guardando..." : "Guardar Cambios"}</Button>
            </div>
          </TabsContent>

          <TabsContent value="seguridad" className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">Cambia tu contraseña. La nueva debe tener al menos 8 caracteres.</p>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Contraseña actual</Label>
                <Input autoComplete="off" id="currentPassword" type="password" placeholder="••••••••" {...passwordForm.register("currentPassword", { required: "Este campo es requerido" })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nueva contraseña</Label>
                <Input autoComplete="off" id="newPassword" type="password" placeholder="Mínimo 8 caracteres" {...passwordForm.register("newPassword", { required: "Este campo es requerido", minLength: { value: 8, message: "La contraseña debe tener al menos 8 caracteres" } })} />
                <PasswordStrengthIndicator password={passwordForm.watch("newPassword")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
                <Input autoComplete="off" id="confirmPassword" type="password" placeholder="Repite la nueva contraseña" {...passwordForm.register("confirmPassword", { required: "Este campo es requerido" })} />
              </div>
            </div>
            {success && activeTab === "seguridad" && <p className="text-sm text-green-600 font-medium">{success}</p>}
            {error && activeTab === "seguridad" && <p className="text-sm text-red-600 font-medium">{error}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>Cancelar</Button>
              <Button onClick={passwordForm.handleSubmit(handlePasswordSubmit)} disabled={loading}><ShieldIcon className="w-4 h-4" /> {loading ? "Guardando..." : "Cambiar Contraseña"}</Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};