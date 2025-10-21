import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const router = Router();

/**
 * POST /api/auth/telegram-login
 * Авторизация через Telegram Login Widget
 */
router.post('/telegram-login', async (req: Request, res: Response) => {
    try {
        const { id, first_name, last_name, username, photo_url, auth_date, hash } = req.body;

        if (!id || !hash || !auth_date) {
            return res.status(400).json({
                success: false,
                error: 'Недостаточно данных для авторизации',
            });
        }

        const botToken = process.env.BOT_TOKEN;
        if (!botToken) {
            console.error('❌ BOT_TOKEN не установлен');
            return res.status(500).json({
                success: false,
                error: 'Ошибка конфигурации сервера',
            });
        }

        // Проверяем подлинность данных от Telegram
        const dataCheckString = Object.keys(req.body)
            .filter(key => key !== 'hash')
            .sort()
            .map(key => `${key}=${req.body[key]}`)
            .join('\n');

        const secretKey = crypto
            .createHash('sha256')
            .update(botToken)
            .digest();

        const calculatedHash = crypto
            .createHmac('sha256', secretKey)
            .update(dataCheckString)
            .digest('hex');

        if (calculatedHash !== hash) {
            return res.status(401).json({
                success: false,
                error: 'Неверные данные авторизации',
            });
        }

        // Проверяем время авторизации (не старше 24 часов)
        const currentTime = Math.floor(Date.now() / 1000);
        const maxAge = 24 * 60 * 60; // 24 часа

        if (currentTime - parseInt(auth_date) > maxAge) {
            return res.status(401).json({
                success: false,
                error: 'Данные авторизации устарели',
            });
        }

        // Создаём JWT токен
        const jwtSecret = process.env.JWT_SECRET || botToken;
        const token = jwt.sign(
            {
                id,
                first_name,
                last_name,
                username,
                photo_url,
            },
            jwtSecret,
            { expiresIn: '30d' }
        );

        res.json({
            success: true,
            token,
            user: {
                id,
                first_name,
                last_name,
                username,
                photo_url,
            },
        });
    } catch (error) {
        console.error('❌ Ошибка авторизации через Telegram:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка авторизации',
        });
    }
});

/**
 * POST /api/auth/verify
 * Проверка валидности JWT токена
 */
router.post('/verify', async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Отсутствует токен авторизации',
            });
        }

        const token = authHeader.substring(7);
        const jwtSecret = process.env.JWT_SECRET || process.env.BOT_TOKEN;

        if (!jwtSecret) {
            return res.status(500).json({
                success: false,
                error: 'Ошибка конфигурации сервера',
            });
        }

        const decoded = jwt.verify(token, jwtSecret) as any;

        res.json({
            success: true,
            user: {
                id: decoded.id,
                first_name: decoded.first_name,
                last_name: decoded.last_name,
                username: decoded.username,
                photo_url: decoded.photo_url,
            },
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            error: 'Невалидный токен',
        });
    }
});

export default router;

