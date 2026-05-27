'use client';

import React, { useEffect, useState } from 'react';
import { Feedback } from '@/models/feedback.entity';
import { getAvailableTags } from '@/api/admin';
import AutocompleteTags from '../ui/autocomplete-tags';

interface FeedbackConvertModalProps {
    feedback: Feedback;
    onConfirm: (payload: {
        title: string;
        description: string;
        priority: string;
        tags: string[];
    }) => void;
    onCancel: () => void;
}

const FeedbackConvertModal: React.FC<FeedbackConvertModalProps> = ({
    feedback,
    onConfirm,
    onCancel,
}) => {
    const [title, setTitle] = useState(feedback.title || '');
    const [description, setDescription] = useState(feedback.description || '');
    const [priority, setPriority] = useState('media');
    const [tagsInput, setTagsInput] = useState('feedback');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [availableTags, setAvailableTags] = useState<string[]>([]);

    // Load available tags for autocomplete
    useEffect(() => {
        getAvailableTags().then(setAvailableTags);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setIsSubmitting(true);
        const tags = tagsInput
            .split(',')
            .map(t => t.trim())
            .filter(t => t.length > 0);

        await onConfirm({
            title: title.trim(),
            description: description.trim(),
            priority,
            tags: tags.length > 0 ? tags : ['feedback'],
        });
        setIsSubmitting(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">✨</span>
                        <h2 className="text-lg font-semibold">Convertir Feedback a Idea</h2>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-1 rounded-md hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                    >
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
                            placeholder="Título de la idea"
                            required
                            minLength={3}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                            placeholder="Descripción detallada de la idea"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        >
                            <option value="alta">🔴 Alta</option>
                            <option value="media">🟡 Media</option>
                            <option value="baja">🟢 Baja</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tags <span className="text-xs text-gray-400">(separados por coma)</span>
                        </label>
                        <AutocompleteTags
                            value={tagsInput}
                            onChange={setTagsInput}
                            suggestions={availableTags}
                            placeholder="feedback, mobile, ux"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !title.trim()}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Guardando...' : '💾 Convertir a Idea'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FeedbackConvertModal;
