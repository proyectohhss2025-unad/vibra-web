import React from 'react';
import { DataRecordActivity } from './data-page';
import './css/table.css'

interface Action {
  name: string;
  handler: (id: string) => void;
}

interface TableProps {
  data: DataRecordActivity[];
  actions: Action[];
  children?: React.ReactNode;
}

const Table: React.FC<TableProps> = ({ data, actions, children }) => {
  return (
    <table className="w-full rounded-lg border">
      <thead>
        <tr className="bg-gray-100 text-gray-600">
          {children}
          {actions.map((action) => (
            <th className="text-left px-4 py-3" key={action.name}>{action.name}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((record) => (
          <tr className="border-bottom" key={record._id}>
            <td className="px-4 py-3">{record.activityNumber}</td>
            <td className="px-4 py-3">{record.createdBy}</td>
            <td className="px-4 py-3">{record.totalValue}</td>
            {/* Add more table cells as needed */}
            {actions.map((action) => (
              <td className="text-center px-4 py-3" key={action.name}>
                <button className={action.name==='Delete'?'action-red inline-block px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600'
                :'action-blue inline-block px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600'} 
                onClick={() => action.handler(record._id)}>{action.name}</button>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;