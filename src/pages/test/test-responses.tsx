import TestResponsesPage from '@/components/test/test-responses-page';
import { NextPage } from 'next';
import Head from 'next/head';

/**
 * Página para ver respuestas de un Test
 */
const TestResponses: NextPage = () => {
  return (
    <>
      <Head>
        <title>Respuestas de Test</title>
        <meta name="description" content="Visualización de respuestas de usuarios para un Test" />
      </Head>
      <TestResponsesPage />
    </>
  );
};

export default TestResponses;
