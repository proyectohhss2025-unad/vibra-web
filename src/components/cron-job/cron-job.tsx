'use client';

import { create, update, getById, getAvailableTypes } from '@/api/cron-job';
import { CronJob, JobTypeInfo } from '@/models/cron-job.entity';
import { useTabs } from '@/services/contexts/tabs-context';
import { useRouter } from 'next/router';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useVibraForm } from '@/hooks/useVibraForm';
import { CronJobSchema, type CronJobFormData } from '@/schemas';
import CardSection from '../ui/card-section';
import FormPageLayout from '../ui/form-page-layout';
import Loading from '../layouts/loading/loading';

type CronJobComponentProps = {
  jobId?: string;
};

const CronJobComponent: React.FC<CronJobComponentProps> = ({ jobId }) => {
  const router = useRouter();
  const { closeTabWithRefresh, closeTab } = useTabs();

  const queryJobId = Array.isArray(router.query._id) ? router.query._id[0] : router.query._id;
  const resolvedJobId = String(jobId ?? queryJobId ?? '');
  const currentTabId = resolvedJobId ? `/CronJob/${resolvedJobId}` : '/CronJob';
  const isEditing = !!(resolvedJobId && resolvedJobId !== 'undefined' && resolvedJobId !== 'null');

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingTypes, setIsLoadingTypes] = useState(true);
  const [jobTypes, setJobTypes] = useState<JobTypeInfo[]>([]);
  const [selectedJobType, setSelectedJobType] = useState<JobTypeInfo | null>(null);

  const { register, handleSubmit, errors, reset, setValue, watch } = useVibraForm(CronJobSchema, {
    name: '',
    jobType: '',
    description: '',
    expression: '',
    active: true,
    config: {},
    retryOnFailure: false,
    maxRetries: 0,
    notifyOnError: false,
    notifyOnSuccess: false,
  });

  const watchJobType = watch('jobType');
  const watchActive = watch('active');

  // ── Cargar tipos de job disponibles ─────────────────────────────────
  useEffect(() => {
    const loadTypes = async () => {
      setIsLoadingTypes(true);
      try {
        const types = await getAvailableTypes();
        setJobTypes(types);
      } catch (error) {
        console.error('Error loading job types:', error);
        toast.error('Error al cargar tipos de tarea');
      } finally {
        setIsLoadingTypes(false);
      }
    };
    loadTypes();
  }, []);

  // ── Cargar datos del job si es edición ──────────────────────────────
  useEffect(() => {
    if (!isEditing) return;
    const loadJob = async () => {
      setIsLoading(true);
      try {
        const job = await getById(resolvedJobId);
        if (job) {
          reset({
            name: job.name,
            jobType: job.jobType,
            description: job.description || '',
            expression: job.expression,
            active: job.active,
            config: job.config || {},
            retryOnFailure: job.retryOnFailure || false,
            maxRetries: job.maxRetries || 0,
            notifyOnError: job.notifyOnError || false,
            notifyOnSuccess: job.notifyOnSuccess || false,
          });
          setSelectedJobType(jobTypes.find(t => t.name === job.jobType) || null);
        }
      } catch (error) {
        toast.error('Error al cargar la tarea');
      } finally {
        setIsLoading(false);
      }
    };
    if (jobTypes.length > 0) loadJob();
  }, [isEditing, resolvedJobId, jobTypes]);

  // ── Actualizar descripción del tipo seleccionado ────────────────────
  useEffect(() => {
    const type = jobTypes.find(t => t.name === watchJobType) || null;
    setSelectedJobType(type);
  }, [watchJobType, jobTypes]);

  // ── Submit ──────────────────────────────────────────────────────────
  const handleFormSubmit = async (formData: CronJobFormData) => {
    setIsSubmitting(true);
    try {
      if (isEditing) {
        await update(resolvedJobId, {
          name: formData.name,
          description: formData.description,
          expression: formData.expression,
          active: formData.active,
          config: formData.config,
          retryOnFailure: formData.retryOnFailure,
          maxRetries: formData.maxRetries,
          notifyOnError: formData.notifyOnError,
          notifyOnSuccess: formData.notifyOnSuccess,
        });
        toast.success('Tarea programada actualizada correctamente');
        closeTabWithRefresh(currentTabId, true);
      } else {
        await create({
          name: formData.name,
          jobType: formData.jobType,
          description: formData.description,
          expression: formData.expression,
          active: formData.active,
          config: formData.config,
          retryOnFailure: formData.retryOnFailure,
          maxRetries: formData.maxRetries,
          notifyOnError: formData.notifyOnError,
          notifyOnSuccess: formData.notifyOnSuccess,
        });
        toast.success('Tarea programada creada correctamente');
        closeTabWithRefresh(currentTabId, true);
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Error al guardar la tarea';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    closeTab(currentTabId);
  };

  if (isLoading || isLoadingTypes) return <Loading />;

  return (
    <FormPageLayout
      title={isEditing ? 'Editar Tarea Programada' : 'Nueva Tarea Programada'}
      isEditing={isEditing}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(handleFormSubmit)}
      onCancel={handleCancel}
    >
      <div className="space-y-6">
        {/* Información básica */}
        <CardSection title="Información básica" subtitle="Datos generales de la tarea programada">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input
                type="text"
                {...register('name')}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Ej: Backup diario de BD"
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>

            {/* Tipo de Job */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de tarea *</label>
              <select
                {...register('jobType')}
                disabled={isEditing}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Seleccionar tipo...</option>
                {jobTypes.map((type) => (
                  <option key={type.name} value={type.name}>
                    {type.label} ({type.name})
                  </option>
                ))}
              </select>
              {errors.jobType && <p className="text-xs text-red-500 mt-1">{errors.jobType.message}</p>}
              {selectedJobType && (
                <p className="text-xs text-gray-500 mt-1">{selectedJobType.description}</p>
              )}
            </div>

            {/* Descripción */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                {...register('description')}
                rows={2}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="¿Qué hace esta tarea?"
              />
              {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
            </div>

            {/* Expresión Cron */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Expresión Cron *</label>
              <input
                type="text"
                {...register('expression')}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="0 0 * * *"
              />
              {errors.expression && <p className="text-xs text-red-500 mt-1">{errors.expression.message}</p>}
              <p className="text-xs text-gray-400 mt-1">
                Formato: <code className="bg-gray-100 px-1 rounded">minuto hora día-mes mes día-semana</code>.
                Ej: <code className="bg-gray-100 px-1 rounded">0 0 * * *</code> = cada día a medianoche,
                <code className="bg-gray-100 px-1 rounded">*/5 * * * *</code> = cada 5 minutos.
              </p>
            </div>
          </div>
        </CardSection>

        {/* Configuración de ejecución */}
        <CardSection title="Configuración de ejecución" subtitle="Control de ejecución y reintentos">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Activo */}
            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                {...register('active')}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <label className="text-sm font-medium text-gray-700">Activo</label>
                <p className="text-xs text-gray-500">Ejecutar según la programación</p>
              </div>
            </div>

            {/* Reintentar */}
            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                {...register('retryOnFailure')}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <label className="text-sm font-medium text-gray-700">Reintentar al fallar</label>
                <p className="text-xs text-gray-500">Reintentar si la ejecución falla</p>
              </div>
            </div>

            {/* Max reintentos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Máx. reintentos</label>
              <input
                type="number"
                {...register('maxRetries', { valueAsNumber: true })}
                min={0}
                max={10}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              {errors.maxRetries && <p className="text-xs text-red-500 mt-1">{errors.maxRetries.message}</p>}
            </div>
          </div>
        </CardSection>

        {/* Notificaciones */}
        <CardSection title="Notificaciones" subtitle="Configuración de alertas">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                {...register('notifyOnError')}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <label className="text-sm font-medium text-gray-700">Notificar en error</label>
                <p className="text-xs text-gray-500">Enviar alerta si la tarea falla</p>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                {...register('notifyOnSuccess')}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <label className="text-sm font-medium text-gray-700">Notificar en éxito</label>
                <p className="text-xs text-gray-500">Enviar alerta si la tarea se completa</p>
              </div>
            </div>
          </div>
        </CardSection>

        {/* Resumen */}
        <CardSection title="Resumen de programación" subtitle="Vista previa de la configuración">
          <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div><span className="text-gray-500">Nombre:</span> <span className="font-medium">{watch('name') || '—'}</span></div>
              <div><span className="text-gray-500">Tipo:</span> <span className="font-medium">{selectedJobType?.label || watchJobType || '—'}</span></div>
              <div><span className="text-gray-500">Expresión:</span> <code className="font-mono bg-gray-200 px-1.5 py-0.5 rounded text-xs">{watch('expression') || '—'}</code></div>
              <div><span className="text-gray-500">Estado:</span> {watchActive ? <span className="text-green-600 font-medium">Activo</span> : <span className="text-gray-400 font-medium">Inactivo</span>}</div>
            </div>
          </div>
        </CardSection>
      </div>
    </FormPageLayout>
  );
};

export default CronJobComponent;
