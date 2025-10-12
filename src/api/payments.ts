// API endpoints для работы с платежами

import { post, handleApiError } from './client';
import { getInitData } from './auth';
import type {
    PaymentMethod,
    PaymentCreateRequest,
    PaymentCreateResponse,
} from '@/types/api';

/**
 * Получение списка доступных способов оплаты
 * @returns массив способов оплаты
 */
export const getPaymentMethods = async (): Promise<{
    methods: PaymentMethod[];
}> => {
    try {
        const initData = getInitData();
        if (!initData) {
            throw new Error('Отсутствуют данные авторизации');
        }

        return await post('/miniapp/payments/methods', { initData });
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Создание платежа
 * @param method - способ оплаты
 * @param amountKopeks - сумма в копейках
 * @param option - дополнительная опция (для некоторых методов)
 * @returns данные платежа
 */
export const createPayment = async (
    method: string,
    amountKopeks?: number,
    option?: string
): Promise<PaymentCreateResponse> => {
    try {
        const initData = getInitData();
        if (!initData) {
            throw new Error('Отсутствуют данные авторизации');
        }

        const data: PaymentCreateRequest = {
            initData,
            method,
        };

        if (amountKopeks !== undefined) {
            data.amountKopeks = amountKopeks;
        }

        if (option) {
            data.option = option;
        }

        return await post('/miniapp/payments/create', data);
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Проверка статуса платежа
 * @param payments - массив платежей для проверки
 * @returns статусы платежей
 */
export const checkPaymentStatus = async (
    payments: Array<{
        method: string;
        localPaymentId?: number;
        invoiceId?: string;
        paymentId?: string;
        payload?: string;
        amountKopeks?: number;
        startedAt?: string;
    }>
): Promise<{
    results: Array<{
        method: string;
        status: string;
        is_paid: boolean;
        amount_kopeks?: number;
        currency?: string;
        completed_at?: string;
        transaction_id?: number;
        external_id?: string;
        message?: string;
        extra: Record<string, any>;
    }>;
}> => {
    try {
        const initData = getInitData();
        if (!initData) {
            throw new Error('Отсутствуют данные авторизации');
        }

        return await post('/miniapp/payments/status', {
            initData,
            payments,
        });
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Получение истории транзакций
 * @param limit - количество транзакций
 * @param offset - смещение
 * @returns список транзакций
 */
export const getTransactions = async (
    limit: number = 50,
    offset: number = 0
): Promise<any> => {
    try {
        const initData = getInitData();
        if (!initData) {
            throw new Error('Отсутствуют данные авторизации');
        }

        return await post('/miniapp/transactions', {
            initData,
            limit,
            offset,
        });
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

