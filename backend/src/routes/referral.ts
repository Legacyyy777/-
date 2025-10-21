import { Router, Request, Response } from 'express';
import { query } from '../db';

const router = Router();

/**
 * GET /api/referral
 * Получение реферальной информации
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

        // Получаем реферальный код
        const userResult = await query(`
            SELECT referral_code
            FROM users
            WHERE telegram_id = $1
        `, [userId]);

        if (userResult.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Пользователь не найден',
            });
        }

        const referralCode = userResult[0].referral_code;

        // Получаем статистику рефералов
        const statsResult = await query(`
            SELECT 
                COUNT(*) as total_referrals,
                SUM(CASE WHEN subscription_status = 'active' THEN 1 ELSE 0 END) as active_referrals,
                SUM(COALESCE(total_earned_kopeks, 0)) as total_earned_kopeks
            FROM users
            WHERE referred_by = $1
        `, [referralCode]);

        // Получаем список рефералов
        const referralsResult = await query(`
            SELECT 
                telegram_id,
                first_name,
                subscription_status,
                subscribed_until,
                created_at
            FROM users
            WHERE referred_by = $1
            ORDER BY created_at DESC
            LIMIT 100
        `, [referralCode]);

        const stats = statsResult[0];

        res.json({
            success: true,
            referral_code: referralCode,
            total_referrals: parseInt(stats.total_referrals) || 0,
            active_referrals: parseInt(stats.active_referrals) || 0,
            total_earned_kopeks: parseInt(stats.total_earned_kopeks) || 0,
            total_earned_rubles: (parseInt(stats.total_earned_kopeks) || 0) / 100,
            referrals: referralsResult.map(r => ({
                telegram_id: r.telegram_id,
                first_name: r.first_name,
                subscription_status: r.subscription_status,
                subscribed_until: r.subscribed_until,
                joined_at: r.created_at,
            })),
        });
    } catch (error) {
        console.error('❌ Ошибка получения реферальных данных:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка загрузки реферальных данных',
        });
    }
});

export default router;

