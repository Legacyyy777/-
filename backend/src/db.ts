import { Pool } from 'pg';

// Пул подключений к PostgreSQL
export const dbPool = new Pool({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DB || 'remnawave_bot',
    user: process.env.POSTGRES_USER || 'miniapp_readonly',
    password: process.env.POSTGRES_PASSWORD || '',
    max: 20, // Максимум подключений
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Обработка ошибок пула
dbPool.on('error', (err) => {
    console.error('❌ Непредвиденная ошибка PostgreSQL:', err);
});

// Проверка подключения
export async function testConnection(): Promise<void> {
    const client = await dbPool.connect();
    try {
        const result = await client.query('SELECT NOW()');
        console.log('✅ PostgreSQL подключен:', result.rows[0].now);
    } finally {
        client.release();
    }
}

// Вспомогательная функция для запросов
export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
    const start = Date.now();
    try {
        const result = await dbPool.query(text, params);
        const duration = Date.now() - start;
        
        if (process.env.NODE_ENV !== 'production') {
            console.log('📊 SQL:', {
                text: text.substring(0, 100),
                duration: `${duration}ms`,
                rows: result.rowCount,
            });
        }
        
        return result.rows;
    } catch (error) {
        console.error('❌ Ошибка SQL запроса:', error);
        throw error;
    }
}

export default dbPool;

