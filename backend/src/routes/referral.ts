import { Router, Request, Response } from 'express';
import { query } from '../db';
import { getColumnMapping } from '../db/schema-detector';

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

        const mapping = await getColumnMapping();
        const u = mapping.users;

        // Получаем реферальный код
        const userResult = await query(`
            SELECT ${u.referral_code} as referral_code
            FROM users
            WHERE ${u.telegram_id} = $1
        `, [userId]);

        if (userResult.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Пользователь не найден',
            });
        }

        const referralCode = userResult[0].referral_code;

        if (!referralCode) {
            return res.json({
                success: true,
                referral_code: null,
                total_referrals: 0,
                active_referrals: 0,
                total_earned_kopeks: 0,
                total_earned_rubles: 0,
                referrals: [],
            });
        }

        // Получаем статистику рефералов
        const statsResult = await query(`
            SELECT 
                COUNT(*) as total_referrals,
                SUM(CASE WHEN ${u.subscription_active} = true THEN 1 ELSE 0 END) as active_referrals
            FROM users
            WHERE ${u.referred_by} = $1
        `, [referralCode]);

        // Получаем список рефералов
        const referralsResult = await query(`
            SELECT 
                ${u.telegram_id} as telegram_id,
                ${u.subscription_active} as subscription_active,
                ${u.subscription_expires} as subscribed_until,
                ${u.created_at} as created_at
            FROM users
            WHERE ${u.referred_by} = $1
            ORDER BY ${u.created_at} DESC
            LIMIT 100
        `, [referralCode]);

        const stats = statsResult[0];

        res.json({
            success: true,
            referral_code: referralCode,
            total_referrals: parseInt(stats.total_referrals) || 0,
            active_referrals: parseInt(stats.active_referrals) || 0,
            total_earned_kopeks: 0, // TODO: если есть таблица earnings
            total_earned_rubles: 0,
            referrals: referralsResult.map(r => ({
                telegram_id: r.telegram_id,
                subscription_status: r.subscription_active ? 'active' : 'inactive',
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

