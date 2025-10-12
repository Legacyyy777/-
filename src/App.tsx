// Главный компонент приложения

import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTelegram } from './hooks/useTelegram';
import { useAuthStore } from './store/authStore';
import { useUIStore } from './store/uiStore';

// Импорт страниц (lazy loading будет добавлен позже для оптимизации)
import Home from './pages/Home';
import Subscribe from './pages/Subscribe';
import Settings from './pages/Settings';
import Balance from './pages/Balance';
import Referral from './pages/Referral';
import Profile from './pages/Profile';
import Help from './pages/Help';

// Импорт Layout компонентов (будут созданы позже)
import Layout from './components/layout/Layout';

/**
 * Главный компонент приложения
 * Инициализирует Telegram WebApp, проверяет авторизацию,
 * настраивает роутинг
 */
function App() {
    const { tg, isReady, theme } = useTelegram();
    const { checkAuth } = useAuthStore();
    const { setTheme } = useUIStore();

    useEffect(() => {
        // Проверяем авторизацию через Telegram
        checkAuth();

        // Устанавливаем тему из Telegram
        if (theme) {
            setTheme(theme);
        }

        // Логируем информацию о Telegram WebApp в dev режиме
        if (import.meta.env.DEV && tg) {
            console.log('Telegram WebApp initialized:', {
                version: tg.version,
                platform: tg.platform,
                theme: theme,
                isExpanded: tg.isExpanded,
            });
        }
    }, [checkAuth, setTheme, theme, tg]);

    // Показываем loader пока Telegram WebApp не готов
    if (!isReady) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="loader"></div>
            </div>
        );
    }

    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/subscribe" element={<Subscribe />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/balance" element={<Balance />} />
                    <Route path="/referral" element={<Referral />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/help" element={<Help />} />

                    {/* Redirect любых неизвестных путей на главную */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;

