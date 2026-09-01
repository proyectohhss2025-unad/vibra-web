'use client';

import React from 'react';
import { CheckCircleIcon, XCircleIcon } from 'lucide-react';
import { PASSWORD_POLICY_REGEX } from '@/schemas/user.schema';

interface PasswordRequirementListProps {
  /** Valor actual de la contraseña para evaluar los requisitos en vivo */
  password: string;
  /** Si se muestra solo cuando hay texto (por defecto true) */
  showOnlyWhenTyping?: boolean;
}

interface PasswordRule {
  label: string;
  test: (p: string) => boolean;
}

const PASSWORD_RULES: PasswordRule[] = [
  { label: 'Mínimo 8 caracteres', test: (p) => p.length >= 8 },
  { label: 'Una letra mayúscula (A-Z)', test: (p) => /[A-Z]/.test(p) },
  { label: 'Una letra minúscula (a-z)', test: (p) => /[a-z]/.test(p) },
  { label: 'Un número (0-9)', test: (p) => /\d/.test(p) },
  {
    label: 'Un carácter especial (@$!%*?&#)',
    test: (p) => /[@$!%*?&#]/.test(p),
  },
];

/**
 * Checklist visual de requisitos de contraseña (alineado con la política del
 * backend CreateUserDto). Muestra ✓ verde / ✗ rojo por cada requisito en vivo.
 * Úsalo debajo del campo de contraseña.
 */
const PasswordRequirementList: React.FC<PasswordRequirementListProps> = ({
  password,
  showOnlyWhenTyping = true,
}) => {
  if (showOnlyWhenTyping && !password) return null;

  const allMet = PASSWORD_RULES.every((rule) => rule.test(password));
  const isValid = PASSWORD_POLICY_REGEX.test(password);

  return (
    <div
      className={`mt-2 p-3 rounded-lg border ${
        isValid
          ? 'bg-green-50 border-green-200'
          : 'bg-blue-50 border-blue-200'
      }`}
    >
      <p className="text-xs font-medium text-gray-700 mb-1.5">Requisitos de la contraseña:</p>
      <div className="space-y-1">
        {PASSWORD_RULES.map((rule) => {
          const met = rule.test(password);
          return (
            <div key={rule.label} className="flex items-center gap-2">
              {met ? (
                <CheckCircleIcon className="h-4 w-4 text-green-600 shrink-0" />
              ) : (
                <XCircleIcon className="h-4 w-4 text-red-500 shrink-0" />
              )}
              <span
                className={`text-xs ${
                  met ? 'text-green-700' : 'text-gray-600'
                }`}
              >
                {rule.label}
              </span>
            </div>
          );
        })}
      </div>
      {allMet && (
        <p className="text-xs text-green-700 font-medium mt-1.5">
          ¡La contraseña cumple todos los requisitos!
        </p>
      )}
    </div>
  );
};

export default PasswordRequirementList;