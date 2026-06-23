import { useForm, UseFormReturn, DefaultValues } from 'react-hook-form';
import { z, ZodSchema, TypeOf } from 'zod';

/**
 * Resolver personalizado que integra React Hook Form con Zod.
 * Reemplaza @hookform/resolvers para evitar conflictos de versiones.
 */
function zodResolver<T extends ZodSchema>(schema: T) {
  return async (data: unknown) => {
    try {
      const parsed = await schema.parseAsync(data);
      return { values: parsed, errors: {} } as any;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, { type: string; message: string }> = {};
        for (const issue of error.errors) {
          const path = issue.path.join('.');
          if (!fieldErrors[path]) {
            fieldErrors[path] = { type: issue.code, message: issue.message };
          }
        }
        return { values: {}, errors: fieldErrors };
      }
      return { values: {}, errors: { _form: { type: 'error', message: 'Error de validación' } } };
    }
  };
}

/**
 * Hook unificado para formularios Vibra.
 * Integra React Hook Form + Zod con tipado fuerte.
 *
 * @param schema - Schema Zod del formulario
 * @param defaultValues - Valores iniciales (opcional)
 * @returns Métodos de React Hook Form tipados
 *
 * @example
 * const { register, errors, handleSubmit, isSubmitting } = useVibraForm(CompanySchema);
 */
export function useVibraForm<T extends ZodSchema>(
  schema: T,
  defaultValues?: DefaultValues<TypeOf<T>>,
): UseFormReturn<TypeOf<T>> & { errors: Record<string, any> } {
  const form = useForm<TypeOf<T>>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  // Extraemos errors en un formato más accesible
  const errors = form.formState.errors;

  return {
    ...form,
    errors,
  };
}
