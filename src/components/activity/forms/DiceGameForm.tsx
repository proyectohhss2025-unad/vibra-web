import React from 'react';

interface DiceQuestion {
    id: string;
    questionText: string;
    diceValue: number;
    type: 'open' | 'multiple';
    options?: string[];
    correctAnswer: string;
}

interface DiceGameFormProps {
    config: { questions: DiceQuestion[] };
    onChange: (config: any) => void;
}

const DiceGameForm: React.FC<DiceGameFormProps> = ({ config, onChange }) => {
    const questions = config.questions || [];
    const addQuestion = () => {
        onChange({
            ...config,
            questions: [...questions, { id: `q${Date.now()}`, questionText: '', diceValue: 1, type: 'open', options: [], correctAnswer: '' }],
        });
    };
    const removeQuestion = (i: number) => {
        onChange({ ...config, questions: questions.filter((_, idx) => idx !== i) });
    };
    const updateQuestion = (i: number, field: string, value: any) => {
        const updated = [...questions];
        updated[i] = { ...updated[i], [field]: value };
        onChange({ ...config, questions: updated });
    };
    const addOption = (qi: number) => {
        const updated = [...questions];
        updated[qi] = { ...updated[qi], options: [...(updated[qi].options || []), ''] };
        onChange({ ...config, questions: updated });
    };
    const removeOption = (qi: number, oi: number) => {
        const updated = [...questions];
        updated[qi] = { ...updated[qi], options: (updated[qi].options || []).filter((_, idx) => idx !== oi) };
        onChange({ ...config, questions: updated });
    };
    const updateOption = (qi: number, oi: number, value: string) => {
        const updated = [...questions];
        const opts = [...(updated[qi].options || [])];
        opts[oi] = value;
        updated[qi] = { ...updated[qi], options: opts };
        onChange({ ...config, questions: updated });
    };

    return (
        <div className="space-y-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">Preguntas</label>
            {questions.map((q, i) => (
                <div key={q.id} className="border border-gray-200 rounded p-2 mb-2 bg-white">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-gray-500">#{i + 1}</span>
                        <button type="button" onClick={() => removeQuestion(i)}
                            className="text-red-400 hover:text-red-600 text-sm">✕</button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                        <div className="col-span-2">
                            <input type="text" value={q.questionText}
                                onChange={e => updateQuestion(i, 'questionText', e.target.value)}
                                className="w-full rounded-md border-0 py-1 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600"
                                placeholder="Texto de la pregunta" />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500">Valor dado</label>
                            <select value={q.diceValue} onChange={e => updateQuestion(i, 'diceValue', Number(e.target.value))}
                                className="w-full rounded-md border-0 py-1 text-sm shadow-sm ring-1 ring-inset ring-gray-300">
                                {[1, 2, 3, 4, 5, 6].map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500">Tipo</label>
                            <select value={q.type} onChange={e => updateQuestion(i, 'type', e.target.value)}
                                className="w-full rounded-md border-0 py-1 text-sm shadow-sm ring-1 ring-inset ring-gray-300">
                                <option value="open">Abierta</option>
                                <option value="multiple">Opción múltiple</option>
                            </select>
                        </div>
                    </div>
                    {q.type === 'multiple' && (
                        <div className="mb-2">
                            <label className="block text-xs text-gray-500 mb-1">Opciones</label>
                            {(q.options || []).map((opt, oi) => (
                                <div key={oi} className="flex items-center gap-1 mb-1">
                                    <input type="text" value={opt}
                                        onChange={e => updateOption(i, oi, e.target.value)}
                                        className="flex-1 rounded-md border-0 py-1 text-sm shadow-sm ring-1 ring-inset ring-gray-300"
                                        placeholder={`Opción ${oi + 1}`} />
                                    <button type="button" onClick={() => removeOption(i, oi)}
                                        className="text-red-400 hover:text-red-600 text-xs">✕</button>
                                </div>
                            ))}
                            <button type="button" onClick={() => addOption(i)}
                                className="text-xs text-blue-600 hover:text-blue-500">+ Opción</button>
                        </div>
                    )}
                    <div>
                        <label className="block text-xs text-gray-500">Respuesta correcta</label>
                        {q.type === 'multiple' ? (
                            <select value={q.correctAnswer} onChange={e => updateQuestion(i, 'correctAnswer', e.target.value)}
                                className="w-full rounded-md border-0 py-1 text-sm shadow-sm ring-1 ring-inset ring-gray-300">
                                <option value="">Seleccionar...</option>
                                {(q.options || []).filter(o => o.trim()).map((opt, oi) => (
                                    <option key={oi} value={opt}>{opt}</option>
                                ))}
                            </select>
                        ) : (
                            <input type="text" value={q.correctAnswer}
                                onChange={e => updateQuestion(i, 'correctAnswer', e.target.value)}
                                className="w-full rounded-md border-0 py-1 text-sm shadow-sm ring-1 ring-inset ring-gray-300"
                                placeholder="Respuesta esperada" />
                        )}
                    </div>
                </div>
            ))}
            <button type="button" onClick={addQuestion}
                className="text-xs text-blue-600 hover:text-blue-500">+ Agregar pregunta</button>
        </div>
    );
};

export default DiceGameForm;
