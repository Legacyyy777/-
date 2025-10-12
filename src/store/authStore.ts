// Store для управления авторизацией и данными пользователя

import { create } from 'zustand';
import { getTelegramUser, isAuthenticated, getUserLanguage } from '@/api/auth';

interface AuthState {
    // Состояние
    isAuthenticated: boolean;
    user: {
        id: number;
        first_name: string;
        last_name?: string;
        username?: string;
        language_code?: string;
        is_premium?: boolean;
    } | null;
    language: string;

    // Действия
    checkAuth: () => void;
    setLanguage: (lang: string) => void;
    logout: () => void;
}

/**
 * Store для работы с авторизацией
 */
export const useAuthStore = create<AuthState>((set) => ({
    // Начальное состояние
    isAuthenticated: false,
    user: null,
    language: 'ru',

    // Проверка авторизации
    checkAuth: () => {
        const authenticated = isAuthenticated();
        const user = getTelegramUser();
        const language = getUserLanguage();

        set({
            isAuthenticated: authenticated,
            user,
            language,
        });
    },

    // Установка языка
    setLanguage: (lang: string) => {
        set({ language: lang });
        // Сохраняем язык в localStorage
        localStorage.setItem('app_language', lang);
    },

    // Выход (очистка данных)
    logout: () => {
        set({
            isAuthenticated: false,
            user: null,
        });
    },
}));

