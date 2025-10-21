import { Router, Request, Response } from 'express';
import { query } from '../db';

const router = Router();

/**
 * GET /api/subscription
 * Получение данных о подписке пользователя
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

        // Получаем данные пользователя из БД
        // ВАЖНО: Структура таблиц зависит от схемы вашего бота
        // Адаптируйте запросы под вашу схему БД
        
        const userResult = await query(`
            SELECT 
                telegram_id,
                balance_kopeks,
                referral_code,
                referred_by,
                subscription_status,
                subscribed_until,
                traffic_limit_gb,
                traffic_used_gb,
                device_limit,
                created_at,
                updated_at
            FROM users
            WHERE telegram_id = $1
        `, [userId]);

        if (userResult.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Пользователь не найден',
            });
        }

        const user = userResult[0];

        // Получаем серверы подписки
        const serversResult = await query(`
            SELECT 
                s.uuid,
                s.name,
                s.location,
                s.country_code,
                s.is_active
            FROM subscription_servers ss
            INNER JOIN servers s ON ss.server_uuid = s.uuid
            WHERE ss.user_telegram_id = $1
        `, [userId]);

        // Получаем устройства
        const devicesResult = await query(`
            SELECT 
                hwid,
                device_name,
                last_seen,
                created_at
            FROM user_devices
            WHERE user_telegram_id = $1
            ORDER BY last_seen DESC
        `, [userId]);

        // Проверяем активность подписки
        const hasActiveSubscription = user.subscribed_until 
            ? new Date(user.subscribed_until) > new Date()
            : false;

        // Формируем ответ в формате API
        const response = {
            success: true,
            user: {
                telegram_id: user.telegram_id,
                has_active_subscription: hasActiveSubscription,
                subscription_status: user.subscription_status || 'inactive',
                subscribed_until: user.subscribed_until,
                traffic_limit_gb: user.traffic_limit_gb || 0,
                traffic_used_gb: user.traffic_used_gb || 0,
                device_limit: user.device_limit || 1,
                balance_kopeks: user.balance_kopeks || 0,
                referral_code: user.referral_code,
                servers: serversResult.map(s => ({
                    uuid: s.uuid,
                    name: s.name,
                    location: s.location,
                    country_code: s.country_code,
                    is_active: s.is_active,
                })),
                devices: devicesResult.map(d => ({
                    hwid: d.hwid,
                    device_name: d.device_name,
                    last_seen: d.last_seen,
                    created_at: d.created_at,
                })),
            },
        };

        res.json(response);
    } catch (error) {
        console.error('❌ Ошибка получения подписки:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка загрузки данных подписки',
        });
    }
});

/**
 * GET /api/subscription/settings
 * Получение настроек подписки
 */
router.post('/settings', async (req: Request, res: Response) => {
    try {
        const userId = req.telegramUser?.id;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Пользователь не авторизован',
            });
        }

        // Получаем доступные серверы
        const serversResult = await query(`
            SELECT 
                uuid,
                name,
                location,
                country_code,
                max_users,
                current_users,
                is_active
            FROM servers
            WHERE is_active = true
            ORDER BY location
        `);

        // Получаем доступные периоды подписки
        const periodsResult = await query(`
            SELECT 
                id,
                name,
                days,
                price_kopeks,
                is_active
            FROM subscription_periods
            WHERE is_active = true
            ORDER BY days
        `);

        const response = {
            success: true,
            settings: {
                available_servers: serversResult,
                available_periods: periodsResult,
                traffic_options: [50, 100, 200, 500, 1000], // GB
                device_limits: [1, 2, 3, 5, 10],
            },
        };

        res.json(response);
    } catch (error) {
        console.error('❌ Ошибка получения настроек:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка загрузки настроек',
        });
    }
});

export default router;

