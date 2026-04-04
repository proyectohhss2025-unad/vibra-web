import { Activity } from '@/models/activity.entity';
import { DocumentDuplicateIcon, PencilIcon, StopIcon, StarIcon } from '@heroicons/react/solid';
import React from 'react';
import './activity.css';
import { getSafeKeyFromStorage } from '@/utils/safe-token-storage';

interface Action {
    name: string;
    color: string;
    handler: (activity: Activity) => void;
}

interface TableProps {
    data: Activity[];
    actions: Action[];
    children?: React.ReactNode;
}

const Table: React.FC<TableProps> = ({ data, actions, children }) => {
    return (
        <div id='activity' className="relative overflow-x-auto mt-0" style={{ marginTop: '-20px' }}>
            <table className="rounded-lg min-w-full text-left text-sm">
                <thead className="uppercase tracking-wider border-b-2">
                    <tr>
                        <th className="text-left px-3 py-3 w-48">{children?.[0]}</th>
                        <th className="text-left px-3 py-3 w-64">{children?.[1]}</th>
                        <th className="text-left px-3 py-3 w-28">{children?.[2]}</th>
                        <th className="text-left px-3 py-3 w-20">{children?.[3]}</th>
                        <th className="text-left px-3 py-3 w-20">{children?.[4]}</th>
                        <th className="text-left px-3 py-3 w-20">{children?.[5]}</th>
                        <th className="text-left px-3 py-3 w-24">{children?.[6]}</th>
                        <th className="text-left px-3 py-3 w-16">{children?.[7]}</th>
                        {actions.map((action) => (
                            <th className="text-center px-3 py-3 w-12" key={action.name}>
                                {getSafeKeyFromStorage(action.name)}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((record) => (
                        <tr className="mt-0 mb-0 hover:bg-blue-100 border-b" key={record._id}>
                            <td className="text-sm px-2 py-1.5 truncate max-w-[12rem]">{record.title}</td>
                            <td className="text-sm px-2 py-1.5 truncate max-w-[16rem]">{record.description}</td>
                            <td className="text-sm px-2 py-1.5">{record.emotion?.name || '-'}</td>
                            <td className="text-sm px-2 py-1.5 text-center">{record.difficulty}</td>
                            <td className="text-sm px-2 py-1.5 text-center">{record.resources?.length || 0}</td>
                            <td className="text-sm px-2 py-1.5 text-center">{record.questions?.length || 0}</td>
                            <td className="text-sm px-2 py-1.5">{record.schedule ? `${record.schedule.weekNumber}/${record.schedule.year}` : '-'}</td>
                            <td className="text-sm px-2 py-1.5">{record.isActive ? 'Sí' : 'No'}</td>
                            {actions.map((action) => (
                                <td className="text-center px-1 py-1.5 text-sm" key={action.name}>
                                    <button
                                        style={{ margin: '0px auto' }}
                                        className={action.name === 'Status' ? 'action-red inline-block px-1 py-1.5 rounded-md hover:text-red-400'
                                            : 'action-blue inline-block px-1 py-1.5 text-red-600 hover:text-red-500 rounded-md'}
                                        onClick={() => action.handler(record)}>
                                        {action.name === 'CopyID' && <DocumentDuplicateIcon name="copyID" className="h-5 w-5 text-indigo-600" color={action.color} data-tooltip-id="my-tooltip-p" data-tooltip-content="Click to copy ID" />}
                                        {action.name === 'Edit' && <PencilIcon name="success" className="h-5 w-5 text-blue-50 hover:text-blue-700" />}
                                        {action.name === 'Status' && record.isActive && <StopIcon name="successInactive" className="h-5 w-5 text-red-50 hover:text-red-700" />}
                                        {action.name === 'Status' && !record.isActive && <StarIcon name="successActive" className="h-5 w-5 text-white" />}
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
