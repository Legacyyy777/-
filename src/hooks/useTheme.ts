// Хук для управления темой с автосохранением

import { useEffect } from 'react';
import { useUIStore } from '@/store/uiStore';

/**
 * Хук для управления темой с автосохранением
 */
export const useTheme = () => {
    const { theme, setTheme, toggleTheme } = useUIStore();

    // Инициализация темы при загрузке
    useEffect(() => {
        const savedTheme = localStorage.getItem('app_theme') as 'light' | 'dark';
        if (savedTheme && savedTheme !== theme) {
            setTheme(savedTheme);
        }

        // Применяем тему к document
        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-theme', theme);
        }
    }, []);

    // Сохраняем тему при изменении
    useEffect(() => {
        localStorage.setItem('app_theme', theme);
        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-theme', theme);
        }
    }, [theme]);

    // Сохранение при закрытии
    useEffect(() => {
        const handleBeforeUnload = () => {
            localStorage.setItem('app_theme', theme);
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [theme]);

    return {
        theme,
        setTheme,
        toggleTheme,
    };
};
