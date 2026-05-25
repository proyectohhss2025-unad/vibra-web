'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { resetPassword } from '@/api/password-reset';
import { EyeIcon, EyeOffIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';

interface ResetPasswordFormProps {
  token: string;
  email: string;
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (newPassword.length < 8) {
      errors.newPassword = 'Mínimo 8 caracteres';
    } else if (!/[A-Z]/.test(newPassword)) {
      errors.newPassword = 'Debe contener al menos una mayúscula';
    } else if (!/[0-9]/.test(newPassword)) {
      errors.newPassword = 'Debe contener al menos un número';
    }

    if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validate()) return;

    setIsLoading(true);

    try {
      const result = await resetPassword(token, newPassword);
      setSuccess(result.message || 'Contraseña actualizada exitosamente');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        'Error al restablecer la contraseña. Token inválido o expirado.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6">
          <CheckCircleIcon className="h-10 w-10 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          ¡Contraseña actualizada!
        </h3>
        <p className="text-gray-600 mb-6">{success}</p>
        <Link
          href="/layout"
          className="inline-flex items-center px-6 py-3 bg-vibra-blue text-white font-medium rounded-lg hover:bg-vibra-blue-dark transition-colors"
        >
          Iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <XCircleIcon className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Nueva contraseña */}
      <div>
        <label
          htmlFor="newPassword"
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          Nueva contraseña
        </label>
        <div className="relative">
          <input
            id="newPassword"
            type={showPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (fieldErrors.newPassword) {
                setFieldErrors((prev) => ({ ...prev, newPassword: '' }));
              }
            }}
            placeholder="Mín. 8 caracteres, 1 mayúscula, 1 número"
            className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-vibra-blue focus:border-transparent transition-colors ${
              fieldErrors.newPassword
                ? 'border-red-400 bg-red-50'
                : 'border-gray-300 bg-white'
            }`}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOffIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        </div>
        {fieldErrors.newPassword && (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.newPassword}</p>
        )}
      </div>

      {/* Confirmar contraseña */}
      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          Confirmar contraseña
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            type={showConfirm ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (fieldErrors.confirmPassword) {
                setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }));
              }
            }}
            placeholder="Repite la nueva contraseña"
            className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-vibra-blue focus:border-transparent transition-colors ${
              fieldErrors.confirmPassword
                ? 'border-red-400 bg-red-50'
                : 'border-gray-300 bg-white'
            }`}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            tabIndex={-1}
          >
            {showConfirm ? (
              <EyeOffIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        </div>
        {fieldErrors.confirmPassword && (
          <p className="mt-1 text-xs text-red-600">
            {fieldErrors.confirmPassword}
          </p>
        )}
      </div>

      {/* Requisitos visuales */}
      <div className="space-y-1.5 text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
        <p className="font-medium text-gray-700 mb-1">Requisitos:</p>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              newPassword.length >= 8 ? 'bg-green-500' : 'bg-gray-300'
            }`}
          />
          <span>Mínimo 8 caracteres</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              /[A-Z]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'
            }`}
          />
          <span>Al menos una mayúscula</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              /[0-9]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'
            }`}
          />
          <span>Al menos un número</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              newPassword === confirmPassword && confirmPassword.length > 0
                ? 'bg-green-500'
                : 'bg-gray-300'
            }`}
          />
          <span>Las contraseñas coinciden</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 px-6 bg-gradient-to-r from-vibra-blue to-vibra-coral text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Restableciendo...
          </span>
        ) : (
          'Restablecer contraseña'
        )}
      </button>
    </form>
  );
}
