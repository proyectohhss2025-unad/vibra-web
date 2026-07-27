import { z } from 'zod';
import { Gender } from '@/utils/enum';

export const UserSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  email: z.string().min(1, 'El email es obligatorio').email('Email inválido'),
  username: z.string().min(1, 'El username es obligatorio'),
  documentNumber: z.string().optional().default(''),
  documentType: z.string().optional().default(''),
  address: z.string().optional().default(''),
  phoneNumber: z.string().optional().default(''),
  gender: z.nativeEnum(Gender).optional().default(Gender.MALE),
  birthDate: z.string().optional().default(''),
  role: z.string().min(1, 'El rol es obligatorio'),
  company: z.string().optional().default(''),
  password: z.string().optional().default(''),
});

export type UserFormData = z.infer<typeof UserSchema>;
