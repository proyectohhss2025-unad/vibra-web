'use client'

import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { createPreTest, getPreTestById } from '@/api/preTest';
import { PreTest, Question, QuestionType, Option } from '@/models/preTest.entity';
import Loading from '@/components/layouts/loading/loading';
import './preTest.css';
import { getSafeKeyFromStorage } from '@/utils/safe-token-storage';
import { toast } from 'sonner';
import { useTabs } from '@/services/contexts/tabs-context';
import { AuthContext } from '@/services/auth';
import { useContext } from 'react';

/**
 * Componente para crear o editar un preTest
 */
type PreTestComponentProps = {
    preTestId?: string;
};

const PreTestComponent: React.FC<PreTestComponentProps> = ({ preTestId }) => {
    const router = useRouter();
    const { token } = useContext(AuthContext);
    const { closeTabWithRefresh, refreshData, closeTab } = useTabs();
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [difficulty, setDifficulty] = useState<number>(1);
    const [timeLimit, setTimeLimit] = useState<number>(30);
    const [passingScore, setPassingScore] = useState<number>(70);
    const [category, setCategory] = useState<string>('');
    const [tags, setTags] = useState<string[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [preTestID, setPreTestID] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isFormValid, setIsFormValid] = useState<boolean>(false);

    // Objeto limpio para resetear el formulario
    const preTestClean: PreTest = {
        title: '',
        description: '',
        questions: [],
        difficulty: 1,
        timeLimit: 30,
        passingScore: 70,
        isActive: true,
        category: '',
        tags: [],
        createdBy: 'admin',
        createdAt: new Date()
    };

    // Estado para el preTest actual
    const [preTest, setPreTest] = useState<PreTest>(preTestClean);

    const queryPreTestId = Array.isArray(router.query._id) ? router.query._id[0] : router.query._id;
    const resolvedPreTestId = String(preTestId ?? queryPreTestId ?? '');
    const currentTabId = resolvedPreTestId ? `/PreTest/${resolvedPreTestId}` : '/PreTest';

    /**
     * Obtiene los datos del preTest si se está editando
     */
    useEffect(() => {
        const getDataPreTest = async () => {
            if (!resolvedPreTestId || resolvedPreTestId === 'undefined' || resolvedPreTestId === 'null') {
                return;
            }

            setIsLoading(true);
            try {
                const responsePreTest = await getPreTestById(resolvedPreTestId);
                if (responsePreTest._id) {
                    setPreTest(responsePreTest);
                    setTitle(responsePreTest?.title || '');
                    setDescription(responsePreTest?.description || '');
                    setDifficulty(responsePreTest?.difficulty || 1);
                    setTimeLimit(responsePreTest?.timeLimit || 30);
                    setPassingScore(responsePreTest?.passingScore || 70);
                    setCategory(responsePreTest?.category || '');
                    setTags(responsePreTest?.tags || []);
                    setQuestions(responsePreTest?.questions || []);
                    setPreTestID(resolvedPreTestId);
                }
            } catch (error) {
                console.error('Error al obtener preTest:', error);
                toast.error('Error al cargar el preTest');
            } finally {
                setIsLoading(false);
            }
        };

        getDataPreTest();
    }, [resolvedPreTestId]);

    /**
     * Valida el formulario cuando cambian los campos requeridos
     */
    useEffect(() => {
        if (title && description && questions.length > 0) {
            setIsFormValid(true);
        } else {
            setIsFormValid(false);
        }
    }, [title, description, questions]);

    /**
     * Guarda o actualiza el preTest
     */
    const handleSave = async () => {
        if (!isFormValid) {
            toast.warning('Por favor complete todos los campos requeridos');
            return;
        }

        setIsLoading(true);
        try {
            const preTestResponse = await createPreTest(
                preTestID,
                title,
                description,
                questions,
                difficulty,
                timeLimit,
                passingScore,
                category,
                tags,
                'admin' // Idealmente, esto debería venir del usuario autenticado
            );

            if (preTestResponse) {
                toast.success(preTestID ? 'PreTest actualizado correctamente' : 'PreTest creado correctamente');
                setPreTest(preTestClean);
                closeTabWithRefresh(currentTabId, refreshData);
            }
        } catch (error) {
            console.error('Error al guardar preTest:', error);
            toast.error('Error al guardar el preTest');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Agrega una nueva pregunta al preTest
     */
    const handleAddQuestion = () => {
        const newQuestion: Question = {
            text: '',
            type: QuestionType.SINGLE_CHOICE,
            options: [],
            points: 1,
            required: true
        };
        setQuestions([...questions, newQuestion]);
    };

    /**
     * Actualiza una pregunta existente
     */
    const handleUpdateQuestion = (index: number, field: keyof Question, value: any) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index] = {
            ...updatedQuestions[index],
            [field]: value
        };
        setQuestions(updatedQuestions);
    };

    /**
     * Elimina una pregunta
     */
    const handleRemoveQuestion = (index: number) => {
        const updatedQuestions = questions.filter((_, i) => i !== index);
        setQuestions(updatedQuestions);
    };

    /**
     * Agrega una opción a una pregunta
     */
    const handleAddOption = (questionIndex: number) => {
        const updatedQuestions = [...questions];
        const newOption: Option = {
            text: '',
            isCorrect: false
        };

        updatedQuestions[questionIndex].options ??= [];

        updatedQuestions[questionIndex].options?.push(newOption);
        setQuestions(updatedQuestions);
    };

    /**
     * Actualiza una opción de una pregunta
     */
    const handleUpdateOption = (questionIndex: number, optionIndex: number, field: keyof Option, value: any) => {
        const updatedQuestions = [...questions];
        if (updatedQuestions[questionIndex].options?.[optionIndex]) {
            updatedQuestions[questionIndex].options![optionIndex] = {
                ...updatedQuestions[questionIndex].options![optionIndex],
                [field]: value
            };
            setQuestions(updatedQuestions);
        }
    };

    /**
     * Elimina una opción de una pregunta
     */
    const handleRemoveOption = (questionIndex: number, optionIndex: number) => {
        const updatedQuestions = [...questions];
        if (updatedQuestions[questionIndex].options) {
            updatedQuestions[questionIndex].options = updatedQuestions[questionIndex].options!.filter((_, i) => i !== optionIndex);
            setQuestions(updatedQuestions);
        }
    };

    /**
     * Cancela la edición y vuelve a la lista de preTests
     */
    const handleCancel = () => {
        closeTab(currentTabId);
    };

    if (isLoading) {
        return <Loading />;
    }

    if (!token) {
        return null;
    }

    return (
        <div className="preTest-container container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">
                {preTestID ? getSafeKeyFromStorage('Edit Pre-Test') : getSafeKeyFromStorage('Create Pre-Test')}
            </h1>

            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Título */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-900">
                            {getSafeKeyFromStorage('Title')} *
                        </label>
                        <div className="mt-2 flex rounded-md shadow-sm">
                            <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">preTest.title:</span>
                            <input
                                type="text"
                                name="title"
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                                placeholder="Título del preTest"
                                required
                            />
                        </div>
                    </div>

                    {/* Categoría */}
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium leading-6 text-gray-900">
                            {getSafeKeyFromStorage('Category')}
                        </label>
                        <div className="mt-2">
                            <input
                                type="text"
                                name="category"
                                id="category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                placeholder="Categoría"
                            />
                        </div>
                    </div>

                    {/* Descripción */}
                    <div className="md:col-span-2">
                        <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">
                            {getSafeKeyFromStorage('Description')} *
                        </label>
                        <div className="mt-2">
                            <textarea
                                name="description"
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                placeholder="Descripción del preTest"
                                required
                            />
                        </div>
                    </div>

                    {/* Dificultad */}
                    <div>
                        <label htmlFor="difficulty" className="block text-sm font-medium leading-6 text-gray-900">
                            {getSafeKeyFromStorage('Difficulty')} (1-5)
                        </label>
                        <div className="mt-2">
                            <input
                                type="number"
                                name="difficulty"
                                id="difficulty"
                                min="1"
                                max="5"
                                value={difficulty}
                                onChange={(e) => setDifficulty(Number.parseInt(e.target.value))}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>

                    {/* Tiempo límite */}
                    <div>
                        <label htmlFor="timeLimit" className="block text-sm font-medium leading-6 text-gray-900">
                            {getSafeKeyFromStorage('Time Limit')} (minutos)
                        </label>
                        <div className="mt-2">
                            <input
                                type="number"
                                name="timeLimit"
                                id="timeLimit"
                                min="1"
                                value={timeLimit}
                                onChange={(e) => setTimeLimit(Number.parseInt(e.target.value))}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>

                    {/* Puntaje mínimo */}
                    <div>
                        <label htmlFor="passingScore" className="block text-sm font-medium leading-6 text-gray-900">
                            {getSafeKeyFromStorage('Passing Score')} (%)
                        </label>
                        <div className="mt-2">
                            <input
                                type="number"
                                name="passingScore"
                                id="passingScore"
                                min="1"
                                max="100"
                                value={passingScore}
                                onChange={(e) => setPassingScore(Number.parseInt(e.target.value))}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>

                    {/* Etiquetas */}
                    <div>
                        <label htmlFor="tags" className="block text-sm font-medium leading-6 text-gray-900">
                            {getSafeKeyFromStorage('Tags')} (separados por coma)
                        </label>
                        <div className="mt-2">
                            <input
                                type="text"
                                name="tags"
                                id="tags"
                                value={tags.join(', ')}
                                onChange={(e) => setTags(e.target.value.split(',').map(tag => tag.trim()))}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                placeholder="Etiquetas"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Sección de preguntas */}
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">{getSafeKeyFromStorage('Questions')} *</h2>
                    <button
                        type="button"
                        onClick={handleAddQuestion}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                        {getSafeKeyFromStorage('Add Question')}
                    </button>
                </div>

                {questions.length === 0 && (
                    <p className="text-gray-500 italic">{getSafeKeyFromStorage('No questions added yet')}</p>
                )}

                {questions.map((question, qIndex) => (
                    <div key={qIndex+1} className="border rounded-lg p-4 mb-4 bg-gray-50">
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="text-lg font-medium">Pregunta {qIndex + 1}</h3>
                            <button
                                type="button"
                                onClick={() => handleRemoveQuestion(qIndex)}
                                className="text-red-500 hover:text-red-700"
                            >
                                {getSafeKeyFromStorage('Remove')}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {/* Texto de la pregunta */}
                            <div className="md:col-span-2">
                                <label htmlFor={`question-${qIndex}-text`} className="block text-sm font-medium text-gray-700">
                                    {getSafeKeyFromStorage('Question Text')} *
                                </label>
                                <input
                                    type="text"
                                    id={`question-${qIndex}-text`}
                                    value={question.text}
                                    onChange={(e) => handleUpdateQuestion(qIndex, 'text', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    required
                                />
                            </div>

                            {/* Tipo de pregunta */}
                            <div>
                                <label htmlFor={`question-${qIndex}-type`} className="block text-sm font-medium text-gray-700">
                                    {getSafeKeyFromStorage('Question Type')}
                                </label>
                                <select
                                    id={`question-${qIndex}-type`}
                                    value={question.type}
                                    onChange={(e) => handleUpdateQuestion(qIndex, 'type', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                >
                                    <option value={QuestionType.SINGLE_CHOICE}>{getSafeKeyFromStorage('Single Choice')}</option>
                                    <option value={QuestionType.MULTIPLE_CHOICE}>{getSafeKeyFromStorage('Multiple Choice')}</option>
                                    <option value={QuestionType.TRUE_FALSE}>{getSafeKeyFromStorage('True/False')}</option>
                                    <option value={QuestionType.TEXT}>{getSafeKeyFromStorage('Text')}</option>
                                    <option value={QuestionType.MATCHING}>{getSafeKeyFromStorage('Matching')}</option>
                                </select>
                            </div>

                            {/* Puntos */}
                            <div>
                                <label htmlFor={`question-${qIndex}-points`} className="block text-sm font-medium text-gray-700">
                                    {getSafeKeyFromStorage('Points')}
                                </label>
                                <input
                                    type="number"
                                    id={`question-${qIndex}-points`}
                                    value={question.points}
                                    onChange={(e) => handleUpdateQuestion(qIndex, 'points', Number.parseInt(e.target.value))}
                                    min="1"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>

                            {/* Requerido */}
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={`question-${qIndex}-required`}
                                    checked={question.required}
                                    onChange={(e) => handleUpdateQuestion(qIndex, 'required', e.target.checked)}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor={`question-${qIndex}-required`} className="ml-2 block text-sm text-gray-700">
                                    {getSafeKeyFromStorage('Required')}
                                </label>
                            </div>

                            {/* Explicación */}
                            <div className="md:col-span-2">
                                <label htmlFor={`question-${qIndex}-explanation`} className="block text-sm font-medium text-gray-700">
                                    {getSafeKeyFromStorage('Explanation')}
                                </label>
                                <textarea
                                    id={`question-${qIndex}-explanation`}
                                    value={question.explanation || ''}
                                    onChange={(e) => handleUpdateQuestion(qIndex, 'explanation', e.target.value)}
                                    rows={2}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        {/* Opciones (solo para preguntas de opción múltiple, única o verdadero/falso) */}
                        {(question.type === QuestionType.SINGLE_CHOICE ||
                            question.type === QuestionType.MULTIPLE_CHOICE ||
                            question.type === QuestionType.TRUE_FALSE) && (
                                <div className="mt-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="text-md font-medium">{getSafeKeyFromStorage('Options')}</h4>
                                        <button
                                            type="button"
                                            onClick={() => handleAddOption(qIndex)}
                                            className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors text-sm"
                                        >
                                            {getSafeKeyFromStorage('Add Option')}
                                        </button>
                                    </div>

                                    {(!question.options || question.options.length === 0) && (
                                        <p className="text-gray-500 italic text-sm">{getSafeKeyFromStorage('No options added yet')}</p>
                                    )}

                                    {question.options && question.options.map((option, oIndex) => (
                                        <div key={oIndex} className="flex items-center space-x-3 mb-2">
                                            <input
                                                type={question.type === QuestionType.MULTIPLE_CHOICE ? 'checkbox' : 'radio'}
                                                name={`question-${qIndex}-correct`}
                                                checked={option.isCorrect}
                                                onChange={(e) => handleUpdateOption(qIndex, oIndex, 'isCorrect', e.target.checked)}
                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                            />
                                            <input
                                                type="text"
                                                value={option.text}
                                                onChange={(e) => handleUpdateOption(qIndex, oIndex, 'text', e.target.value)}
                                                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                placeholder="Texto de la opción"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveOption(qIndex, oIndex)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                {getSafeKeyFromStorage('Remove')}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                    </div>
                ))}
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end space-x-4">
                <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors"
                >
                    {getSafeKeyFromStorage('Cancel')}
                </button>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={!isFormValid}
                    className={`px-4 py-2 rounded transition-colors ${isFormValid ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                >
                    {getSafeKeyFromStorage('Save')}
                </button>
            </div>
        </div>
    );
};

export default PreTestComponent;
