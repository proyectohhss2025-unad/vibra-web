import { z } from 'zod';

export const CourseSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  description: z.string().optional().default(''),
  companyId: z.string().min(1, 'La institución es obligatoria'),
  instructorId: z.string().optional().default(''),
  category: z.string().optional().default(''),
  maxStudents: z.number().min(0).optional().default(0),
  startDate: z.string().optional().default(''),
  endDate: z.string().optional().default(''),
  status: z.boolean().default(true),
});

export type CourseFormData = z.infer<typeof CourseSchema>;
