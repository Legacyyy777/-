// Главный компонент приложения

import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTelegram } from './hooks/useTelegram';
import { useAuthStore } from './store/authStore';
import { useUIStore } from './store/uiStore';

// Импорт страниц
import Home from './pages/Home';
import Subscribe from './pages/Subscribe';
import Settings from './pages/Settings';
import Balance from './pages/Balance';
import Referral from './pages/Referral';
import Profile from './pages/Profile';
import Help from './pages/Help';
import Connect from './pages/Connect';
import Login from './pages/Login';

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

        // Устанавливаем тему из Telegram только если нет сохранённой темы
        const savedTheme = localStorage.getItem('app_theme');
        if (theme && !savedTheme) {
            setTheme(theme);
        }

        // Логируем информацию о Telegram WebApp в dev режиме
        if (import.meta.env.DEV && tg) {
            console.log('Telegram WebApp initialized:', {
                version: tg.version,
                platform: tg.platform,
                theme: theme,
                savedTheme: savedTheme,
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
            <Routes>
                {/* Страница авторизации без Layout */}
                <Route path="/login" element={<Login />} />

                {/* Остальные страницы с Layout */}
                <Route path="/" element={<Layout><Home /></Layout>} />
                <Route path="/connect" element={<Layout><Connect /></Layout>} />
                <Route path="/subscribe" element={<Layout><Subscribe /></Layout>} />
                <Route path="/settings" element={<Layout><Settings /></Layout>} />
                <Route path="/balance" element={<Layout><Balance /></Layout>} />
                <Route path="/referral" element={<Layout><Referral /></Layout>} />
                <Route path="/profile" element={<Layout><Profile /></Layout>} />
                <Route path="/help" element={<Layout><Help /></Layout>} />

                {/* Redirect любых неизвестных путей на главную */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;

