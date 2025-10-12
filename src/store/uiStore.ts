// Store для управления UI состоянием

import { create } from 'zustand';

interface Modal {
    id: string;
    component: string;
    props?: Record<string, any>;
}

interface Toast {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
}

interface UIState {
    // Состояние
    theme: 'light' | 'dark';
    modals: Modal[];
    toasts: Toast[];
    bottomSheet: {
        isOpen: boolean;
        component: string | null;
        props?: Record<string, any>;
    } | null;
    loading: {
        isGlobalLoading: boolean;
        loadingText?: string;
    };
    enable3D: boolean;
    enableParticles: boolean;

    // Действия
    setTheme: (theme: 'light' | 'dark') => void;
    toggleTheme: () => void;

    // Модальные окна
    openModal: (component: string, props?: Record<string, any>) => string;
    closeModal: (id: string) => void;
    closeAllModals: () => void;

    // Уведомления (toast)
    showToast: (
        type: 'success' | 'error' | 'warning' | 'info',
        message: string,
        duration?: number
    ) => string;
    hideToast: (id: string) => void;

    // Bottom sheet
    openBottomSheet: (component: string, props?: Record<string, any>) => void;
    closeBottomSheet: () => void;

    // Глобальная загрузка
    setGlobalLoading: (loading: boolean, text?: string) => void;

    // Настройки эффектов
    toggle3D: () => void;
    toggleParticles: () => void;
}

/**
 * Store для управления UI
 */
export const useUIStore = create<UIState>((set, get) => ({
    // Начальное состояние
    theme: (localStorage.getItem('app_theme') as 'light' | 'dark') || 'light',
    modals: [],
    toasts: [],
    bottomSheet: null,
    loading: {
        isGlobalLoading: false,
    },
    enable3D: false, // Отключено для быстрой сборки
    enableParticles: false, // Отключено для быстрой сборки

    // Управление темой
    setTheme: (theme) => {
        set({ theme });
        localStorage.setItem('app_theme', theme);
        document.documentElement.setAttribute('data-theme', theme);

        // Применяем класс для Tailwind
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    },

    toggleTheme: () => {
        const currentTheme = get().theme;
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        get().setTheme(newTheme);
    },

    // Управление модальными окнами
    openModal: (component, props) => {
        const id = `modal-${Date.now()}-${Math.random()}`;
        set((state) => ({
            modals: [...state.modals, { id, component, props }],
        }));
        return id;
    },

    closeModal: (id) => {
        set((state) => ({
            modals: state.modals.filter((m) => m.id !== id),
        }));
    },

    closeAllModals: () => {
        set({ modals: [] });
    },

    // Управление toast уведомлениями
    showToast: (type, message, duration = 3000) => {
        const id = `toast-${Date.now()}-${Math.random()}`;
        set((state) => ({
            toasts: [...state.toasts, { id, type, message, duration }],
        }));

        // Автоматически удаляем toast через duration
        if (duration > 0) {
            setTimeout(() => {
                get().hideToast(id);
            }, duration);
        }

        return id;
    },

    hideToast: (id) => {
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
        }));
    },

    // Управление bottom sheet
    openBottomSheet: (component, props) => {
        set({
            bottomSheet: {
                isOpen: true,
                component,
                props,
            },
        });
    },

    closeBottomSheet: () => {
        set({
            bottomSheet: null,
        });
    },

    // Глобальная загрузка
    setGlobalLoading: (isGlobalLoading, loadingText) => {
        set({
            loading: {
                isGlobalLoading,
                loadingText,
            },
        });
    },

    // Переключение 3D эффектов
    toggle3D: () => {
        const newValue = !get().enable3D;
        set({ enable3D: newValue });
        localStorage.setItem('enable_3d', String(newValue));
    },

    // Переключение частиц
    toggleParticles: () => {
        const newValue = !get().enableParticles;
        set({ enableParticles: newValue });
        localStorage.setItem('enable_particles', String(newValue));
    },
}));

// Инициализация темы при загрузке
if (typeof window !== 'undefined') {
    const theme = useUIStore.getState().theme;
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    }
}

