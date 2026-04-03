import PreTestDataPage from '@/components/preTest/data-page';
import { NextPage } from 'next';
import Head from 'next/head';

/**
 * Página para mostrar la tabla de preTests
 */
const PreTestTablePage: NextPage = () => {
    return (
        <>
            <Head>
                <title>Pre-Tests</title>
                <meta name="description" content="Gestión de Pre-Tests" />
            </Head>
            <PreTestDataPage />
        </>
    );
};

export default PreTestTablePage;