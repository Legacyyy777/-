// Утилиты для валидации

/**
 * Проверка валидности email
 * @param email - email адрес
 * @returns true если email валиден
 */
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Проверка валидности промокода
 * @param code - промокод
 * @returns true если промокод валиден
 */
export const isValidPromoCode = (code: string): boolean => {
    // Промокод должен быть от 4 до 32 символов, только латиница, цифры, дефис и подчеркивание
    const promoRegex = /^[A-Za-z0-9_-]{4,32}$/;
    return promoRegex.test(code);
};

/**
 * Проверка валидности суммы пополнения
 * @param amount - сумма в рублях
 * @param min - минимальная сумма
 * @param max - максимальная сумма
 * @returns объект с результатом валидации
 */
export const validateAmount = (
    amount: number,
    min: number = 1,
    max: number = 100000
): { valid: boolean; error?: string } => {
    if (isNaN(amount) || amount <= 0) {
        return { valid: false, error: 'Введите корректную сумму' };
    }

    if (amount < min) {
        return { valid: false, error: `Минимальная сумма: ${min} ₽` };
    }

    if (amount > max) {
        return { valid: false, error: `Максимальная сумма: ${max} ₽` };
    }

    return { valid: true };
};

/**
 * Проверка валидности количества серверов
 * @param count - количество серверов
 * @param min - минимальное количество
 * @param max - максимальное количество
 * @returns true если количество валидно
 */
export const isValidServerCount = (
    count: number,
    min: number = 1,
    max: number = 10
): boolean => {
    return count >= min && count <= max;
};

/**
 * Проверка валидности лимита устройств
 * @param limit - лимит устройств
 * @param min - минимальный лимит
 * @param max - максимальный лимит
 * @returns true если лимит валиден
 */
export const isValidDeviceLimit = (
    limit: number,
    min: number = 1,
    max: number = 100
): boolean => {
    return limit >= min && limit <= max;
};

/**
 * Проверка наличия initData от Telegram
 * @returns true если initData присутствует
 */
export const hasInitData = (): boolean => {
    return Boolean(window.Telegram?.WebApp?.initData);
};

/**
 * Санитизация HTML строки (базовая защита от XSS)
 * @param html - HTML строка
 * @returns безопасная строка
 */
export const sanitizeHTML = (html: string): string => {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
};

/**
 * Проверка доступности функции в Telegram WebApp
 * @param feature - название функции
 * @returns true если функция доступна
 */
export const isFeatureAvailable = (feature: string): boolean => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return false;

    // Проверка версии для новых функций
    const version = parseFloat(tg.version);

    switch (feature) {
        case 'BackButton':
            return version >= 6.1;
        case 'MainButton':
            return version >= 6.1;
        case 'HapticFeedback':
            return version >= 6.1;
        case 'CloudStorage':
            return version >= 6.9;
        default:
            return true;
    }
};

