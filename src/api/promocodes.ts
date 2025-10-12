// API endpoints для работы с промокодами

import { post, handleApiError } from './client';
import { getInitData } from './auth';
import type { PromoCodeActivationResponse } from '@/types/api';

/**
 * Активация промокода
 * @param code - промокод
 * @returns результат активации
 */
export const activatePromoCode = async (
    code: string
): Promise<PromoCodeActivationResponse> => {
    try {
        const initData = getInitData();
        if (!initData) {
            throw new Error('Отсутствуют данные авторизации');
        }

        return await post('/miniapp/promocodes/activate', {
            initData,
            code: code.trim().toUpperCase(),
        });
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Получение активных промо-предложений
 * @returns список промо-предложений
 */
export const getPromoOffers = async (): Promise<any> => {
    try {
        const initData = getInitData();
        if (!initData) {
            throw new Error('Отсутствуют данные авторизации');
        }

        return await post('/miniapp/promo-offers', { initData });
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Активация (claim) промо-предложения
 * @param offerId - ID промо-предложения
 * @returns результат активации
 */
export const claimPromoOffer = async (
    offerId: number
): Promise<{
    success: boolean;
    code?: string;
}> => {
    try {
        const initData = getInitData();
        if (!initData) {
            throw new Error('Отсутствуют данные авторизации');
        }

        return await post(`/miniapp/promo-offers/${offerId}/claim`, {
            initData,
        });
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

