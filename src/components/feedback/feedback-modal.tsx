import React, { useState } from 'react';
import { toast } from 'sonner';

interface FeedbackModalProps {
    isOpen: boolean;
    initialType: 'improvement' | 'support';
    onClose: () => void;
    onSubmit: (data: { title: string; description: string; type: string }) => Promise<void>;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, initialType, onClose, onSubmit }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const isImprovement = initialType === 'improvement';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !description.trim()) return;

        setIsSubmitting(true);
        try {
            await onSubmit({ title: title.trim(), description: description.trim(), type: initialType });
            toast.success('¡Gracias por tu sugerencia! Hemos recibido tu feedback correctamente.');
            setTitle('');
            setDescription('');
            onClose();
        } catch (error) {
            toast.error('No pudimos enviar tu feedback. Intenta de nuevo más tarde.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center gap-2 px-6 py-4 border-b">
                    <span className="text-xl">{isImprovement ? '✨' : '💬'}</span>
                    <h2 className="text-lg font-semibold">
                        {isImprovement ? 'Sugerir mejora' : 'Enviar apoyo'}
                    </h2>
                    <button onClick={onClose} className="ml-auto p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            placeholder="¿Qué te gustaría sugerir?"
                            required
                            minLength={3}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                            placeholder="Cuéntanos más detalles..."
                            required
                            minLength={5}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 uppercase tracking-wider">Tipo:</span>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${isImprovement ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>
                            {isImprovement ? '✨ Mejora' : '💬 Apoyo'}
                        </span>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" disabled={isSubmitting || !title.trim() || !description.trim()}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            {isSubmitting ? 'Enviando...' : '💾 Enviar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FeedbackModal;
