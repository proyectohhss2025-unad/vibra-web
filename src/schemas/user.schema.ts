import { z } from 'zod';
import { Gender } from '@/utils/enum';

// Misma política de contraseña que el backend (CreateUserDto):
// mínimo 8 caracteres, mayúscula, minúscula, número y carácter especial (@$!%*?&#)
export const PASSWORD_POLICY_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

export const PASSWORD_POLICY_MESSAGE =
  'Mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&#)';

export const UserSchema = z
  .object({
    name: z.string().min(1, 'El nombre es obligatorio'),
    email: z.string().min(1, 'El email es obligatorio').email('Email inválido'),
    username: z.string().min(1, 'El username es obligatorio'),
    documentNumber: z
      .string()
      .optional()
      .default('')
      .refine(
        (v) => !v || (/^\d+$/.test(v) && v.length >= 8 && v.length <= 10),
        'Solo números, entre 8 y 10 dígitos',
      ),
    documentType: z.string().optional().default(''),
    address: z.string().optional().default(''),
    phoneNumber: z.string().optional().default(''),
    gender: z.nativeEnum(Gender).optional().default(Gender.MALE),
    birthDate: z.string().optional().default(''),
    role: z.string().min(1, 'El rol es obligatorio'),
    company: z.string().optional().default(''),
    password: z
      .string()
      .optional()
      .default('')
      .refine(
        (v) => !v || PASSWORD_POLICY_REGEX.test(v),
        PASSWORD_POLICY_MESSAGE,
      ),
    confirmPassword: z.string().optional().default(''),
  })
  .superRefine((data, ctx) => {
    // Solo exigir coincidencia si se está definiendo una contraseña
    if (data.password && data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: 'Las contraseñas no coinciden',
      });
    }
  });

export type UserFormData = z.infer<typeof UserSchema>;
