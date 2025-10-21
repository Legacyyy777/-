import { Router, Request, Response } from 'express';
import { query } from '../db';
import { getColumnMapping } from '../db/schema-detector';

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

        const mapping = await getColumnMapping();
        const u = mapping.users;

        const result = await query(`
            SELECT ${u.balance} as balance_kopeks
            FROM users
            WHERE ${u.telegram_id} = $1
        `, [userId]);

        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Пользователь не найден',
            });
        }

        const balanceKopeks = parseInt(result[0].balance_kopeks) || 0;

        res.json({
            success: true,
            balance_kopeks: balanceKopeks,
            balance_rubles: balanceKopeks / 100,
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

        const mapping = await getColumnMapping();

        // Пробуем разные варианты таблицы истории транзакций
        let result: any[] = [];
        let total = 0;

        const historyQueries = [
            // Вариант 1: balance_transactions
            {
                query: `SELECT id, amount_kopeks, transaction_type, description, created_at 
                        FROM balance_transactions 
                        WHERE user_telegram_id = $1 
                        ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
                count: `SELECT COUNT(*) as total FROM balance_transactions WHERE user_telegram_id = $1`,
            },
            // Вариант 2: balance_history
            {
                query: `SELECT id, amount as amount_kopeks, type as transaction_type, description, created_at 
                        FROM balance_history 
                        WHERE telegram_id = $1 
                        ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
                count: `SELECT COUNT(*) as total FROM balance_history WHERE telegram_id = $1`,
            },
            // Вариант 3: transactions
            {
                query: `SELECT id, amount as amount_kopeks, type as transaction_type, description, created_at 
                        FROM transactions 
                        WHERE user_id = $1 
                        ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
                count: `SELECT COUNT(*) as total FROM transactions WHERE user_id = $1`,
            },
        ];

        for (const histQuery of historyQueries) {
            try {
                result = await query(histQuery.query, [userId, limit, offset]);
                const countResult = await query(histQuery.count, [userId]);
                total = parseInt(countResult[0].total);
                break;
            } catch (err) {
                continue;
            }
        }

        res.json({
            success: true,
            transactions: result,
            total,
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

