import { z } from 'zod';

/**
 * Expresión cron válida: 5 campos separados por espacio.
 */
const cronExpressionRegex = /^(\*|([0-5]?\d))\s(\*|([01]?\d|2[0-3]))\s(\*|([01]?\d|2[0-9]|3[01]))\s(\*|(0?[1-9]|1[0-2]))\s(\*|([0-6]))$/;

export const CronJobSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(100, 'El nombre no puede exceder 100 caracteres'),
  jobType: z.string().min(1, 'El tipo de job es obligatorio'),
  description: z.string().max(500, 'La descripción no puede exceder 500 caracteres').optional().default(''),
  expression: z
    .string()
    .min(1, 'La expresión cron es obligatoria')
    .refine(
      (val) => {
        const fields = val.trim().split(/\s+/);
        return fields.length === 5;
      },
      { message: 'La expresión cron debe tener exactamente 5 campos (minuto hora día-mes mes día-semana)' }
    ),
  active: z.boolean().default(true),
  config: z.record(z.any()).optional().default({}),
  retryOnFailure: z.boolean().optional().default(false),
  maxRetries: z.number().min(0).max(10).optional().default(0),
  notifyOnError: z.boolean().optional().default(false),
  notifyOnSuccess: z.boolean().optional().default(false),
});

export type CronJobFormData = z.infer<typeof CronJobSchema>;
