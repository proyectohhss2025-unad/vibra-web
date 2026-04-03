'use client'

import { User } from '@/models/user.entity';
import { useTabs } from '@/services/contexts/tabs-context';
import { maskFormatPhoneNumber } from '@/utils/number';
import { PencilIcon, StarIcon, StopIcon } from '@heroicons/react/solid';
import React from 'react';
import UserComponent from './user';
import './user.css';

interface Action {
  name: string;
  color: string;
  handler: (user: User) => void;
}

interface TableProps {
  data: User[];
  actions: Action[];
  children?: React.ReactNode;
}

const Table: React.FC<TableProps> = ({ data, actions, children }) => {
  const { openTab } = useTabs();

  return (
    <div id="users" className="relative overflow-x-auto mt-0" style={{ marginTop: '-20px' }}>
      <table className="rounded-lg min-w-full text-left text-sm">
        <thead className="uppercase tracking-wider border-b-2">
          <tr>
            {children}
            {actions.map((action) => (
              <th className="text-left px-3 py-3" key={action.name}>{action.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((record) => (
            <tr className={`mt-0 mb-0 hover:bg-blue-100 border-b`} key={record._id}>
              <td className="text-sm px-2 py-1.5 ml-4">{record.name}</td>
              <td className="text-sm px-1 py-1.5">{record.email}</td>
              <td className="text-sm px-1 py-1.5">{record.documentType?.name}</td>
              <td className="text-sm px-1 py-1.5">{record.documentNumber}</td>
              <td className="text-sm px-1 py-1.5">{record.address}</td>
              <td className="text-sm px-1 py-1.5">{maskFormatPhoneNumber(record.phoneNumber)}</td>
              <td className="text-sm px-1 py-1.5">{record.username}</td>
              <td className="text-sm px-1 py-1.5">{record.role?.name}</td>
              <td className="text-sm px-1 py-1.5">{record.company?.name}</td>
              {actions.map((action) => (
                <td className="text-center px-1 py-1.5 text-sm" key={action.name}>
                  <button style={{ margin: '0px auto' }} className={action.name === 'Estado' && record.name ? 'action-red inline-block px-1 py-1.5 rounded-md hover:text-red-400'
                    : action.name === 'Estado' && !record.name ? 'action-red inline-block px-1 py-1.5 bg-green-700 text-white rounded-md hover:bg-green-500'  
                      : 'action-blue inline-block px-1 py-1.5 text-red-600 hover:text-red-500 rounded-md'}
                    onClick={() => {
                      if (action.name === 'Editar') {
                        const resolvedUserId = record?._id ? String(record._id) : '';
                        if (!resolvedUserId) {
                          return;
                        }
                        openTab(`/Usuario/${resolvedUserId}`, 'Editar usuario', <UserComponent userId={resolvedUserId} />);
                        return;
                      }
                      action.handler(record);
                    }}>
                    {action.name === 'Editar' && <PencilIcon name="success" className="h-5 w-5 text-blue-50 hover:text-blue-700" />}
                    {action.name === 'Estado' && record.name && <StarIcon name="success" className="h-5 w-5 text-red-50 hover:text-red-700" />}
                    {action.name === 'Estado' && !record.name && <StopIcon name="success" className="h-5 w-5 text-white" />}
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
