// Хук для работы с платежами

import { useState, useCallback } from 'react';
import {
    getPaymentMethods,
    createPayment,
    checkPaymentStatus,
    getTransactions,
} from '@/api/payments';
import type { PaymentMethod } from '@/types/api';

/**
 * Хук для управления платежами
 */
export const usePayments = () => {
    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Загрузка способов оплаты
     */
    const loadPaymentMethods = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await getPaymentMethods();
            setMethods(response.methods);
            return response.methods;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки способов оплаты';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Создание платежа
     */
    const initiatePayment = useCallback(
        async (method: string, amountKopeks?: number, option?: string) => {
            setLoading(true);
            setError(null);

            try {
                const result = await createPayment(method, amountKopeks, option);
                return result;
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Ошибка создания платежа';
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    /**
     * Проверка статуса платежа
     */
    const checkStatus = useCallback(
        async (
            payments: Array<{
                method: string;
                localPaymentId?: number;
                invoiceId?: string;
                paymentId?: string;
                payload?: string;
                amountKopeks?: number;
                startedAt?: string;
            }>
        ) => {
            setLoading(true);
            setError(null);

            try {
                const result = await checkPaymentStatus(payments);
                return result.results;
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Ошибка проверки статуса';
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    /**
     * Загрузка истории транзакций
     */
    const loadTransactions = useCallback(
        async (limit: number = 50, offset: number = 0) => {
            setLoading(true);
            setError(null);

            try {
                const result = await getTransactions(limit, offset);
                setTransactions(result.transactions || []);
                return result;
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки истории';
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    /**
     * Получение метода оплаты по ID
     */
    const getMethodById = useCallback(
        (methodId: string) => {
            return methods.find((m) => m.id === methodId);
        },
        [methods]
    );

    /**
     * Проверка доступности метода оплаты
     */
    const isMethodAvailable = useCallback(
        (methodId: string, amount?: number) => {
            const method = getMethodById(methodId);
            if (!method) return false;

            if (amount && method.requires_amount) {
                if (method.min_amount_kopeks && amount < method.min_amount_kopeks) {
                    return false;
                }
                if (method.max_amount_kopeks && amount > method.max_amount_kopeks) {
                    return false;
                }
            }

            return true;
        },
        [getMethodById]
    );

    return {
        methods,
        transactions,
        loading,
        error,
        loadPaymentMethods,
        initiatePayment,
        checkStatus,
        loadTransactions,
        getMethodById,
        isMethodAvailable,
    };
};

