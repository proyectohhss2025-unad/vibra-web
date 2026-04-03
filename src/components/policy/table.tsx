import { Policy } from '@/models/policy.entity';
import { CheckCircleIcon, DocumentDuplicateIcon, PencilIcon, StarIcon, StopIcon } from '@heroicons/react/solid';
import React from 'react';
import { getSafeKeyFromStorage } from '@/utils/safe-token-storage';

interface Action {
    name: string;
    color: string;
    handler: (policy: Policy) => void;
}

interface TableProps {
    data: Policy[];
    actions: Action[];
    children?: React.ReactNode;
}

const Table: React.FC<TableProps> = ({ data, actions, children }) => {
    return (
        <div id='policy' className="relative overflow-x-auto mt-0" style={{ marginTop: '-20px' }}>
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
                    {data.map((record) => (
                        <tr className="mt-0 mb-0 hover:bg-blue-100 hover:rounded border-b" key={record._id}>
                            <td className="text-sm px-2 py-1.5">{record.name}</td>
                            <td className="text-sm px-2 py-1.5">{record.description}</td>
                            <td className="text-sm px-2 py-1.5">{record.category ?? '-'}</td>
                            <td className="text-sm px-2 py-1.5">{record.isActive ? 'Sí' : 'No'}</td>
                            {actions.map((action) => (
                                <td className="text-center px-2 py-1.5 text-sm" key={action.name}>
                                    <button
                                        className={action.name === 'Status' && record.isActive ? 'action-red inline-block px-1 py-1 text-white rounded-md'
                                            : action.name === 'Status' && !record.isActive ? 'action-red inline-block px-1 py-1 text-white rounded-md'
                                                : 'action-blue inline-block px-1 py-1 text-white rounded-md'}
                                        onClick={() => action.handler(record)}>
                                        {action.name === 'CopyID' && <DocumentDuplicateIcon name="copyID" className="h-5 w-5 text-indigo-600" color={action.color} data-tooltip-id="my-tooltip-p" data-tooltip-content="Click to copy ID" />}
                                        {action.name === 'Accept' && <CheckCircleIcon name="accept" className="h-5 w-5 text-green-600" color={action.color} />}
                                        {action.name === 'Edit' && <PencilIcon name="success" className="h-5 w-5 text-blue-600" color={action.color} />}
                                        {action.name === 'Status' && record.isActive && <StopIcon name="successInactive" className="h-5 w-5 text-red-600 hover:text-red-700" />}
                                        {action.name === 'Status' && !record.isActive && <StarIcon name="successActive" className="h-5 w-5 text-green-600 hover:text-green-700" />}
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
