import FeedbackDataPage from '@/components/feedback/feedback-data-page';
import { NextPage } from 'next';
import Head from 'next/head';

/**
 * Página principal para la gestión de Feedback
 */
const FeedbackTablePage: NextPage = () => {
    return (
        <>
            <Head>
                <title>Gestión de Feedback</title>
                <meta name="description" content="Dashboard para la gestión de Feedback y conversión a ideas" />
            </Head>
            <FeedbackDataPage />
        </>
    );
};

export default FeedbackTablePage;
