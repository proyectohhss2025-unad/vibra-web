'use client'

import { Emotion } from '@/models/emotion.entity';
import { getSafeKeyFromStorage } from '@/utils/safe-token-storage';
import { DocumentDuplicateIcon, StarIcon, StopIcon } from '@heroicons/react/outline';
import { CheckCircleIcon, PencilIcon, XCircleIcon } from '@heroicons/react/solid';
import React from 'react';

interface Action {
    name: string;
    color: string;
    handler: (emotion: Emotion) => void;
}

interface TableProps {
    data: Emotion[];
    children: React.ReactNode;
    actions: Action[];
}

const Table: React.FC<TableProps> = ({ data, actions, children }) => {
    return (
        <div id="emotion" className="relative overflow-x-auto mt-0" style={{ marginTop: '-20px' }}>
            <table className="rounded-lg min-w-full text-left text-sm">
                <thead className="uppercase tracking-wider border-b-2">
                    <tr>
                        {children}
                        {actions.map((action) => (
                            <th className="text-left px-3 py-1" key={action.name}>{getSafeKeyFromStorage(action.name)}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((emotion) => (
                        <tr key={emotion._id} className={`mt-0 mb-0 hover:bg-blue-100 hover:rounded border-b`} >
                            <td className="text-sm px-2 py-1.5">{emotion.name}</td>
                            <td className="text-sm px-2 py-1.5">{emotion.description}</td>
                            <td className="text-sm px-2 py-1.5">{emotion.orientationNote}</td>
                            <td className="text-sm px-2 py-1.5">{emotion.icono}</td>
                            <td className="text-sm px-2 py-1.5">{emotion.percentNote}%</td>
                            <td className="text-sm px-2 py-1.5">
                                {emotion.isActive ? (
                                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                ) : (
                                    <XCircleIcon className="h-5 w-5 text-red-500" />
                                )}
                            </td>
                            <td className="text-sm px-2 py-1.5">
                                <div className="flex space-x-2 justify-end">
                                    {actions.map((action) => (
                                        <td className="text-center px-2 py-1.5 text-sm" key={action.name}>
                                            <button className={action.name === 'Status' && emotion.isActive ? 'action-red inline-block px-1 py-1 text-white rounded-md'
                                                : action.name === 'Status' && !emotion.isActive ? 'action-red inline-block px-1 py-1 text-white rounded-md'
                                                    : 'action-blue inline-block px-1 py-1 text-white rounded-md'}
                                                onClick={() => action.handler(emotion)}>
                                                {action.name === 'CopyID' && <DocumentDuplicateIcon name="copyID" className="h-5 w-5 text-indigo-600" color={action.color} data-tooltip-id="my-tooltip-p" data-tooltip-content="Click to copy ID" />}
                                                {action.name === 'Edit' && <PencilIcon name="success" className="h-5 w-5 text-blue-600" color={action.color} />}
                                                {action.name === 'Status' && emotion.isActive && <StopIcon name="successInactive" className="h-5 w-5 text-red-600 hover:text-red-700" />}
                                                {action.name === 'Status' && !emotion.isActive && <StarIcon name="successActive" className="h-5 w-5 text-green-600 hover:text-green-700" />}
                                            </button>
                                        </td>
                                    ))}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Table;