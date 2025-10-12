// API для аутентификации через Telegram WebApp

/**
 * Получение initData от Telegram WebApp
 * @returns initData строка или null если недоступно
 */
export const getInitData = (): string | null => {
    return window.Telegram?.WebApp?.initData || null;
};

/**
 * Получение информации о пользователе из Telegram
 * @returns объект с данными пользователя или null
 */
export const getTelegramUser = () => {
    const user = window.Telegram?.WebApp?.initDataUnsafe?.user;

    if (!user) return null;

    return {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        language_code: user.language_code,
        is_premium: user.is_premium,
    };
};

/**
 * Проверка авторизации пользователя
 * @returns true если пользователь авторизован через Telegram
 */
export const isAuthenticated = (): boolean => {
    const initData = getInitData();
    const user = getTelegramUser();

    return Boolean(initData && user);
};

/**
 * Получение языка пользователя
 * @returns код языка (ru, en и т.д.)
 */
export const getUserLanguage = (): string => {
    const user = getTelegramUser();
    return user?.language_code || 'ru';
};

/**
 * Проверка, является ли пользователь Premium
 * @returns true если пользователь имеет Telegram Premium
 */
export const isPremiumUser = (): boolean => {
    const user = getTelegramUser();
    return Boolean(user?.is_premium);
};

