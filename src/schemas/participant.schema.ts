import { z } from 'zod';

export const ParticipantSchema = z.object({
  nickname: z.string().min(1, 'El nickname es obligatorio'),
  avatar: z.string().optional().default(''),
  currentCourse: z.string().optional().default(''),
  isActive: z.boolean().default(true),
});

export type ParticipantFormData = z.infer<typeof ParticipantSchema>;
