'use client';

import { createTest, getTestById, updateTest } from '@/api/test';
import { useTabs } from '@/services/contexts/tabs-context';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { SaveIcon, XCircleIcon } from 'lucide-react';
import { toast } from 'sonner';
import Loading from '@/components/layouts/loading/loading';
import CardSection from '@/components/ui/card-section';
import FormField from '@/components/forms/FormField';
import { useVibraForm } from '@/hooks/useVibraForm';
import { TestSchema, type TestFormData } from '@/schemas';
import './test.css';

type TestFormPageProps = {
  testId?: string;
};

type QuestionForm = {
  questionId: string;
  type: 'open' | 'single' | 'multiple';
  text: string;
  options: string[];
  points: number;
  required: boolean;
};

const emptyQuestion = (index: number): QuestionForm => ({
  questionId: `q${index + 1}`,
  type: 'open',
  text: '',
  options: [],
  points: 1,
  required: true,
});

const TestFormPage: React.FC<TestFormPageProps> = ({ testId }) => {
  const router = useRouter();
  const { closeTabWithRefresh, closeTab } = useTabs();

  const queryId = Array.isArray(router.query._id) ? router.query._id[0] : router.query._id;
  const resolvedTestId = String(testId ?? queryId ?? '');
  const currentTabId = resolvedTestId ? `/Test/${resolvedTestId}` : '/Test/new';

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [questions, setQuestions] = useState<QuestionForm[]>([emptyQuestion(0)]);

  const { register, handleSubmit, errors, reset, setValue, watch } = useVibraForm(TestSchema, {
    testId: '',
    title: '',
    description: '',
    category: '',
    difficulty: 1,
    timeLimit: 30,
    passingScore: 70,
    tags: '',
    showAtStart: false,
    showAtEnd: false,
  });

  const watchDifficulty = watch('difficulty');
  const watchShowAtStart = watch('showAtStart');
  const watchShowAtEnd = watch('showAtEnd');

  useEffect(() => {
    const loadTest = async () => {
      if (!resolvedTestId) return;
      setIsLoading(true);
      try {
        const test = await getTestById(resolvedTestId);
        if (test) {
          reset({
            testId: test.testId || '',
            title: test.title || '',
            description: test.description || '',
            category: test.category || '',
            difficulty: test.difficulty || 1,
            timeLimit: test.timeLimit || 30,
            passingScore: test.passingScore || 70,
            tags: (test.tags || []).join(', '),
            showAtStart: test.showAtStart || false,
            showAtEnd: test.showAtEnd || false,
          });
          setQuestions(
            (test.questions || []).map((q, i) => ({
              questionId: q.questionId || `q${i + 1}`,
              type: q.type || 'open',
              text: q.text || '',
              options: q.options || [],
              points: q.points || 1,
              required: q.required !== false,
            }))
          );
        }
      } catch (error) {
        console.error('Error loading test:', error);
        toast.error('Error al cargar el test');
      } finally {
        setIsLoading(false);
      }
    };
    loadTest();
  }, [resolvedTestId, reset]);

  const handleAddQuestion = () => {
    setQuestions([...questions, emptyQuestion(questions.length)]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length <= 1) {
      toast.warning('Debe haber al menos una pregunta');
      return;
    }
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index: number, field: keyof QuestionForm, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };

    if (field === 'type' && value === 'open') {
      updated[index].options = [];
    }
    if (field === 'type' && (value === 'single' || value === 'multiple') && updated[index].options.length === 0) {
      updated[index].options = ['', ''];
    }

    setQuestions(updated);
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const handleAddOption = (qIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options.push('');
    setQuestions(updated);
  };

  const handleRemoveOption = (qIndex: number, oIndex: number) => {
    const updated = [...questions];
    if (updated[qIndex].options.length <= 2) {
      toast.warning('Debe haber al menos 2 opciones');
      return;
    }
    updated[qIndex].options = updated[qIndex].options.filter((_, i) => i !== oIndex);
    setQuestions(updated);
  };

  const validateQuestions = (): boolean => {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        toast.warning(`La pregunta ${i + 1} no tiene texto`);
        return false;
      }
      if ((q.type === 'single' || q.type === 'multiple') && q.options.length < 2) {
        toast.warning(`La pregunta ${i + 1} debe tener al menos 2 opciones`);
        return false;
      }
      if ((q.type === 'single' || q.type === 'multiple') && q.options.some((o) => !o.trim())) {
        toast.warning(`La pregunta ${i + 1} tiene opciones vacías`);
        return false;
      }
    }
    return true;
  };

  const handleSave = async (data: TestFormData) => {
    if (!validateQuestions()) return;

    setIsSaving(true);
    try {
      const payload = {
        testId: data.testId.trim(),
        title: data.title.trim(),
        description: data.description.trim(),
        category: data.category.trim() || undefined,
        difficulty: data.difficulty,
        timeLimit: data.timeLimit,
        passingScore: data.passingScore,
        isActive: true,
        showAtStart: data.showAtStart,
        showAtEnd: data.showAtEnd,
        questions: questions.map((q) => ({
          questionId: q.questionId,
          type: q.type,
          text: q.text.trim(),
          options: q.type !== 'open' ? q.options.filter((o) => o.trim()) : undefined,
          points: q.points,
          required: q.required,
        })),
        tags: data.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      };

      if (resolvedTestId) {
        await updateTest(resolvedTestId, payload);
        setSuccess('Test actualizado exitosamente');
      } else {
        await createTest(payload);
        setSuccess('Test creado exitosamente');
      }
      setTimeout(() => closeTabWithRefresh(currentTabId, true), 1500);
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar el test');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    closeTab(currentTabId);
  };

  if (isLoading) return <Loading />;

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">¡Operación exitosa!</h3>
          <p className="text-sm text-gray-500">{success}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="test-container container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {resolvedTestId ? 'Editar Test' : 'Nuevo Test'}
      </h1>

      <form onSubmit={handleSubmit(handleSave)}>
        {/* Sección 1: Datos generales */}
        <CardSection title="Información General" subtitle="Configure los datos básicos del test">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
            {/* testId - ancho compacto */}
            <div className="md:col-span-1">
              <FormField
                label="Test ID *"
                name="testId"
                register={register('testId')}
                error={errors.testId}
                placeholder="ej: test-personalidad"
                disabled={!!resolvedTestId}
              />
            </div>

            {/* category - sube a fila del título */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select
                {...register('category')}
                className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleccione categoría</option>
                <option value="Emociones">Emociones</option>
                <option value="Personalidad">Personalidad</option>
                <option value="Conocimiento">Conocimiento</option>
                <option value="Habilidades">Habilidades</option>
                <option value="Salud">Salud</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            {/* title - mayor protagonismo */}
            <div className="md:col-span-3">
              <FormField
                label="Título *"
                name="title"
                register={register('title')}
                error={errors.title}
                placeholder="Título del test"
              />
            </div>

            {/* description textarea */}
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Descripción del test"
              />
              {errors.description && (
                <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>
              )}
            </div>

            {/* tags textarea */}
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (separados por coma)
              </label>
              <textarea
                {...register('tags')}
                rows={4}
                className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="ej: emociones, básico, estudiante"
              />
              {errors.tags && (
                <p className="text-xs text-red-500 mt-1">{errors.tags.message}</p>
              )}
            </div>

            {/* difficulty */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Dificultad (1-5)</label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={watchDifficulty}
                  onChange={(e) => setValue('difficulty', Number(e.target.value))}
                  className="w-full"
                />
                <span className="text-sm font-semibold text-gray-700 min-w-[1.5rem]">{watchDifficulty}</span>
              </div>
            </div>

            {/* timeLimit */}
            <div className="md:col-span-2">
              <FormField
                label="Tiempo límite (minutos)"
                name="timeLimit"
                type="number"
                register={register('timeLimit', { valueAsNumber: true })}
                error={errors.timeLimit}
              />
            </div>

            {/* passingScore */}
            <div className="md:col-span-2">
              <FormField
                label="Puntaje mínimo (%)"
                name="passingScore"
                type="number"
                register={register('passingScore', { valueAsNumber: true })}
                error={errors.passingScore}
              />
            </div>

            {/* checkboxes */}
            <div className="md:col-span-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Configuración de visualización</label>
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={watchShowAtStart}
                    onChange={(e) => setValue('showAtStart', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Mostrar al iniciar sesión</span>
                    <p className="text-xs text-gray-400">Test inicial: se presenta al usuario después del login</p>
                  </div>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={watchShowAtEnd}
                    onChange={(e) => setValue('showAtEnd', e.target.checked)}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Mostrar al cerrar sesión</span>
                    <p className="text-xs text-gray-400">Test final: se presenta al usuario antes del logout</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </CardSection>

        {/* Sección 2: Preguntas */}
        <CardSection title="Preguntas" subtitle="Configure las preguntas del test">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm font-medium text-gray-600">Preguntas ({questions.length})</p>
            <button
              type="button"
              onClick={handleAddQuestion}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-medium transition-colors"
            >
              + Agregar pregunta
            </button>
          </div>

          {questions.map((question, qIndex) => (
            <div key={qIndex} className="question-card">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-base font-medium text-gray-800">Pregunta {qIndex + 1}</h3>
                <button type="button" onClick={() => handleRemoveQuestion(qIndex)} className="text-red-500 hover:text-red-700 text-sm">🗑️ Eliminar</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Texto de la pregunta <span className="text-red-500">*</span></label>
                  <input type="text" value={question.text} onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Escriba la pregunta..." />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select value={question.type} onChange={(e) => handleQuestionChange(qIndex, 'type', e.target.value)}
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="open">Abierta</option>
                    <option value="single">Opción única</option>
                    <option value="multiple">Opción múltiple</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Puntos</label>
                  <input type="number" min="1" value={question.points} onChange={(e) => handleQuestionChange(qIndex, 'points', Number(e.target.value))}
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>

                <div className="flex items-center">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" checked={question.required} onChange={(e) => handleQuestionChange(qIndex, 'required', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                    <span className="text-sm text-gray-700">Requerido</span>
                  </label>
                </div>
              </div>

              {(question.type === 'single' || question.type === 'multiple') && (
                <div className="mt-4 pt-3 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium text-gray-700">Opciones</h4>
                    <button type="button" onClick={() => handleAddOption(qIndex)}
                      className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-xs font-medium">+ Agregar opción</button>
                  </div>
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center space-x-2 mb-2">
                      <span className="text-xs text-gray-400 w-5">{oIndex + 1}.</span>
                      <input type="text" value={option} onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                        className="flex-1 rounded-md border border-gray-300 py-1.5 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder={`Opción ${oIndex + 1}`} />
                      <button type="button" onClick={() => handleRemoveOption(qIndex, oIndex)} className="text-red-400 hover:text-red-600">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </CardSection>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-4">
          <button type="button" onClick={handleCancel}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-800 bg-gray-100 border border-gray-400 rounded-lg hover:bg-gray-300 hover:border-gray-500 transition-colors">
            <XCircleIcon className="w-4 h-4" /> Cancelar
          </button>
          <button type="submit" disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <SaveIcon className="w-4 h-4" /> {isSaving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TestFormPage;
