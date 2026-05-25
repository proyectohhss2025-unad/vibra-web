import TestFormPage from '@/components/test/test-form-page';
import { NextPage } from 'next';
import Head from 'next/head';

/**
 * Página para crear o editar un Test
 */
const TestForm: NextPage = () => {
  return (
    <>
      <Head>
        <title>Crear/Editar Test</title>
        <meta name="description" content="Formulario para crear o editar un Test" />
      </Head>
      <TestFormPage />
    </>
  );
};

export default TestForm;
