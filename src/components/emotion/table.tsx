import { Emotion } from '@/models/emotion.entity';
import { getSafeKeyFromStorage } from '@/utils/safe-token-storage';
import { DocumentDuplicateIcon, StarIcon, StopIcon } from '@heroicons/react/outline';
import { CheckCircleIcon, PencilIcon, XCircleIcon } from '@heroicons/react/solid';
import React from 'react';
import './emotion.css';

interface Action {
    name: string;
    color: string;
    handler: (emotion: Emotion) => void;
}

interface TableProps {
    data: Emotion[];
    actions: Action[];
    children?: React.ReactNode;
}

const Table: React.FC<TableProps> = ({ data, actions, children }) => {
    return (
        <div id="emotion" className="relative overflow-x-auto mt-0" style={{ marginTop: '-20px' }}>
            <table className="rounded-lg min-w-full text-left text-sm">
                <thead className="uppercase tracking-wider border-b-2">
                    <tr>
                        <th className="text-left px-3 py-3 w-36">{children?.[0]}</th>
                        <th className="text-left px-3 py-3 w-72">{children?.[1]}</th>
                        <th className="text-left px-3 py-3 w-64">{children?.[2]}</th>
                        <th className="text-left px-3 py-3 w-14">{children?.[3]}</th>
                        <th className="text-left px-3 py-3 w-20">{children?.[4]}</th>
                        <th className="text-left px-3 py-3 w-16">{children?.[5]}</th>
                        {actions.map((action) => (
                            <th className="text-center px-3 py-3 w-12" key={action.name}>
                                {getSafeKeyFromStorage(action.name)}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((record) => (
                        <tr key={record._id} className="mt-0 mb-0 hover:bg-blue-100 border-b">
                            <td className="text-sm px-2 py-1.5 font-medium">{record.name}</td>
                            <td className="text-sm px-2 py-1.5 truncate max-w-[18rem]">{record.description}</td>
                            <td className="text-sm px-2 py-1.5 truncate max-w-[16rem] text-gray-500">{record.orientationNote}</td>
                            <td className="text-sm px-2 py-1.5 text-center text-xl">{record.icono}</td>
                            <td className="text-sm px-2 py-1.5 text-center">{record.percentNote}%</td>
                            <td className="text-sm px-2 py-1.5 text-center">
                                {record.isActive
                                    ? <CheckCircleIcon className="h-5 w-5 text-green-500 mx-auto" />
                                    : <XCircleIcon className="h-5 w-5 text-red-500 mx-auto" />}
                            </td>
                            {actions.map((action) => (
                                <td className="text-center px-1 py-1.5 text-sm" key={action.name}>
                                    <button
                                        style={{ margin: '0px auto' }}
                                        className={action.name === 'Status' ? 'action-red inline-block px-1 py-1.5 rounded-md hover:text-red-400'
                                            : 'action-blue inline-block px-1 py-1.5 text-red-600 hover:text-red-500 rounded-md'}
                                        onClick={() => action.handler(record)}>
                                        {action.name === 'CopyID' && <DocumentDuplicateIcon className="h-5 w-5 text-indigo-600" color={action.color} data-tooltip-id="my-tooltip-p" data-tooltip-content="Click to copy ID" />}
                                        {action.name === 'Edit' && <PencilIcon className="h-5 w-5 text-blue-50 hover:text-blue-700" />}
                                        {action.name === 'Status' && record.isActive && <StopIcon className="h-5 w-5 text-red-50 hover:text-red-700" />}
                                        {action.name === 'Status' && !record.isActive && <StarIcon className="h-5 w-5 text-white" />}
                                    </button>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Table;
