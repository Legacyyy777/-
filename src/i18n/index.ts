// Система локализации

import ru from './ru.json';
import en from './en.json';

type Translations = typeof ru;
type TranslationKey = string;

// Доступные языки
export const LANGUAGES = {
    ru: 'Русский',
    en: 'English',
} as const;

export type Language = keyof typeof LANGUAGES;

// Все переводы
const translations: Record<Language, Translations> = {
    ru,
    en,
};

// Текущий язык (по умолчанию русский)
let currentLanguage: Language = 'ru';

/**
 * Установка текущего языка
 * @param lang - код языка
 */
export const setLanguage = (lang: Language): void => {
    if (lang in translations) {
        currentLanguage = lang;
        localStorage.setItem('app_language', lang);
    }
};

/**
 * Получение текущего языка
 * @returns код текущего языка
 */
export const getLanguage = (): Language => {
    return currentLanguage;
};

/**
 * Инициализация языка из localStorage или Telegram
 */
export const initLanguage = (): void => {
    // Пробуем получить из localStorage
    const savedLang = localStorage.getItem('app_language') as Language;

    if (savedLang && savedLang in translations) {
        currentLanguage = savedLang;
        return;
    }

    // Пробуем получить из Telegram
    const tgLang = window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code;

    if (tgLang) {
        // Проверяем есть ли такой язык
        if (tgLang in translations) {
            currentLanguage = tgLang as Language;
        } else if (tgLang.startsWith('ru')) {
            currentLanguage = 'ru';
        } else {
            currentLanguage = 'en';
        }
    }

    localStorage.setItem('app_language', currentLanguage);
};

/**
 * Получение вложенного значения из объекта по пути
 * @param obj - объект
 * @param path - путь (например, "common.loading")
 * @returns значение или undefined
 */
const getNestedValue = (obj: any, path: string): string | undefined => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
};

/**
 * Замена плейсхолдеров в строке
 * @param str - строка с плейсхолдерами
 * @param params - параметры для замены
 * @returns строка с замененными значениями
 */
const replacePlaceholders = (str: string, params?: Record<string, string | number>): string => {
    if (!params) return str;

    return Object.entries(params).reduce((result, [key, value]) => {
        return result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
    }, str);
};

/**
 * Получение перевода по ключу
 * @param key - ключ перевода (например, "common.loading")
 * @param params - параметры для замены в строке
 * @param fallback - значение по умолчанию
 * @returns переведенная строка
 */
export const t = (
    key: TranslationKey,
    params?: Record<string, string | number>,
    fallback?: string
): string => {
    const translation = getNestedValue(translations[currentLanguage], key);

    if (translation !== undefined) {
        return replacePlaceholders(translation, params);
    }

    // Если перевода нет, пробуем русский язык
    if (currentLanguage !== 'ru') {
        const ruTranslation = getNestedValue(translations.ru, key);
        if (ruTranslation !== undefined) {
            return replacePlaceholders(ruTranslation, params);
        }
    }

    // Возвращаем fallback или сам ключ
    return fallback || key;
};

/**
 * React хук для использования переводов
 */
export const useTranslation = () => {
    return {
        t,
        language: currentLanguage,
        setLanguage,
        languages: LANGUAGES,
    };
};

// Инициализируем язык при импорте
if (typeof window !== 'undefined') {
    initLanguage();
}

export default t;

