import { z } from 'zod';

export const EmotionSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  description: z.string().optional().default(''),
  orientationNote: z.string().optional().default(''),
  icono: z.string().optional().default(''),
  percentNote: z.number().min(0).max(100).optional().default(0),
  category: z.enum(['', 'Positiva', 'Negativa', 'Neutra', 'Basica', 'Compleja']).default(''),
  intensity: z.number().min(1).max(10).optional().default(5),
});

export type EmotionFormData = z.infer<typeof EmotionSchema>;
