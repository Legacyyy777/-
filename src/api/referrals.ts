// API endpoints для работы с реферальной системой

import { post, handleApiError } from './client';
import { getInitData } from './auth';
import type { ReferralInfo } from '@/types/api';

/**
 * Получение информации о реферальной программе
 * @param page - номер страницы для списка рефералов
 * @param limit - количество рефералов на странице
 * @returns информация о рефералах
 */
export const getReferralInfo = async (
    page: number = 1,
    limit: number = 20
): Promise<ReferralInfo> => {
    try {
        const initData = getInitData();
        if (!initData) {
            throw new Error('Отсутствуют данные авторизации');
        }

        return await post('/miniapp/referral', {
            initData,
            page,
            limit,
        });
    } catch (error: any) {
        // Если API недоступен, возвращаем заглушку
        if (error?.response?.status === 404 || error?.message?.includes('Not Found')) {
            return {
                referral_link: '',
                total_referrals: 0,
                total_earned_kopeks: 0,
                referrals: {
                    total: 0,
                    page: 1,
                    limit: 20,
                    items: []
                }
            };
        }
        throw new Error(handleApiError(error));
    }
};

/**
 * Получение списка рефералов
 * @param page - номер страницы
 * @param limit - количество на странице
 * @returns список рефералов
 */
export const getReferrals = async (
    page: number = 1,
    limit: number = 20
): Promise<any> => {
    try {
        const initData = getInitData();
        if (!initData) {
            throw new Error('Отсутствуют данные авторизации');
        }

        return await post('/miniapp/referral/list', {
            initData,
            page,
            limit,
        });
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Получение статистики по рефералам
 * @returns статистика
 */
export const getReferralStats = async (): Promise<any> => {
    try {
        const initData = getInitData();
        if (!initData) {
            throw new Error('Отсутствуют данные авторизации');
        }

        return await post('/miniapp/referral/stats', {
            initData,
        });
    } catch (error: any) {
        // Если API недоступен, возвращаем заглушку
        if (error?.response?.status === 404 || error?.message?.includes('Not Found')) {
            return {
                total_referrals: 0,
                active_referrals: 0,
                total_earned_kopeks: 0,
                conversion_rate: 0
            };
        }
        throw new Error(handleApiError(error));
    }
};

/**
 * Получение истории заработка с рефералов
 * @param page - номер страницы
 * @param limit - количество на странице
 * @returns история заработка
 */
export const getReferralEarnings = async (
    page: number = 1,
    limit: number = 20
): Promise<any> => {
    try {
        const initData = getInitData();
        if (!initData) {
            throw new Error('Отсутствуют данные авторизации');
        }

        return await post('/miniapp/referral/earnings', {
            initData,
            page,
            limit,
        });
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

