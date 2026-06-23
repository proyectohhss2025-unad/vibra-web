'use client';

import { useEffect, useState } from 'react';
import { validateResetToken } from '@/api/password-reset';
import ResetPasswordForm from '@/components/reset-password/ResetPasswordForm';
import { AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

function ResetPasswordContent() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get('token'));
  }, []);

  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid'>('loading');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      return;
    }

    const checkToken = async () => {
      try {
        const result = await validateResetToken(token);
        if (result.valid) {
          setEmail(result.email || '');
          setStatus('valid');
        } else {
          setStatus('invalid');
        }
      } catch {
        setStatus('invalid');
      }
    };

    checkToken();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-vibra-blue" />
            <span className="text-2xl font-bold bg-gradient-to-r from-vibra-blue to-vibra-coral bg-clip-text text-transparent">
              Vibra
            </span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {status === 'loading' && (
            <div className="text-center py-12">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 mb-4">
                <RefreshCw className="h-7 w-7 text-vibra-blue animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Verificando enlace...
              </h3>
              <p className="text-sm text-gray-500">
                Por favor espera mientras validamos tu enlace de recuperación.
              </p>
            </div>
          )}

          {status === 'valid' && (
            <>
              <div className="text-center mb-6">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 mb-4">
                  <ShieldCheck className="h-7 w-7 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Crear nueva contraseña
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Ingresa tu nueva contraseña para {email}
                </p>
              </div>
              <ResetPasswordForm token={token!} email={email} />
            </>
          )}

          {status === 'invalid' && (
            <div className="text-center py-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-6">
                <AlertCircle className="h-10 w-10 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Enlace inválido o expirado
              </h3>
              <p className="text-gray-600 mb-6">
                Este enlace de recuperación ya no es válido. Puedes solicitar uno
                nuevo desde la página de inicio de sesión.
              </p>
              <Link
                href="/"
                className="inline-flex items-center px-6 py-3 bg-vibra-blue text-white font-medium rounded-lg hover:bg-vibra-blue-dark transition-colors"
              >
                Ir al inicio
              </Link>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Vibra — Proyecto de educación emocional
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return <ResetPasswordContent />;
}
