// Хук для работы с подпиской

import { useState, useCallback } from 'react';
import {
    getSubscription,
    getSubscriptionSettings,
    updateSubscriptionServers,
    updateSubscriptionTraffic,
    updateSubscriptionDevices,
    removeDevice,
    activateTrial,
    renewSubscription,
    updateAutopay,
} from '@/api/subscriptions';
import type { Subscription, SubscriptionSettings } from '@/types/api';

/**
 * Хук для управления подпиской
 */
export const useSubscription = () => {
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [settings, setSettings] = useState<SubscriptionSettings | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Загрузка данных подписки
     */
    const loadSubscription = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await getSubscription();
            setSubscription(data);
            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки подписки';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Загрузка настроек подписки
     */
    const loadSettings = useCallback(async (subscriptionId?: number) => {
        setLoading(true);
        setError(null);

        try {
            const response = await getSubscriptionSettings(subscriptionId);
            setSettings(response.settings);
            return response.settings;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки настроек';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Обновление серверов
     */
    const updateServers = useCallback(
        async (serverUuids: string[], subscriptionId?: number) => {
            setLoading(true);
            setError(null);

            try {
                await updateSubscriptionServers(serverUuids, subscriptionId);
                // Перезагружаем данные подписки
                await loadSubscription();
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Ошибка обновления серверов';
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [loadSubscription]
    );

    /**
     * Обновление лимита трафика
     */
    const updateTraffic = useCallback(
        async (trafficGb: number, subscriptionId?: number) => {
            setLoading(true);
            setError(null);

            try {
                await updateSubscriptionTraffic(trafficGb, subscriptionId);
                // Перезагружаем данные подписки
                await loadSubscription();
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Ошибка обновления трафика';
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [loadSubscription]
    );

    /**
     * Обновление лимита устройств
     */
    const updateDevices = useCallback(
        async (deviceLimit: number, subscriptionId?: number) => {
            setLoading(true);
            setError(null);

            try {
                await updateSubscriptionDevices(deviceLimit, subscriptionId);
                // Перезагружаем данные подписки
                await loadSubscription();
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Ошибка обновления лимита устройств';
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [loadSubscription]
    );

    /**
     * Удаление устройства
     */
    const deleteDevice = useCallback(
        async (hwid: string) => {
            setLoading(true);
            setError(null);

            try {
                await removeDevice(hwid);
                // Перезагружаем данные подписки
                await loadSubscription();
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Ошибка удаления устройства';
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [loadSubscription]
    );

    /**
     * Активация триала
     */
    const startTrial = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await activateTrial();
            // Перезагружаем данные подписки
            await loadSubscription();
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Ошибка активации триала';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [loadSubscription]);

    /**
     * Продление подписки
     */
    const renew = useCallback(
        async (periodId: string, subscriptionId?: number) => {
            setLoading(true);
            setError(null);

            try {
                const result = await renewSubscription(periodId, subscriptionId);
                // Перезагружаем данные подписки
                await loadSubscription();
                return result;
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Ошибка продления подписки';
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [loadSubscription]
    );

    /**
     * Обновление настроек автопродления
     */
    const toggleAutopay = useCallback(
        async (enabled: boolean, daysBefore?: number, subscriptionId?: number) => {
            setLoading(true);
            setError(null);

            try {
                await updateAutopay(enabled, daysBefore, subscriptionId);
                // Перезагружаем данные подписки
                await loadSubscription();
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Ошибка обновления автопродления';
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [loadSubscription]
    );

    /**
     * Проверка активности подписки
     */
    const isActive = useCallback(() => {
        if (!subscription) return false;
        return subscription.user.has_active_subscription;
    }, [subscription]);

    /**
     * Получение статуса подписки
     */
    const getStatus = useCallback(() => {
        if (!subscription) return 'none';
        return subscription.user.subscription_status;
    }, [subscription]);

    /**
     * Получение оставшегося трафика
     */
    const getRemainingTraffic = useCallback(() => {
        if (!subscription) return 0;
        const limit = subscription.user.traffic_limit_gb || 0;
        const used = subscription.user.traffic_used_gb || 0;
        return Math.max(0, limit - used);
    }, [subscription]);

    /**
     * Получение процента использованного трафика
     */
    const getTrafficUsagePercent = useCallback(() => {
        if (!subscription) return 0;
        const limit = subscription.user.traffic_limit_gb;
        const used = subscription.user.traffic_used_gb || 0;

        if (!limit || limit === 0) return 0;

        const percent = (used / limit) * 100;
        return Math.min(100, Math.max(0, percent));
    }, [subscription]);

    return {
        subscription,
        settings,
        loading,
        error,
        loadSubscription,
        loadSettings,
        updateServers,
        updateTraffic,
        updateDevices,
        deleteDevice,
        startTrial,
        renew,
        toggleAutopay,
        isActive,
        getStatus,
        getRemainingTraffic,
        getTrafficUsagePercent,
    };
};

