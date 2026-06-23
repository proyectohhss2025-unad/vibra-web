import { z } from 'zod';

export const PolicySchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  description: z.string().optional().default(''),
  category: z.string().optional().default(''),
  content: z.string().optional().default(''),
});

export type PolicyFormData = z.infer<typeof PolicySchema>;
