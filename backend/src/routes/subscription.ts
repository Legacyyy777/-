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

        // Для Bedolaga бота используем JOIN users + subscriptions
        const userResult = await query(`
            SELECT 
                u.id as user_db_id,
                u.telegram_id,
                u.balance_kopeks,
                u.referral_code,
                u.referred_by_id,
                u.created_at as user_created_at,
                s.id as subscription_id,
                s.status as subscription_status,
                s.end_date as subscribed_until,
                s.traffic_limit_gb,
                s.traffic_used_gb,
                s.device_limit,
                s.subscription_url,
                s.remnawave_short_uuid,
                s.subscription_crypto_link
            FROM users u
            LEFT JOIN subscriptions s ON s.user_id = u.id
            WHERE u.telegram_id = $1
            ORDER BY s.id DESC
            LIMIT 1
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

        // Получаем транзакции пользователя
        let transactionsResult: any[] = [];
        try {
            transactionsResult = await query(`
                SELECT 
                    id,
                    type,
                    amount_kopeks,
                    description,
                    payment_method,
                    external_id,
                    is_completed,
                    created_at,
                    completed_at
                FROM transactions
                WHERE user_id = $1
                ORDER BY created_at DESC
                LIMIT 50
            `, [user.user_db_id]);
        } catch (err) {
            console.warn('⚠️ Не удалось загрузить транзакции:', err);
        }

        // Получаем список рефералов
        let referralsResult: any[] = [];
        let referralEarningsResult: any[] = [];
        try {
            // Список приглашенных пользователей
            referralsResult = await query(`
                SELECT 
                    u.id,
                    u.telegram_id,
                    u.username,
                    u.first_name,
                    u.last_name,
                    u.created_at,
                    COALESCE(SUM(re.amount_kopeks), 0) as total_earned_kopeks
                FROM users u
                LEFT JOIN referral_earnings re ON re.referral_id = u.id AND re.user_id = $1
                WHERE u.referred_by_id = $1
                GROUP BY u.id, u.telegram_id, u.username, u.first_name, u.last_name, u.created_at
                ORDER BY u.created_at DESC
                LIMIT 100
            `, [user.user_db_id]);

            // История заработка с рефералов
            referralEarningsResult = await query(`
                SELECT 
                    re.id,
                    re.amount_kopeks,
                    re.reason,
                    re.created_at,
                    u.first_name || ' ' || COALESCE(u.last_name, '') as referral_name,
                    u.username as referral_username
                FROM referral_earnings re
                JOIN users u ON u.id = re.referral_id
                WHERE re.user_id = $1
                ORDER BY re.created_at DESC
                LIMIT 50
            `, [user.user_db_id]);
        } catch (err) {
            console.warn('⚠️ Не удалось загрузить рефералов:', err);
        }

        // Получаем серверы (squads)
        let squadsResult: any[] = [];
        try {
            squadsResult = await query(`
                SELECT 
                    uuid,
                    name,
                    country_code,
                    is_available,
                    price_kopeks,
                    description
                FROM squads
                WHERE is_available = true
                ORDER BY name
            `);
        } catch (err) {
            console.warn('⚠️ Не удалось загрузить серверы (squads):', err);
        }

        // Считаем общую сумму потраченную
        let totalSpentKopeks = 0;
        try {
            const totalSpentResult = await query(`
                SELECT COALESCE(SUM(ABS(amount_kopeks)), 0) as total
                FROM transactions
                WHERE user_id = $1 
                AND amount_kopeks < 0 
                AND is_completed = true
            `, [user.user_db_id]);
            totalSpentKopeks = parseInt(totalSpentResult[0]?.total) || 0;
        } catch (err) {
            console.warn('⚠️ Не удалось посчитать total_spent:', err);
        }

        // Считаем общий заработок с рефералов
        let totalReferralEarningsKopeks = 0;
        try {
            const totalEarningsResult = await query(`
                SELECT COALESCE(SUM(amount_kopeks), 0) as total
                FROM referral_earnings
                WHERE user_id = $1
            `, [user.user_db_id]);
            totalReferralEarningsKopeks = parseInt(totalEarningsResult[0]?.total) || 0;
        } catch (err) {
            console.warn('⚠️ Не удалось посчитать referral earnings:', err);
        }

        // Проверяем активность подписки
        const hasActiveSubscription = user.subscription_status === 'active' &&
            user.subscribed_until &&
            new Date(user.subscribed_until) > new Date();

        // Формируем ответ в формате API (совместимый с текущим frontend)
        const response = {
            success: true,
            subscription_id: user.subscription_id,
            remnawave_short_uuid: user.remnawave_short_uuid,
            balance_kopeks: parseInt(user.balance_kopeks) || 0,
            total_spent_kopeks: totalSpentKopeks,
            connected_devices_count: devicesResult.length,
            user: {
                telegram_id: user.telegram_id,
                has_active_subscription: hasActiveSubscription,
                subscription_status: user.subscription_status || 'inactive',
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
            subscription_url: user.subscription_url,
            subscription_crypto_link: user.subscription_crypto_link,

            // Транзакции (история пополнений и списаний)
            transactions: transactionsResult.map(t => ({
                id: t.id,
                type: t.type,
                amount_kopeks: parseInt(t.amount_kopeks),
                description: t.description,
                payment_method: t.payment_method,
                is_completed: t.is_completed,
                created_at: t.created_at,
                completed_at: t.completed_at,
            })),

            // Реферальная программа
            referral: {
                referral_code: user.referral_code,
                referral_link: user.referral_code
                    ? `https://t.me/${process.env.BOT_USERNAME || 'your_bot'}?start=ref_${user.referral_code}`
                    : null,
                total_referrals: referralsResult.length,
                total_earned_kopeks: totalReferralEarningsKopeks,

                // Статистика
                stats: {
                    invited_count: referralsResult.length,
                    active_referrals_count: referralsResult.filter(r => r.total_earned_kopeks > 0).length,
                    total_earned_kopeks: totalReferralEarningsKopeks,
                    total_earned_label: `${(totalReferralEarningsKopeks / 100).toFixed(2)} ₽`,
                    conversion_rate: referralsResult.length > 0
                        ? (referralsResult.filter(r => r.total_earned_kopeks > 0).length / referralsResult.length) * 100
                        : 0,
                },

                // Условия (можно настроить через env или БД)
                terms: {
                    commission_percent: 10,
                    inviter_bonus_kopeks: 0,
                    inviter_bonus_label: '0 ₽',
                    invited_bonus_kopeks: 0,
                    invited_bonus_label: '0 ₽',
                },

                // Список рефералов
                referrals: {
                    total: referralsResult.length,
                    page: 1,
                    limit: 100,
                    items: referralsResult.map(r => ({
                        id: r.id,
                        telegram_id: r.telegram_id,
                        username: r.username,
                        full_name: `${r.first_name || ''} ${r.last_name || ''}`.trim() || 'Пользователь',
                        created_at: r.created_at,
                        total_earned_kopeks: parseInt(r.total_earned_kopeks) || 0,
                        total_earned_label: `${(parseInt(r.total_earned_kopeks) || 0) / 100} ₽`,
                        status: parseInt(r.total_earned_kopeks) > 0 ? 'active' : 'inactive',
                    })),
                },

                // История заработка
                recent_earnings: referralEarningsResult.map(e => ({
                    id: e.id,
                    amount_kopeks: parseInt(e.amount_kopeks),
                    amount_label: `${(parseInt(e.amount_kopeks) / 100).toFixed(2)} ₽`,
                    reason: e.reason,
                    referral_name: e.referral_name?.trim() || e.referral_username || 'Пользователь',
                    created_at: e.created_at,
                })),
            },

            // Доступные серверы (squads)
            available_squads: squadsResult.map(s => ({
                uuid: s.uuid,
                name: s.name,
                country_code: s.country_code,
                is_available: s.is_available,
                price_kopeks: parseInt(s.price_kopeks) || 0,
                price_label: `${(parseInt(s.price_kopeks) || 0) / 100} ₽`,
                description: s.description,
            })),
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

