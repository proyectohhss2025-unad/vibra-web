/**
 * Entidad CronJob — Tareas programadas del sistema.
 */
export interface CronJob {
  _id: string;
  name: string;
  jobType: string;
  description: string;
  expression: string;
  active: boolean;
  status: 'idle' | 'running' | 'paused' | 'error';
  lastRunAt: string | null;
  lastResult: 'success' | 'error' | null;
  lastErrorMessage: string;
  lastDuration: number;
  nextRunAt: string | null;
  config: Record<string, any>;
  retryOnFailure: boolean;
  maxRetries: number;
  notifyOnError: boolean;
  notifyOnSuccess: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JobTypeInfo {
  name: string;
  label: string;
  description: string;
  configSchema: Record<string, any>;
}

export interface CronJobExecution {
  _id: string;
  jobId: string;
  jobType: string;
  jobName: string;
  startedAt: string;
  completedAt: string | null;
  duration: number;
  result: 'success' | 'error' | 'running';
  errorMessage: string;
  triggeredBy: 'scheduler' | 'manual' | 'retry';
  output: Record<string, any>;
}

export interface CreateCronJobPayload {
  name: string;
  jobType: string;
  description?: string;
  expression: string;
  active?: boolean;
  config?: Record<string, any>;
  retryOnFailure?: boolean;
  maxRetries?: number;
  notifyOnError?: boolean;
  notifyOnSuccess?: boolean;
}

export interface UpdateCronJobPayload {
  name?: string;
  description?: string;
  expression?: string;
  active?: boolean;
  config?: Record<string, any>;
  retryOnFailure?: boolean;
  maxRetries?: number;
  notifyOnError?: boolean;
  notifyOnSuccess?: boolean;
}
