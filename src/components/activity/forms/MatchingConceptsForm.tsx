import React from 'react';

interface ConceptPair {
    id: string;
    concept: string;
    match: string;
}

interface MatchingConceptsFormProps {
    config: { conceptPairs: ConceptPair[]; timeLimit: number };
    onChange: (config: any) => void;
}

const MatchingConceptsForm: React.FC<MatchingConceptsFormProps> = ({ config, onChange }) => {
    const pairs = config.conceptPairs || [];
    const addPair = () => {
        onChange({
            ...config,
            conceptPairs: [...pairs, { id: `p${Date.now()}`, concept: '', match: '' }],
        });
    };
    const removePair = (i: number) => {
        onChange({ ...config, conceptPairs: pairs.filter((_, idx) => idx !== i) });
    };
    const updatePair = (i: number, field: 'concept' | 'match', value: string) => {
        const updated = [...pairs];
        updated[i] = { ...updated[i], [field]: value };
        onChange({ ...config, conceptPairs: updated });
    };

    return (
        <div className="space-y-3">
            <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Pares concepto → definición</label>
                {pairs.map((pair, i) => (
                    <div key={pair.id} className="flex items-center gap-1 mb-1">
                        <input type="text" value={pair.concept}
                            onChange={e => updatePair(i, 'concept', e.target.value)}
                            className="flex-1 rounded-md border-0 py-1 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600"
                            placeholder="Concepto" />
                        <span className="text-gray-400 text-xs">→</span>
                        <input type="text" value={pair.match}
                            onChange={e => updatePair(i, 'match', e.target.value)}
                            className="flex-1 rounded-md border-0 py-1 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600"
                            placeholder="Definición" />
                        <button type="button" onClick={() => removePair(i)}
                            className="text-red-400 hover:text-red-600 text-sm">✕</button>
                    </div>
                ))}
                <button type="button" onClick={addPair}
                    className="text-xs text-blue-600 hover:text-blue-500">+ Agregar par</button>
            </div>
            <div className="w-1/3">
                <label className="block text-xs font-medium text-gray-600 mb-1">Tiempo límite (seg)</label>
                <input type="number" min={30} value={config.timeLimit ?? 180}
                    onChange={e => onChange({ ...config, timeLimit: Number(e.target.value) })}
                    className="w-full rounded-md border-0 py-1 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600" />
            </div>
        </div>
    );
};

export default MatchingConceptsForm;
