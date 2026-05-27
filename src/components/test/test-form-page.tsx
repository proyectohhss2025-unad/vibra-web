'use client';

import { createTest, getTestById, updateTest } from '@/api/test';
import { Test, TestQuestion } from '@/models/test.entity';
import { AuthContext } from '@/services/auth';
import { useTabs } from '@/services/contexts/tabs-context';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { SaveIcon, XCircleIcon } from 'lucide-react';
import { toast } from 'sonner';
import Loading from '@/components/layouts/loading/loading';
import CardSection from '@/components/ui/card-section';
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
  const { token } = useContext(AuthContext);
  const router = useRouter();
  const { closeTabWithRefresh, refreshData, closeTab } = useTabs();

  const queryId = Array.isArray(router.query._id) ? router.query._id[0] : router.query._id;
  const resolvedTestId = String(testId ?? queryId ?? '');
  const currentTabId = resolvedTestId ? `/Test/${resolvedTestId}` : '/Test/new';

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [title, setTitle] = useState('');
  const [testIdField, setTestIdField] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState(1);
  const [timeLimit, setTimeLimit] = useState<number>(30);
  const [passingScore, setPassingScore] = useState<number>(70);
  const [tags, setTags] = useState('');
  const [questions, setQuestions] = useState<QuestionForm[]>([emptyQuestion(0)]);

  useEffect(() => {
    const loadTest = async () => {
      if (!resolvedTestId) return;
      setIsLoading(true);
      try {
        const test = await getTestById(resolvedTestId);
        if (test) {
          setTitle(test.title || '');
          setTestIdField(test.testId || '');
          setDescription(test.description || '');
          setCategory(test.category || '');
          setDifficulty(test.difficulty || 1);
          setTimeLimit(test.timeLimit || 30);
          setPassingScore(test.passingScore || 70);
          setTags((test.tags || []).join(', '));
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
  }, [resolvedTestId]);

  useEffect(() => {
    if (!token) {
      router.push('/layout');
    }
  }, [token, router]);

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

    // Si cambia el tipo a open, limpiar opciones
    if (field === 'type' && (value === 'open')) {
      updated[index].options = [];
    }
    // Si cambia a single/multiple y no tiene opciones, agregar 2 por defecto
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

  const validate = (): boolean => {
    if (!title.trim()) {
      toast.warning('El título es requerido');
      return false;
    }
    if (!testIdField.trim()) {
      toast.warning('El Test ID es requerido');
      return false;
    }
    if (!description.trim()) {
      toast.warning('La descripción es requerida');
      return false;
    }

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

  const handleSave = async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      const payload = {
        testId: testIdField.trim(),
        title: title.trim(),
        description: description.trim(),
        category: category.trim() || undefined,
        difficulty,
        timeLimit,
        passingScore,
        isActive: true,
        questions: questions.map((q) => ({
          questionId: q.questionId,
          type: q.type,
          text: q.text.trim(),
          options: q.type !== 'open' ? q.options.filter((o) => o.trim()) : undefined,
          points: q.points,
          required: q.required,
        })),
        tags: tags
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
      setTimeout(() => closeTabWithRefresh(currentTabId, refreshData), 1500);
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

      {/* Sección 1: Datos generales */}
      <CardSection title="Información General" subtitle="Configure los datos básicos del test">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Test ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={testIdField}
              onChange={(e) => setTestIdField(e.target.value)}
              className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="ej: test-personalidad"
              disabled={!!resolvedTestId}
            />
            <p className="text-xs text-gray-400 mt-1">Identificador único en formato lowercase con guiones</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Título del test"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Descripción del test"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dificultad (1-5)
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="1"
                max="5"
                value={difficulty}
                onChange={(e) => setDifficulty(Number(e.target.value))}
                className="w-full"
              />
              <span className="text-sm font-semibold text-gray-700 min-w-[1.5rem]">{difficulty}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tiempo límite (minutos)
            </label>
            <input
              type="number"
              min="1"
              value={timeLimit}
              onChange={(e) => setTimeLimit(Number(e.target.value))}
              className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Puntaje mínimo (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={passingScore}
              onChange={(e) => setPassingScore(Number(e.target.value))}
              className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags (separados por coma)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="ej: emociones, basico, estudiante"
            />
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
              <h3 className="text-base font-medium text-gray-800">
                Pregunta {qIndex + 1}
              </h3>
              <button
                type="button"
                onClick={() => handleRemoveQuestion(qIndex)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                🗑️ Eliminar
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Texto de la pregunta <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={question.text}
                  onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
                  className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Escriba la pregunta..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  value={question.type}
                  onChange={(e) => handleQuestionChange(qIndex, 'type', e.target.value)}
                  className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="open">Abierta</option>
                  <option value="single">Opción única</option>
                  <option value="multiple">Opción múltiple</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Puntos</label>
                <input
                  type="number"
                  min="1"
                  value={question.points}
                  onChange={(e) => handleQuestionChange(qIndex, 'points', Number(e.target.value))}
                  className="block w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={question.required}
                    onChange={(e) => handleQuestionChange(qIndex, 'required', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Requerido</span>
                </label>
              </div>
            </div>

            {/* Opciones (solo para single/multiple) */}
            {(question.type === 'single' || question.type === 'multiple') && (
              <div className="mt-4 pt-3 border-t">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-gray-700">Opciones</h4>
                  <button
                    type="button"
                    onClick={() => handleAddOption(qIndex)}
                    className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-xs font-medium"
                  >
                    + Agregar opción
                  </button>
                </div>

                {question.options.map((option, oIndex) => (
                  <div key={oIndex} className="flex items-center space-x-2 mb-2">
                    <span className="text-xs text-gray-400 w-5">{oIndex + 1}.</span>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                      className="flex-1 rounded-md border border-gray-300 py-1.5 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={`Opción ${oIndex + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(qIndex, oIndex)}
                      className="text-red-400 hover:text-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </CardSection>

      {/* Botones de acción */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={handleCancel}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-800 bg-gray-100 border border-gray-400 rounded-lg hover:bg-gray-300 hover:border-gray-500 transition-colors"
        >
          <XCircleIcon className="w-4 h-4" />
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <SaveIcon className="w-4 h-4" />
          {isSaving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </div>
  );
};

export default TestFormPage;
