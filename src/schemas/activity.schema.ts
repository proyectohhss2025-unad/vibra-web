import { z } from 'zod';

export const ActivitySchema = z.object({
  title: z.string().min(1, 'El título es obligatorio'),
  description: z.string().optional().default(''),
  difficulty: z.number().min(1).max(5).default(1),
  isActive: z.boolean().default(true),
  emotionId: z.string().optional().default(''),
  type: z
    .enum(['reto', 'evento_personal', 'actividad_pares', 'otro'])
    .default('evento_personal'),
  scheduleDate: z.string().optional().default(''),
  scheduleWeek: z.number().min(1).default(1),
  scheduleYear: z.number().min(2024).default(new Date().getFullYear()),
});

export type ActivityFormData = z.infer<typeof ActivitySchema>;
