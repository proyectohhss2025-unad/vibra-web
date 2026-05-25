import React from 'react';

interface WordSearchFormProps {
    config: { words: string[]; gridSize: number; timeLimit: number };
    onChange: (config: any) => void;
}

const WordSearchForm: React.FC<WordSearchFormProps> = ({ config, onChange }) => {
    const addWord = () => {
        const newWords = [...(config.words || []), ''];
        onChange({ ...config, words: newWords });
    };
    const removeWord = (i: number) => {
        onChange({ ...config, words: (config.words || []).filter((_, idx) => idx !== i) });
    };
    const updateWord = (i: number, value: string) => {
        const updated = [...(config.words || [])];
        updated[i] = value;
        onChange({ ...config, words: updated });
    };

    return (
        <div className="space-y-3">
            <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Palabras</label>
                {(config.words || []).map((word, i) => (
                    <div key={i} className="flex items-center gap-1 mb-1">
                        <input type="text" value={word}
                            onChange={e => updateWord(i, e.target.value.toUpperCase())}
                            className="flex-1 rounded-md border-0 py-1 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600"
                            placeholder="Palabra" />
                        <button type="button" onClick={() => removeWord(i)}
                            className="text-red-400 hover:text-red-600 text-sm">✕</button>
                    </div>
                ))}
                <button type="button" onClick={addWord}
                    className="text-xs text-blue-600 hover:text-blue-500">+ Agregar palabra</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Tamaño grilla</label>
                    <input type="number" min={5} max={15} value={config.gridSize ?? 9}
                        onChange={e => onChange({ ...config, gridSize: Number(e.target.value) })}
                        className="w-full rounded-md border-0 py-1 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Tiempo límite (seg)</label>
                    <input type="number" min={30} value={config.timeLimit ?? 300}
                        onChange={e => onChange({ ...config, timeLimit: Number(e.target.value) })}
                        className="w-full rounded-md border-0 py-1 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600" />
                </div>
            </div>
        </div>
    );
};

export default WordSearchForm;
