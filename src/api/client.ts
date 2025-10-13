// Базовый API клиент с Axios

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Получение базового URL из переменных окружения
// Если открыто через HTTPS - используем относительный путь для избежания Mixed Content
const API_BASE_URL = window.location.protocol === 'https:'
    ? 'https://testminiapp.legacyyy777.site'  // Используем полный URL для production
    : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080');

// Создание экземпляра Axios
export const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Интерсептор для добавления initData к каждому запросу
 */
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Получаем initData от Telegram
        const initData = window.Telegram?.WebApp?.initData;

        if (initData && config.headers) {
            // Если в теле запроса уже есть initData, не перезаписываем
            if (config.data && typeof config.data === 'object' && !config.data.initData) {
                config.data.initData = initData;
            }

            // Также добавляем в заголовок для некоторых запросов
            config.headers['X-Telegram-Init-Data'] = initData;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Интерсептор для обработки ошибок
 */
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error: AxiosError) => {
        // Логирование ошибок в development режиме
        if (import.meta.env.DEV) {
            console.error('API Error:', error.response?.data || error.message);
        }
        
        // Логирование в production для отладки
        console.error('API Error Details:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message
        });

        // Обработка специфичных кодов ошибок
        if (error.response) {
            const status = error.response.status;

            switch (status) {
                case 401:
                    // Неавторизован - возможно проблема с initData
                    console.error('Ошибка авторизации. Перезапустите приложение.');
                    break;

                case 403:
                    // Доступ запрещен
                    console.error('Доступ запрещен');
                    break;

                case 404:
                    // Не найдено
                    console.error('Ресурс не найден');
                    break;

                case 429:
                    // Слишком много запросов
                    console.error('Слишком много запросов. Подождите немного.');
                    break;

                case 500:
                case 502:
                case 503:
                    // Ошибка сервера
                    console.error('Ошибка сервера. Попробуйте позже.');
                    break;
            }
        } else if (error.request) {
            // Запрос был отправлен, но ответа не получено
            console.error('Нет ответа от сервера. Проверьте подключение к интернету.');
        }

        return Promise.reject(error);
    }
);

/**
 * Типизированный wrapper для GET запросов
 */
export const get = <T>(url: string, params?: Record<string, any>): Promise<T> => {
    return apiClient.get<T>(url, { params }).then((response) => response.data);
};

/**
 * Типизированный wrapper для POST запросов
 */
export const post = <T>(url: string, data?: Record<string, any>): Promise<T> => {
    return apiClient.post<T>(url, data).then((response) => response.data);
};

/**
 * Типизированный wrapper для PUT запросов
 */
export const put = <T>(url: string, data?: Record<string, any>): Promise<T> => {
    return apiClient.put<T>(url, data).then((response) => response.data);
};

/**
 * Типизированный wrapper для DELETE запросов
 */
export const del = <T>(url: string): Promise<T> => {
    return apiClient.delete<T>(url).then((response) => response.data);
};

/**
 * Обработчик ошибок API
 * Извлекает сообщение об ошибке из ответа
 */
export const handleApiError = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        const response = error.response;

        if (response?.data) {
            // Если есть поле message или error в ответе
            if (typeof response.data === 'object') {
                if ('message' in response.data && typeof response.data.message === 'string') {
                    return response.data.message;
                }
                if ('error' in response.data && typeof response.data.error === 'string') {
                    return response.data.error;
                }
                if ('detail' in response.data) {
                    // FastAPI возвращает detail
                    const detail = response.data.detail;
                    if (typeof detail === 'string') {
                        return detail;
                    }
                    if (typeof detail === 'object' && 'message' in detail) {
                        return String(detail.message);
                    }
                }
            }

            // Если data это строка
            if (typeof response.data === 'string') {
                return response.data;
            }
        }

        // Стандартные сообщения по кодам ошибок
        switch (response?.status) {
            case 400:
                return 'Некорректный запрос';
            case 401:
                return 'Требуется авторизация';
            case 403:
                return 'Доступ запрещён';
            case 404:
                return 'Ресурс не найден';
            case 429:
                return 'Слишком много запросов';
            case 500:
                return 'Ошибка сервера';
            case 502:
            case 503:
                return 'Сервер временно недоступен';
            default:
                return error.message || 'Произошла ошибка';
        }
    }

    // Для не-Axios ошибок
    if (error instanceof Error) {
        return error.message;
    }

    return 'Неизвестная ошибка';
};

export default apiClient;

