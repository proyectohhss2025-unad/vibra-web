import { z } from 'zod';

export const TestSchema = z.object({
  testId: z.string().min(1, 'El Test ID es obligatorio'),
  title: z.string().min(1, 'El título es obligatorio'),
  description: z.string().min(1, 'La descripción es obligatoria'),
  category: z.string().optional().default(''),
  difficulty: z.number().min(1).max(5).default(1),
  timeLimit: z.number().min(1).default(30),
  passingScore: z.number().min(0).max(100).default(70),
  tags: z.string().optional().default(''),
  showAtStart: z.boolean().default(false),
  showAtEnd: z.boolean().default(false),
});

export type TestFormData = z.infer<typeof TestSchema>;
