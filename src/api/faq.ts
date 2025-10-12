// API endpoints для FAQ и юридических документов

import { post, handleApiError } from './client';
import { getInitData } from './auth';
import type { FAQ, LegalDocuments } from '@/types/api';

/**
 * Получение FAQ
 * @param language - код языка (ru, en)
 * @returns FAQ
 */
export const getFAQ = async (language: string = 'ru'): Promise<FAQ> => {
    try {
        const initData = getInitData();
        if (!initData) {
            throw new Error('Отсутствуют данные авторизации');
        }

        return await post('/miniapp/faq', {
            initData,
            language,
        });
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Получение юридических документов
 * @param language - код языка (ru, en)
 * @returns юридические документы
 */
export const getLegalDocuments = async (
    language: string = 'ru'
): Promise<LegalDocuments> => {
    try {
        const initData = getInitData();
        if (!initData) {
            throw new Error('Отсутствуют данные авторизации');
        }

        return await post('/miniapp/legal', {
            initData,
            language,
        });
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Получение публичной оферты
 * @param language - код языка
 * @returns публичная оферта
 */
export const getPublicOffer = async (language: string = 'ru'): Promise<any> => {
    try {
        const initData = getInitData();
        if (!initData) {
            throw new Error('Отсутствуют данные авторизации');
        }

        return await post('/miniapp/legal/public-offer', {
            initData,
            language,
        });
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Получение правил сервиса
 * @param language - код языка
 * @returns правила сервиса
 */
export const getServiceRules = async (language: string = 'ru'): Promise<any> => {
    try {
        const initData = getInitData();
        if (!initData) {
            throw new Error('Отсутствуют данные авторизации');
        }

        return await post('/miniapp/legal/service-rules', {
            initData,
            language,
        });
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Получение политики конфиденциальности
 * @param language - код языка
 * @returns политика конфиденциальности
 */
export const getPrivacyPolicy = async (language: string = 'ru'): Promise<any> => {
    try {
        const initData = getInitData();
        if (!initData) {
            throw new Error('Отсутствуют данные авторизации');
        }

        return await post('/miniapp/legal/privacy-policy', {
            initData,
            language,
        });
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

