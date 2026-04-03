import PreTestComponent from '@/components/preTest/preTest';
import { NextPage } from 'next';
import Head from 'next/head';

/**
 * Página para crear o editar un preTest
 */
const PreTestPage: NextPage = () => {
    return (
        <>
            <Head>
                <title>Crear/Editar Pre-Test</title>
                <meta name="description" content="Formulario para crear o editar un Pre-Test" />
            </Head>
            <PreTestComponent />
        </>
    );
};

export default PreTestPage;