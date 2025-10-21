import { Router, Request, Response } from 'express';
import { query } from '../db';

const router = Router();

/**
 * POST /api/payments/methods
 * Получение доступных способов оплаты
 */
router.post('/methods', async (req: Request, res: Response) => {
    try {
        const userId = req.telegramUser?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Пользователь не авторизован',
            });
        }

        // Возвращаем доступные способы оплаты
        // TODO: Получить из БД или конфига
        const methods = [
            {
                id: 'cryptobot',
                name: 'CryptoBot',
                icon: '💎',
                currency: 'USDT/TON',
                min_amount_kopeks: 10000, // 100₽
                max_amount_kopeks: 10000000, // 100,000₽
                requires_amount: true,
                is_active: true,
            },
            {
                id: 'yookassa',
                name: 'ЮKassa (Карты)',
                icon: '💳',
                currency: 'RUB',
                min_amount_kopeks: 10000,
                max_amount_kopeks: 10000000,
                requires_amount: true,
                is_active: true,
            },
            {
                id: 'stars',
                name: 'Telegram Stars',
                icon: '⭐',
                currency: 'Stars',
                min_amount_kopeks: 0,
                max_amount_kopeks: 0,
                requires_amount: false,
                is_active: true,
            },
        ];

        res.json({
            success: true,
            methods: methods.filter(m => m.is_active),
        });
    } catch (error) {
        console.error('❌ Ошибка получения способов оплаты:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка загрузки способов оплаты',
        });
    }
});

/**
 * POST /api/payments/initiate
 * Создание платежа
 */
router.post('/initiate', async (req: Request, res: Response) => {
    try {
        const userId = req.telegramUser?.id;
        const { method_id, amount_kopeks } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Пользователь не авторизован',
            });
        }

        if (!method_id) {
            return res.status(400).json({
                success: false,
                error: 'Не указан способ оплаты',
            });
        }

        // TODO: Реальная интеграция с платежными системами
        // Сейчас возвращаем заглушку
        res.json({
            success: true,
            payment_id: `payment_${Date.now()}`,
            payment_url: `https://example.com/pay?amount=${amount_kopeks}`,
            status: 'pending',
        });
    } catch (error) {
        console.error('❌ Ошибка создания платежа:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка создания платежа',
        });
    }
});

export default router;

