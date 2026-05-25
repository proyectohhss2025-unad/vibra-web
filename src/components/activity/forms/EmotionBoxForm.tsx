import React from 'react';

interface EmotionEntry {
    id: string;
    name: string;
    type: 'sana' | 'gestionar';
}

interface EmotionBoxFormProps {
    config: { emotions: EmotionEntry[]; timeLimit: number; showInstructions: boolean };
    onChange: (config: any) => void;
}

const EmotionBoxForm: React.FC<EmotionBoxFormProps> = ({ config, onChange }) => {
    const emotions = config.emotions || [];
    const addEmotion = () => {
        onChange({
            ...config,
            emotions: [...emotions, { id: `e${Date.now()}`, name: '', type: 'sana' }],
        });
    };
    const removeEmotion = (i: number) => {
        onChange({ ...config, emotions: emotions.filter((_, idx) => idx !== i) });
    };
    const updateEmotion = (i: number, field: string, value: string) => {
        const updated = [...emotions];
        updated[i] = { ...updated[i], [field]: value };
        onChange({ ...config, emotions: updated });
    };

    return (
        <div className="space-y-3">
            <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Emociones</label>
                {emotions.map((em, i) => (
                    <div key={em.id} className="flex items-center gap-1 mb-1">
                        <input type="text" value={em.name}
                            onChange={e => updateEmotion(i, 'name', e.target.value)}
                            className="flex-1 rounded-md border-0 py-1 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600"
                            placeholder="Nombre emoción" />
                        <select value={em.type} onChange={e => updateEmotion(i, 'type', e.target.value)}
                            className="rounded-md border-0 py-1 text-sm shadow-sm ring-1 ring-inset ring-gray-300">
                            <option value="sana">Sana</option>
                            <option value="gestionar">Gestionar</option>
                        </select>
                        <button type="button" onClick={() => removeEmotion(i)}
                            className="text-red-400 hover:text-red-600 text-sm">✕</button>
                    </div>
                ))}
                <button type="button" onClick={addEmotion}
                    className="text-xs text-blue-600 hover:text-blue-500">+ Agregar emoción</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Tiempo límite (seg)</label>
                    <input type="number" min={30} value={config.timeLimit ?? 120}
                        onChange={e => onChange({ ...config, timeLimit: Number(e.target.value) })}
                        className="w-full rounded-md border-0 py-1 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600" />
                </div>
                <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input type="checkbox" checked={config.showInstructions ?? true}
                            onChange={e => onChange({ ...config, showInstructions: e.target.checked })}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600" />
                        Mostrar instrucciones
                    </label>
                </div>
            </div>
        </div>
    );
};

export default EmotionBoxForm;
