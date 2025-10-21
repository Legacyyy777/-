import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * Валидация initData от Telegram WebApp
 * Проверяет подлинность данных от клиента
 */
export function validateInitData(req: Request, res: Response, next: NextFunction) {
    try {
        // Режим разработки - пропускаем валидацию для тестов без Telegram
        if (process.env.NODE_ENV === 'development' || process.env.SKIP_AUTH === 'true') {
            console.log('⚠️ DEV MODE: Пропускаем валидацию initData');
            (req as any).telegramUser = {
                id: 402695709, // Ваш telegram_id для тестов
                first_name: 'Test',
                last_name: 'User',
                username: 'Legacyyy777',
                language_code: 'ru',
                is_premium: false,
            };
            return next();
        }

        const initData = req.body.initData || req.headers['x-telegram-init-data'];

        if (!initData) {
            return res.status(401).json({
                success: false,
                error: 'Отсутствуют данные авторизации',
            });
        }

        const botToken = process.env.BOT_TOKEN;
        if (!botToken) {
            console.error('❌ BOT_TOKEN не установлен в .env');
            return res.status(500).json({
                success: false,
                error: 'Ошибка конфигурации сервера',
            });
        }

        // Парсим initData
        const params = new URLSearchParams(initData);
        const hash = params.get('hash');
        params.delete('hash');

        if (!hash) {
            return res.status(401).json({
                success: false,
                error: 'Отсутствует hash',
            });
        }

        // Сортируем параметры и создаём строку для проверки
        const dataCheckString = Array.from(params.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, value]) => `${key}=${value}`)
            .join('\n');

        // Создаём secret key
        const secretKey = crypto
            .createHmac('sha256', 'WebAppData')
            .update(botToken)
            .digest();

        // Вычисляем hash
        const calculatedHash = crypto
            .createHmac('sha256', secretKey)
            .update(dataCheckString)
            .digest('hex');

        // Проверяем hash
        if (calculatedHash !== hash) {
            return res.status(401).json({
                success: false,
                error: 'Неверные данные авторизации',
            });
        }

        // Проверяем auth_date (не старше 24 часов)
        const authDate = parseInt(params.get('auth_date') || '0');
        const currentTime = Math.floor(Date.now() / 1000);
        const maxAge = 24 * 60 * 60; // 24 часа

        if (currentTime - authDate > maxAge) {
            return res.status(401).json({
                success: false,
                error: 'Данные авторизации устарели',
            });
        }

        // Извлекаем данные пользователя
        const userParam = params.get('user');
        if (!userParam) {
            return res.status(401).json({
                success: false,
                error: 'Отсутствуют данные пользователя',
            });
        }

        const user = JSON.parse(userParam);

        // Добавляем данные пользователя в request
        (req as any).telegramUser = {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            language_code: user.language_code,
            is_premium: user.is_premium,
        };

        next();
    } catch (error) {
        console.error('❌ Ошибка валидации initData:', error);
        return res.status(401).json({
            success: false,
            error: 'Ошибка проверки авторизации',
        });
    }
}

// Расширяем тип Request
declare global {
    namespace Express {
        interface Request {
            telegramUser?: {
                id: number;
                first_name: string;
                last_name?: string;
                username?: string;
                language_code?: string;
                is_premium?: boolean;
            };
        }
    }
}

