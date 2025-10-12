// Оптимизированный App с lazy loading

import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTelegram } from './hooks/useTelegram';
import { useAuthStore } from './store/authStore';
import { useUIStore } from './store/uiStore';

// Layout компоненты загружаются сразу (небольшие)
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/animations/LoadingSpinner';

// Lazy loading страниц для оптимизации bundle
const Home = lazy(() => import('./pages/Home'));
const Subscribe = lazy(() => import('./pages/Subscribe'));
const Settings = lazy(() => import('./pages/Settings'));
const Balance = lazy(() => import('./pages/Balance'));
const Referral = lazy(() => import('./pages/Referral'));
const Profile = lazy(() => import('./pages/Profile'));
const Help = lazy(() => import('./pages/Help'));

/**
 * Главный компонент приложения с оптимизацией
 */
function App() {
    const { tg, isReady, theme } = useTelegram();
    const { checkAuth } = useAuthStore();
    const { setTheme } = useUIStore();

    useEffect(() => {
        checkAuth();

        if (theme) {
            setTheme(theme);
        }

        if (import.meta.env.DEV && tg) {
            console.log('Telegram WebApp initialized:', {
                version: tg.version,
                platform: tg.platform,
                theme: theme,
                isExpanded: tg.isExpanded,
            });
        }
    }, [checkAuth, setTheme, theme, tg]);

    if (!isReady) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner size="lg" text="Загрузка..." />
            </div>
        );
    }

    return (
        <Router>
            <Layout>
                <Suspense
                    fallback={
                        <div className="flex items-center justify-center min-h-[60vh]">
                            <LoadingSpinner />
                        </div>
                    }
                >
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/subscribe" element={<Subscribe />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/balance" element={<Balance />} />
                        <Route path="/referral" element={<Referral />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/help" element={<Help />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Suspense>
            </Layout>
        </Router>
    );
}

export default App;

