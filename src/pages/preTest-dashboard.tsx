import PreTestDataPage from '@/components/preTest/data-page';
import { NextPage } from 'next';
import Head from 'next/head';

/**
 * Página principal para la gestión de preTests
 */
const PreTestList: NextPage = () => {
    return (
        <>
            <Head>
                <title>Gestión de Pre-Tests</title>
                <meta name="description" content="Dashboard para la gestión de Pre-Tests" />
            </Head>
            <PreTestDataPage />
        </>
    );
};

export default PreTestList;