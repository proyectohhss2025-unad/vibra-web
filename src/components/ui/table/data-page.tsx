'use client'

import React, { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import Table from './table';
import Pagination from './pagination';
import { AuthContext } from '@/services/auth';
import { getAll } from '@/api/config';

export interface DataRecordActivity {
  _id: string,
  activityNumber: string; 
  dateIssue: Date;
  expirationDate: Date;
  totalValue: number;
  editedAt?: Date;
  editedBy?: string;
  createdAt: Date;
  createdBy: string;
}

const DataPage: React.FC = () => {
  const { token } = useContext(AuthContext);

  const [data, setData] = useState<DataRecordActivity[]>([]);
  const [countData, setCountData] = useState(1);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(4); // Items per page

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const { config, length } = await getAll(currentPage, pageSize);
      setData(config);
      setCountData(length);
    }

    fetchData();
    if (!token) {
      router.push('/layout');
    }

  }, [token, router, currentPage, pageSize]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleEdit = (id: string) => {
    router.push(`/data/${id}/edit`);
  };

  const handleDelete = (id: string) => {
    // Implement logic to delete the record with the given ID
    console.log(`Deleting record with ID: ${id}`);
  };

  return (
    <div className='main-content'>
      <h1>Activities</h1>
      <Table data={data} actions={[{ name: 'Edit', handler: handleEdit }, { name: 'Delete', handler: handleDelete }]}>
        <th>ID</th>
        <th>Activity Number</th>
        <th>Date Issue</th>
        <th>Expiration Date</th>
        <th>Total Value</th>
      </Table>
      <Pagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={countData}
        onPageChange={handlePageChange}
        setPageSize={setPageSize}
      />
    </div>
  );
};

export default DataPage;