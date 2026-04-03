import { config } from '@/config/config';
import axios from 'axios';
import logger from '../config/logger-dev';

const environment = process.env.NODE_ENV || 'development';

const configAPI = {
    baseURL: config[environment].apiDashboard,
};

function mapTranslations(texts, translations) {
    console.log("texts:", texts.length);
    console.log("translations:", translations.length);
    /*if (!texts || !translations || !Array.isArray(texts) || !Array.isArray(translations) || texts.length !== translations.length) {
        throw new Error('Los parámetros "texts" y "translations" deben ser arreglos válidos con la misma longitud.');
    }*/

    return texts.map((text, index) => ({
        originalText: text,
        translatedText: translations[index]
    }));
}

export const getTranslate = async (text: string, targetLanguage: string) => {
    try {
        const response = await axios.post(`${configAPI.baseURL}/api/translates/translate`, {
            text,
            targetLanguage
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        console.log(response.data.translation);
        return response.data.translation;
    } catch (error) {
        logger.error('Login in translate process:', error);
        return null;
    }
}

export const getTranslateSeveralTexts = async (texts: string[], targetLanguage: string) => {
    try {
        const translateResponse = await axios.post(`${configAPI.baseURL}/api/translates/translate-several`, {
            texts,
            targetLanguage
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        console.log("translateResponse:", translateResponse);
        const translationsArray = Object.values(translateResponse.data);
        const mappedTranslations = mapTranslations(texts, translationsArray);
        console.log("mappedTranslations:", mappedTranslations);
        return mappedTranslations;
    } catch (error) {
        logger.error('Login in translate process:', error);
        return null;
    }
}