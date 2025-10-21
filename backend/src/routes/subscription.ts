import { Router, Request, Response } from 'express';
import { query } from '../db';
import { getColumnMapping } from '../db/schema-detector';

const router = Router();

/**
 * GET /api/subscription
 * Получение данных о подписке пользователя
 * Автоматически адаптируется под схему БД
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

        // Получаем маппинг колонок (автоопределение схемы)
        const mapping = await getColumnMapping();
        const u = mapping.users;

        // Универсальный запрос с автоматическим маппингом
        const userResult = await query(`
            SELECT 
                ${u.telegram_id} as telegram_id,
                ${u.balance} as balance_kopeks,
                ${u.referral_code} as referral_code,
                ${u.referred_by} as referred_by,
                ${u.subscription_active} as subscription_active,
                ${u.subscription_expires} as subscribed_until,
                ${u.traffic_limit} as traffic_limit_gb,
                ${u.traffic_used} as traffic_used_gb,
                ${u.device_limit} as device_limit,
                ${u.created_at} as created_at
            FROM users
            WHERE ${u.telegram_id} = $1
        `, [userId]);

        if (userResult.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Пользователь не найден',
            });
        }

        const user = userResult[0];

        // Получаем серверы (если таблица существует)
        let serversResult: any[] = [];
        try {
            serversResult = await query(`
                SELECT DISTINCT
                    s.uuid,
                    s.name,
                    s.location,
                    s.country_code,
                    s.is_active
                FROM servers s
                WHERE s.is_active = true
                ORDER BY s.name
            `);
        } catch (err) {
            console.warn('⚠️ Не удалось загрузить серверы:', err);
        }

        // Получаем устройства (если таблица существует)
        let devicesResult: any[] = [];
        try {
            // Пробуем разные варианты названий таблицы и колонок
            const deviceQueries = [
                // Вариант 1: user_devices с user_telegram_id
                `SELECT hwid, device_name as name, last_seen, created_at 
                 FROM user_devices 
                 WHERE user_telegram_id = $1 
                 ORDER BY last_seen DESC LIMIT 10`,
                // Вариант 2: devices с telegram_id
                `SELECT hwid, name, last_seen, created_at 
                 FROM devices 
                 WHERE telegram_id = $1 
                 ORDER BY last_seen DESC LIMIT 10`,
                // Вариант 3: devices с user_id
                `SELECT hwid, name, last_seen, created_at 
                 FROM devices 
                 WHERE user_id = $1 
                 ORDER BY last_seen DESC LIMIT 10`,
            ];

            for (const deviceQuery of deviceQueries) {
                try {
                    devicesResult = await query(deviceQuery, [userId]);
                    break;
                } catch (err) {
                    continue;
                }
            }
        } catch (err) {
            console.warn('⚠️ Не удалось загрузить устройства:', err);
        }

        // Проверяем активность подписки
        const hasActiveSubscription = user.subscribed_until
            ? new Date(user.subscribed_until) > new Date()
            : Boolean(user.subscription_active);

        // Формируем ответ в формате API
        const response = {
            success: true,
            user: {
                telegram_id: user.telegram_id,
                has_active_subscription: hasActiveSubscription,
                subscription_status: hasActiveSubscription ? 'active' : 'inactive',
                subscribed_until: user.subscribed_until,
                traffic_limit_gb: parseFloat(user.traffic_limit_gb) || 0,
                traffic_used_gb: parseFloat(user.traffic_used_gb) || 0,
                device_limit: parseInt(user.device_limit) || 1,
                balance_kopeks: parseInt(user.balance_kopeks) || 0,
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
                    device_name: d.name || d.device_name,
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
        let serversResult: any[] = [];
        try {
            serversResult = await query(`
                SELECT 
                    uuid,
                    name,
                    location,
                    country_code,
                    is_active
                FROM servers
                WHERE is_active = true
                ORDER BY location
            `);
        } catch (err) {
            console.warn('⚠️ Таблица servers не найдена');
        }

        // Получаем доступные периоды подписки (если есть)
        let periodsResult: any[] = [];
        try {
            periodsResult = await query(`
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
        } catch (err) {
            // Если таблицы нет - используем дефолтные значения
            periodsResult = [
                { id: '1m', name: '1 месяц', days: 30, price_kopeks: 15000, is_active: true },
                { id: '3m', name: '3 месяца', days: 90, price_kopeks: 40000, is_active: true },
                { id: '6m', name: '6 месяцев', days: 180, price_kopeks: 75000, is_active: true },
            ];
        }

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

