import { Company } from '@/models/company.entity';
import { maskFormatPhoneNumber } from '@/utils/number';
import { PencilIcon, ShieldCheckIcon, StarIcon, StopIcon } from '@heroicons/react/solid';
import React from 'react';
import './company.css';

interface Action {
  name: string;
  color: string;
  handler: (company: Company) => void;
}

interface TableProps {
  data: Company[];
  actions: Action[];
  children?: React.ReactNode;
}

const TableCompany: React.FC<TableProps> = ({ data, actions, children }) => {
  return (
    <div id="companys" className="relative overflow-x-auto">
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
          {data.map((record: any) => (
            <tr className={`mt-0 mb-0 hover:bg-blue-100 border-b`} key={record._id}>
              <td className="text-sm px-2 py-1.5 ml-4">{record.name}</td>
              <td className="text-sm px-1 py-1.5">{record.nit}</td>
              <td className="text-sm px-1 py-1.5">{record.address}</td>
              <td className="text-sm px-1 py-1.5">{maskFormatPhoneNumber(`${record.phoneNumber}`)}</td>
              <td className="text-sm px-1 py-1.5">{record.email}</td>
              <td className="text-sm px-1 py-1.5">{record.managerData?.name} {record.managerData?.phoneNumber.length >= 10 ? ' ' + maskFormatPhoneNumber(record.managerData?.phoneNumber) : ''}</td>
              <td className="text-sm px-1 py-1.5">{record.userAdmin?.name}</td>
              <td className="text-sm px-1 py-1.5">{record.isMain ? <ShieldCheckIcon name="success" className="h-5 w-5 text-green-700" />
                : <ShieldCheckIcon name="success" className="h-5 w-5 text-gray-400" />}</td>
              {actions.map((action) => (
                <td className="text-center px-1 py-1.5 text-sm" key={action.name}>
                  <button style={{ margin: '0px auto' }} className={action.name === 'Status' && record.name ? 'action-red inline-block px-1 py-1.5 rounded-md hover:text-red-400'
                    : action.name === 'Status' && !record.name ? 'action-red inline-block px-1 py-1.5 bg-green-700 text-white rounded-md hover:bg-green-500'
                      : 'action-blue inline-block px-1 py-1.5 text-red-600 hover:text-red-500 rounded-md'}
                    onClick={() => action.handler(record)}>
                    {action.name === 'Edit' && <PencilIcon name="success" className="h-5 w-5 text-blue-500 hover:text-blue-700" />}
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

export default TableCompany;