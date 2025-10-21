import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { dbPool, testConnection } from './db';
import subscriptionRoutes from './routes/subscription';
import balanceRoutes from './routes/balance';
import referralRoutes from './routes/referral';
import { errorHandler } from './middleware/errorHandler';
import { validateInitData } from './middleware/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true,
}));

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'miniapp-backend',
    });
});

// API routes (с валидацией Telegram initData)
app.use('/api/subscription', validateInitData, subscriptionRoutes);
app.use('/api/balance', validateInitData, balanceRoutes);
app.use('/api/referral', validateInitData, referralRoutes);

// Error handler
app.use(errorHandler);

// Запуск сервера
async function start() {
    try {
        // Проверяем подключение к БД
        console.log('🔌 Подключение к базе данных...');
        await testConnection();
        console.log('✅ База данных подключена успешно');

        app.listen(PORT, () => {
            console.log(`🚀 MiniApp Backend запущен на порту ${PORT}`);
            console.log(`📊 База данных: ${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`);
            console.log(`🔐 Режим: ${process.env.NODE_ENV}`);
        });
    } catch (error) {
        console.error('❌ Ошибка запуска:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('⚠️ SIGTERM получен, завершаем работу...');
    await dbPool.end();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('⚠️ SIGINT получен, завершаем работу...');
    await dbPool.end();
    process.exit(0);
});

start();

