import { z } from 'zod';

/**
 * Schema Zod para el formulario de Company/Institución.
 * Replica las validaciones actuales del formulario company.tsx.
 */
export const CompanySchema = z.object({
  // Datos de la compañía
  name: z.string().min(1, 'El nombre es obligatorio'),
  slogan: z.string().min(1, 'El slogan es obligatorio'),
  nit: z.string().min(1, 'El NIT es obligatorio'),
  address: z.string().min(1, 'La dirección es obligatoria'),
  phoneNumber: z.string().min(1, 'El teléfono es obligatorio'),
  email: z.string().min(1, 'El email es obligatorio').email('Email inválido'),
  billingRangeNumber: z.string().min(1, 'El rango de facturación es obligatorio'),
  isMain: z.boolean().default(false),

  // Manager data (datos del representante)
  managerName: z.string().optional().default(''),
  managerDocumentType: z.string().optional().default(''),
  managerDocument: z.string().optional().default(''),
  managerEmail: z.string().optional().default(''),
  managerPhoneNumber: z.string().optional().default(''),

  // User admin (ID del usuario administrador)
  userAdmin: z.string().min(1, 'Debe seleccionar un usuario administrador'),
});

export type CompanyFormData = z.infer<typeof CompanySchema>;
