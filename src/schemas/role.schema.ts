import { z } from 'zod';

/**
 * Schema Zod para el formulario de Roles.
 */
export const RoleSchema = z.object({
  name: z.string().min(1, 'El nombre del rol es obligatorio'),
  description: z.string().optional().default(''),
  isActive: z.boolean().default(true),
  isSuperAdmin: z.boolean().default(false),
  permissionTemplate: z.string().optional().default(''),
});

export type RoleFormData = z.infer<typeof RoleSchema>;
