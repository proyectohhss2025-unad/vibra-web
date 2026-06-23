import React from 'react';
import { UseFormRegisterReturn, FieldError } from 'react-hook-form';

interface FormFieldProps {
  /** Label del campo */
  label: string;
  /** Nombre del campo (para register y error) */
  name: string;
  /** Register prop de React Hook Form */
  register?: UseFormRegisterReturn;
  /** Error del campo (desde formState.errors) */
  error?: FieldError | string;
  /** Placeholder del input */
  placeholder?: string;
  /** Tipo de input (text, email, number, date, password, tel) */
  type?: string;
  /** Si está deshabilitado */
  disabled?: boolean;
  /** Valor actual (para componentes controlados) */
  value?: string;
  /** onChange (para componentes controlados) */
  onChange?: (value: string) => void;
  /** Render personalizado. Si se provee, se usa en lugar del input estándar */
  render?: (props: {
    value?: string;
    onChange?: (value: string) => void;
    error?: boolean;
    disabled?: boolean;
    placeholder?: string;
  }) => React.ReactNode;
  /** Clases adicionales para el contenedor */
  className?: string;
}

/**
 * Componente de campo de formulario reutilizable para Vibra.
 *
 * Renderiza label + input + mensaje de error.
 * Soporta modo controlado (value/onChange) y no controlado (register).
 * Permite inyectar componentes personalizados via render prop.
 */
const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  register,
  error,
  placeholder,
  type = 'text',
  disabled = false,
  value,
  onChange,
  render,
  className = '',
}) => {
  const errorMessage = error
    ? typeof error === 'string'
      ? error
      : error.message
    : undefined;

  const hasError = !!errorMessage;

  const inputClasses = [
    'w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset',
    'focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm',
    'transition-colors duration-150',
    hasError
      ? 'ring-red-500 focus:ring-red-500'
      : 'ring-gray-300',
    disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-white',
  ].join(' ');

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
      </label>

      {render ? (
        render({
          value,
          onChange,
          error: hasError,
          disabled,
          placeholder,
        })
      ) : (
        <input
          id={name}
          type={type}
          disabled={disabled}
          placeholder={placeholder}
          className={inputClasses}
          autoComplete="off"
          {...(register || {})}
          {...(register ? {} : { value, onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange?.(e.target.value) })}
        />
      )}

      {hasError && (
        <span className="text-xs text-red-500 mt-0.5">{errorMessage}</span>
      )}
    </div>
  );
};

export default FormField;
