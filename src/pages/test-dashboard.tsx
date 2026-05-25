import TestListPage from '@/components/test/test-list-page';
import { NextPage } from 'next';
import Head from 'next/head';

/**
 * Página principal para la gestión de Tests
 */
const TestList: NextPage = () => {
  return (
    <>
      <Head>
        <title>Gestión de Tests</title>
        <meta name="description" content="Dashboard para la gestión de Tests" />
      </Head>
      <TestListPage />
    </>
  );
};

export default TestList;
