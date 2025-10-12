// API endpoints для работы с подписками

import { post, handleApiError } from './client';
import { getInitData } from './auth';
import type {
    Subscription,
    SubscriptionSettings,
    PurchaseOptions,
    ApiResponse
} from '@/types/api';

/**
 * Получение данных о подписке пользователя
 * @returns объект с информацией о подписке
 */
export const getSubscription = async (): Promise<Subscription> => {
    try {
        const initData = getInitData();
        if (!initData) {
            throw new Error('Отсутствуют данные авторизации');
        }

        const response = await post<{ success: boolean; } & Subscription>(
            '/miniapp/subscription',
            { initData }
        );

        return response;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Получение настроек подписки
 * @param subscriptionId - ID подписки (опционально)
 * @returns настройки подписки
 */
export const getSubscriptionSettings = async (
    subscriptionId?: number
): Promise<{ success: boolean; settings: SubscriptionSettings }> => {
    try {
        const initData = getInitData();
        if (!initData) {
            throw new Error('Отсутствуют данные авторизации');
        }

        return await post('/miniapp/subscription/settings', {
            initData,
            subscriptionId,
        });
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Обновление серверов подписки
 * @param serverUuids - массив UUID серверов
 * @param subscriptionId - ID подписки (опционально)
 * @returns результат обновления
 */
export const updateSubscriptionServers = async (
    serverUuids: string[],
    subscriptionId?: number
): Promise<ApiResponse<void>> => {
    try {
        const initData = getInitData();
        if (!initData) {
            throw new Error('Отсутствуют данные авторизации');
        }

        return await post('/miniapp/subscription/update/servers', {
            initData,
            subscriptionId,
            serverUuids,
        });
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Обновление лимита трафика
 * @param trafficGb - лимит трафика в GB
 * @param subscriptionId - ID подписки (опционально)
 * @returns результат обновления
 */
export const updateSubscriptionTraffic = async (
    trafficGb: number,
    subscriptionId?: number
): Promise<ApiResponse<void>> => {
    try {
        const initData = getInitData();
        if (!initData) {
            throw new Error('Отсутствуют данные авторизации');
        }

        return await post('/miniapp/subscription/update/traffic', {
            initData,
            subscriptionId,
            trafficGb,
        });
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Обновление лимита устройств
 * @param deviceLimit - лимит устройств
 * @param subscriptionId - ID подписки (опционально)
 * @returns результат обновления
 */
export const updateSubscriptionDevices = async (
    deviceLimit: number,
    subscriptionId?: number
): Promise<ApiResponse<void>> => {
    try {
        const initData = getInitData();
        if (!initData) {
            throw new Error('Отсутствуют данные авторизации');
        }

        return await post('/miniapp/subscription/update/devices', {
            initData,
            subscriptionId,
            deviceLimit,
        });
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Удаление устройства из подписки
 * @param hwid - идентификатор устройства
 * @returns результат удаления
 */
export const removeDevice = async (hwid: string): Promise<ApiResponse<void>> => {
    try {
        const initData = getInitData();
        if (!initData) {
            throw new Error('Отсутствуют данные авторизации');
        }

        return await post('/miniapp/subscription/device/remove', {
            initData,
            hwid,
        });
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Получение опций для покупки подписки
 * @returns опции покупки
 */
export const getPurchaseOptions = async (): Promise<PurchaseOptions> => {
    try {
        const initData = getInitData();
        if (!initData) {
            throw new Error('Отсутствуют данные авторизации');
        }

        const response = await post<{ success: boolean } & PurchaseOptions>(
            '/miniapp/subscription/purchase/options',
            { initData }
        );

        return response;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Предпросмотр покупки подписки
 * @param data - данные для предпросмотра
 * @returns данные предпросмотра
 */
export const previewPurchase = async (data: {
    periodId?: string;
    periodDays?: number;
    trafficGb?: number;
    serverUuids?: string[];
    deviceLimit?: number;
}): Promise<any> => {
    try {
        const initData = getInitData();
        if (!initData) {
            throw new Error('Отсутствуют данные авторизации');
        }

        return await post('/miniapp/subscription/purchase/preview', {
            initData,
            ...data,
        });
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Покупка подписки
 * @param data - данные для покупки
 * @returns результат покупки
 */
export const purchaseSubscription = async (data: {
    periodId?: string;
    periodDays?: number;
    trafficGb?: number;
    serverUuids?: string[];
    deviceLimit?: number;
}): Promise<{
    success: boolean;
    message?: string;
    balanceKopeks?: number;
    subscriptionId?: number;
}> => {
    try {
        const initData = getInitData();
        if (!initData) {
            throw new Error('Отсутствуют данные авторизации');
        }

        return await post('/miniapp/subscription/purchase', {
            initData,
            ...data,
        });
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Активация триала
 * @returns результат активации
 */
export const activateTrial = async (): Promise<{
    success: boolean;
    message?: string;
    subscriptionId?: number;
    trialStatus?: string;
    trialDurationDays?: number;
}> => {
    try {
        const initData = getInitData();
        if (!initData) {
            throw new Error('Отсутствуют данные авторизации');
        }

        return await post('/miniapp/subscription/trial', { initData });
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Получение опций продления подписки
 * @param subscriptionId - ID подписки (опционально)
 * @returns опции продления
 */
export const getRenewalOptions = async (
    subscriptionId?: number
): Promise<any> => {
    try {
        const initData = getInitData();
        if (!initData) {
            throw new Error('Отсутствуют данные авторизации');
        }

        return await post('/miniapp/subscription/renewal/options', {
            initData,
            subscriptionId,
        });
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Продление подписки
 * @param periodId - ID периода
 * @param subscriptionId - ID подписки (опционально)
 * @returns результат продления
 */
export const renewSubscription = async (
    periodId: string,
    subscriptionId?: number
): Promise<{
    success: boolean;
    message?: string;
    balanceKopeks?: number;
    renewedUntil?: string;
}> => {
    try {
        const initData = getInitData();
        if (!initData) {
            throw new Error('Отсутствуют данные авторизации');
        }

        return await post('/miniapp/subscription/renewal', {
            initData,
            subscriptionId,
            periodId,
        });
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Обновление настроек автопродления
 * @param enabled - включить/выключить автопродление
 * @param daysBefore - за сколько дней до истечения продлевать
 * @param subscriptionId - ID подписки (опционально)
 * @returns обновленные настройки
 */
export const updateAutopay = async (
    enabled: boolean,
    daysBefore?: number,
    subscriptionId?: number
): Promise<any> => {
    try {
        const initData = getInitData();
        if (!initData) {
            throw new Error('Отсутствуют данные авторизации');
        }

        return await post('/miniapp/subscription/autopay', {
            initData,
            subscriptionId,
            enabled,
            daysBefore,
        });
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

