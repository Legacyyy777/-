// Утилиты для форматирования данных

/**
 * Форматирование цены в рублях
 * @param kopeks - сумма в копейках
 * @returns отформатированная строка с ценой
 */
export const formatPrice = (kopeks: number): string => {
    const rubles = Math.floor(kopeks / 100); // Округляем до целых рублей
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0, // Убираем копейки
    }).format(rubles);
};

/**
 * Форматирование трафика в GB/TB
 * @param gb - объем трафика в гигабайтах
 * @returns отформатированная строка с трафиком
 */
export const formatTraffic = (gb: number): string => {
    if (gb >= 1024) {
        return `${(gb / 1024).toFixed(1)} ТБ`;
    }
    return `${gb} ГБ`;
};

/**
 * Форматирование даты
 * @param date - дата в формате ISO или Date объект
 * @returns отформатированная дата
 */
export const formatDate = (date: string | Date): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(d);
};

/**
 * Форматирование даты и времени
 * @param date - дата в формате ISO или Date объект
 * @returns отформатированная дата и время
 */
export const formatDateTime = (date: string | Date): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(d);
};

/**
 * Форматирование относительного времени (например, "2 дня назад")
 * @param date - дата в формате ISO или Date объект
 * @returns относительное время
 */
export const formatRelativeTime = (date: string | Date): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) return 'только что';
    if (diffMinutes < 60) return `${diffMinutes} мин. назад`;
    if (diffHours < 24) return `${diffHours} ч. назад`;
    if (diffDays < 7) return `${diffDays} д. назад`;

    return formatDate(d);
};

/**
 * Форматирование оставшегося времени до даты
 * @param date - дата в формате ISO или Date объект
 * @returns строка с оставшимся временем
 */
export const formatTimeUntil = (date: string | Date): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = d.getTime() - now.getTime();

    if (diffMs <= 0) return 'истёк';

    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} дн.`;
    if (diffHours > 0) return `${diffHours} ч.`;
    if (diffMinutes > 0) return `${diffMinutes} мин.`;
    return `${diffSeconds} сек.`;
};

/**
 * Форматирование процентов
 * @param value - значение процента
 * @param decimals - количество знаков после запятой
 * @returns отформатированная строка с процентами
 */
export const formatPercent = (value: number, decimals: number = 0): string => {
    return `${value.toFixed(decimals)}%`;
};

/**
 * Сокращение длинных строк
 * @param text - текст для сокращения
 * @param maxLength - максимальная длина
 * @returns сокращенный текст
 */
export const truncate = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
};

/**
 * Форматирование номера телефона
 * @param phone - номер телефона
 * @returns отформатированный номер
 */
export const formatPhone = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('7')) {
        return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9)}`;
    }
    return phone;
};

/**
 * Склонение числительных
 * @param number - число
 * @param forms - формы слова [один, два, пять]
 * @returns правильная форма слова
 */
export const pluralize = (number: number, forms: [string, string, string]): string => {
    const n = Math.abs(number) % 100;
    const n1 = n % 10;

    if (n > 10 && n < 20) return forms[2];
    if (n1 > 1 && n1 < 5) return forms[1];
    if (n1 === 1) return forms[0];

    return forms[2];
};

/**
 * Форматирование количества с правильным склонением
 * @param count - количество
 * @param forms - формы слова
 * @returns отформатированная строка
 */
export const formatCount = (count: number, forms: [string, string, string]): string => {
    return `${count} ${pluralize(count, forms)}`;
};

