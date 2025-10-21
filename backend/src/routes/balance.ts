import { Router, Request, Response } from 'express';
import { query } from '../db';

const router = Router();

/**
 * GET /api/balance
 * Получение баланса пользователя
 */
router.post('/', async (req: Request, res: Response) => {
    try {
        const userId = req.telegramUser?.id;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Пользователь не авторизован',
            });
        }

        const result = await query(`
            SELECT balance_kopeks
            FROM users
            WHERE telegram_id = $1
        `, [userId]);

        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Пользователь не найден',
            });
        }

        res.json({
            success: true,
            balance_kopeks: result[0].balance_kopeks || 0,
            balance_rubles: (result[0].balance_kopeks || 0) / 100,
        });
    } catch (error) {
        console.error('❌ Ошибка получения баланса:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка загрузки баланса',
        });
    }
});

/**
 * GET /api/balance/history
 * История транзакций
 */
router.post('/history', async (req: Request, res: Response) => {
    try {
        const userId = req.telegramUser?.id;
        const { limit = 50, offset = 0 } = req.body;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Пользователь не авторизован',
            });
        }

        const result = await query(`
            SELECT 
                id,
                amount_kopeks,
                transaction_type,
                description,
                created_at
            FROM balance_transactions
            WHERE user_telegram_id = $1
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3
        `, [userId, limit, offset]);

        const countResult = await query(`
            SELECT COUNT(*) as total
            FROM balance_transactions
            WHERE user_telegram_id = $1
        `, [userId]);

        res.json({
            success: true,
            transactions: result,
            total: parseInt(countResult[0].total),
            limit,
            offset,
        });
    } catch (error) {
        console.error('❌ Ошибка получения истории:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка загрузки истории транзакций',
        });
    }
});

export default router;

