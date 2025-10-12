// Store для управления подпиской

import { create } from 'zustand';
import type { Subscription, SubscriptionSettings } from '@/types/api';

interface SubscriptionState {
    // Состояние
    subscription: Subscription | null;
    settings: SubscriptionSettings | null;
    loading: boolean;
    error: string | null;
    lastUpdated: number | null;

    // Действия
    setSubscription: (subscription: Subscription | null) => void;
    setSettings: (settings: SubscriptionSettings | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    updateLastUpdated: () => void;
    reset: () => void;
}

/**
 * Store для работы с подпиской
 */
export const useSubscriptionStore = create<SubscriptionState>((set) => ({
    // Начальное состояние
    subscription: null,
    settings: null,
    loading: false,
    error: null,
    lastUpdated: null,

    // Установка подписки
    setSubscription: (subscription) => {
        set({ subscription, error: null });
    },

    // Установка настроек
    setSettings: (settings) => {
        set({ settings, error: null });
    },

    // Установка состояния загрузки
    setLoading: (loading) => {
        set({ loading });
    },

    // Установка ошибки
    setError: (error) => {
        set({ error, loading: false });
    },

    // Обновление времени последнего обновления
    updateLastUpdated: () => {
        set({ lastUpdated: Date.now() });
    },

    // Сброс состояния
    reset: () => {
        set({
            subscription: null,
            settings: null,
            loading: false,
            error: null,
            lastUpdated: null,
        });
    },
}));

