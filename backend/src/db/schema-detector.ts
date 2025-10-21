import { query } from '../db';

/**
 * Автоматическое определение схемы БД
 * Проверяет структуру таблиц и возвращает маппинг колонок
 */

interface ColumnMapping {
    users: {
        id: string;
        telegram_id: string;
        balance: string;
        subscription_active: string;
        subscription_expires: string;
        traffic_limit: string;
        traffic_used: string;
        device_limit: string;
        referral_code: string;
        referred_by: string;
        created_at: string;
    };
    subscriptions?: {
        id: string;
        user_id: string;
        expires_at: string;
        is_active: string;
    };
    devices?: {
        id: string;
        user_id: string;
        hwid: string;
        name: string;
        last_seen: string;
    };
    servers?: {
        id: string;
        uuid: string;
        name: string;
        location: string;
        country_code: string;
        is_active: string;
    };
}

let cachedMapping: ColumnMapping | null = null;

/**
 * Получение списка колонок таблицы
 */
async function getTableColumns(tableName: string): Promise<string[]> {
    try {
        const result = await query<{ column_name: string }>(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = $1
            ORDER BY ordinal_position
        `, [tableName]);

        return result.map(r => r.column_name);
    } catch (error) {
        console.warn(`Таблица ${tableName} не найдена:`, error);
        return [];
    }
}

/**
 * Определение маппинга колонок
 */
async function detectColumnMapping(): Promise<ColumnMapping> {
    const usersColumns = await getTableColumns('users');

    if (usersColumns.length === 0) {
        throw new Error('Таблица users не найдена в БД');
    }

    console.log('📊 Найденные колонки users:', usersColumns);

    // Умный маппинг колонок
    const mapping: ColumnMapping = {
        users: {
            id: findColumn(usersColumns, ['id', 'user_id', 'pk']),
            telegram_id: findColumn(usersColumns, ['telegram_id', 'tg_id', 'user_id', 'telegram_user_id']),
            balance: findColumn(usersColumns, ['balance_kopeks', 'balance', 'balance_rub', 'wallet']),
            subscription_active: findColumn(usersColumns, ['has_active_subscription', 'subscription_active', 'is_active', 'active']),
            subscription_expires: findColumn(usersColumns, ['subscribed_until', 'subscription_expires_at', 'expires_at', 'sub_expires']),
            traffic_limit: findColumn(usersColumns, ['traffic_limit_gb', 'traffic_limit', 'data_limit_gb', 'bandwidth_limit']),
            traffic_used: findColumn(usersColumns, ['traffic_used_gb', 'traffic_used', 'data_used_gb', 'bandwidth_used']),
            device_limit: findColumn(usersColumns, ['device_limit', 'max_devices', 'devices_limit', 'max_connections']),
            referral_code: findColumn(usersColumns, ['referral_code', 'ref_code', 'invite_code']),
            referred_by: findColumn(usersColumns, ['referred_by', 'referrer_code', 'invited_by']),
            created_at: findColumn(usersColumns, ['created_at', 'registered_at', 'join_date', 'signup_date']),
        },
    };

    console.log('✅ Маппинг колонок определен:', mapping);
    return mapping;
}

/**
 * Поиск подходящей колонки из списка вариантов
 */
function findColumn(columns: string[], variants: string[]): string {
    for (const variant of variants) {
        if (columns.includes(variant)) {
            return variant;
        }
    }
    // Если не нашли - возвращаем первый вариант (будет ошибка при запросе)
    console.warn(`⚠️ Колонка не найдена среди вариантов: ${variants.join(', ')}`);
    return variants[0];
}

/**
 * Получение маппинга (с кэшированием)
 */
export async function getColumnMapping(): Promise<ColumnMapping> {
    if (!cachedMapping) {
        cachedMapping = await detectColumnMapping();
    }
    return cachedMapping;
}

/**
 * Сброс кэша (для тестов)
 */
export function resetColumnMappingCache() {
    cachedMapping = null;
}

