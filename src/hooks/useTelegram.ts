// Хук для работы с Telegram WebApp SDK

import { useEffect, useState, useCallback } from 'react';

/**
 * Хук для работы с Telegram WebApp
 * Предоставляет доступ ко всем функциям Telegram Mini App
 */
export const useTelegram = () => {
    const [isReady, setIsReady] = useState(false);
    const tg = window.Telegram?.WebApp;

    useEffect(() => {
        if (tg && !isReady) {
            // Сигнализируем Telegram что приложение готово (только один раз)
            tg.ready();
            setIsReady(true);

            // Разворачиваем приложение на весь экран
            if (!tg.isExpanded) {
                tg.expand();
            }

            // Отключаем подтверждение закрытия
            tg.disableClosingConfirmation();
        }
    }, [tg, isReady]);

    /**
     * Закрытие приложения
     */
    const close = useCallback(() => {
        tg?.close();
    }, [tg]);

    /**
     * Показ главной кнопки
     * @param text - текст кнопки
     * @param onClick - обработчик клика
     */
    const showMainButton = useCallback(
        (text: string, onClick: () => void) => {
            if (tg?.MainButton) {
                tg.MainButton.setText(text);
                tg.MainButton.show();
                tg.MainButton.onClick(onClick);
                tg.MainButton.enable();
            }
        },
        [tg]
    );

    /**
     * Скрытие главной кнопки
     */
    const hideMainButton = useCallback(() => {
        tg?.MainButton?.hide();
    }, [tg]);

    /**
     * Установка текста главной кнопки
     */
    const setMainButtonText = useCallback(
        (text: string) => {
            tg?.MainButton?.setText(text);
        },
        [tg]
    );

    /**
     * Показ/скрытие loader на главной кнопке
     */
    const setMainButtonLoading = useCallback(
        (loading: boolean) => {
            if (loading) {
                tg?.MainButton?.showProgress(false);
            } else {
                tg?.MainButton?.hideProgress();
            }
        },
        [tg]
    );

    /**
     * Показ кнопки "Назад"
     * @param onClick - обработчик клика
     */
    const showBackButton = useCallback(
        (onClick: () => void) => {
            if (tg?.BackButton) {
                tg.BackButton.show();
                tg.BackButton.onClick(onClick);
            }
        },
        [tg]
    );

    /**
     * Скрытие кнопки "Назад"
     */
    const hideBackButton = useCallback(() => {
        tg?.BackButton?.hide();
    }, [tg]);

    /**
     * Тактильный отклик (вибрация)
     * @param style - стиль вибрации
     */
    const hapticFeedback = useCallback(
        (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
            tg?.HapticFeedback?.impactOccurred(style);
        },
        [tg]
    );

    /**
     * Отклик при уведомлении
     * @param type - тип уведомления
     */
    const hapticNotification = useCallback(
        (type: 'error' | 'success' | 'warning') => {
            tg?.HapticFeedback?.notificationOccurred(type);
        },
        [tg]
    );

    /**
     * Отклик при выборе
     */
    const hapticSelection = useCallback(() => {
        tg?.HapticFeedback?.selectionChanged();
    }, [tg]);

    /**
     * Показ всплывающего окна
     * @param message - сообщение
     * @param callback - обработчик после закрытия
     */
    const showAlert = useCallback(
        (message: string, callback?: () => void) => {
            tg?.showAlert(message, callback);
        },
        [tg]
    );

    /**
     * Показ диалога подтверждения
     * @param message - сообщение
     * @param callback - обработчик с результатом (true/false)
     */
    const showConfirm = useCallback(
        (message: string, callback?: (confirmed: boolean) => void) => {
            tg?.showConfirm(message, callback);
        },
        [tg]
    );

    /**
     * Показ popup с кнопками
     * @param params - параметры popup
     * @param callback - обработчик с ID нажатой кнопки
     */
    const showPopup = useCallback(
        (
            params: {
                title?: string;
                message: string;
                buttons?: Array<{
                    id?: string;
                    type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
                    text?: string;
                }>;
            },
            callback?: (buttonId: string) => void
        ) => {
            tg?.showPopup(params, callback);
        },
        [tg]
    );

    /**
     * Открытие ссылки
     * @param url - URL для открытия
     * @param tryInstantView - попытка открыть в Instant View
     */
    const openLink = useCallback(
        (url: string, tryInstantView: boolean = false) => {
            tg?.openLink(url, { try_instant_view: tryInstantView });
        },
        [tg]
    );

    /**
     * Открытие Telegram ссылки
     * @param url - Telegram URL (например, t.me/username)
     */
    const openTelegramLink = useCallback(
        (url: string) => {
            tg?.openTelegramLink(url);
        },
        [tg]
    );

    /**
     * Получение текущей темы
     */
    const getTheme = useCallback(() => {
        return tg?.colorScheme || 'light';
    }, [tg]);

    /**
     * Получение цветов темы
     */
    const getThemeParams = useCallback(() => {
        return tg?.themeParams || {};
    }, [tg]);

    /**
     * Получение данных пользователя
     */
    const getUser = useCallback(() => {
        return tg?.initDataUnsafe?.user || null;
    }, [tg]);

    /**
     * Получение initData
     */
    const getInitData = useCallback(() => {
        return tg?.initData || '';
    }, [tg]);

    /**
     * Получение платформы
     */
    const getPlatform = useCallback(() => {
        return tg?.platform || 'unknown';
    }, [tg]);

    /**
     * Получение версии API
     */
    const getVersion = useCallback(() => {
        return tg?.version || '6.0';
    }, [tg]);

    return {
        tg,
        isReady,
        // Информация
        user: getUser(),
        initData: getInitData(),
        platform: getPlatform(),
        version: getVersion(),
        theme: getTheme(),
        themeParams: getThemeParams(),
        // Методы
        close,
        showMainButton,
        hideMainButton,
        setMainButtonText,
        setMainButtonLoading,
        showBackButton,
        hideBackButton,
        hapticFeedback,
        hapticNotification,
        hapticSelection,
        showAlert,
        showConfirm,
        showPopup,
        openLink,
        openTelegramLink,
    };
};

