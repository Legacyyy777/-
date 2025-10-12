// Основной layout приложения с навигацией

import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import TabBar from './TabBar';

interface LayoutProps {
    children: ReactNode;
}

/**
 * Главный layout приложения
 * Включает в себя контент страницы и нижнюю панель навигации
 */
const Layout = ({ children }: LayoutProps) => {
    const location = useLocation();

    // Страницы где не нужен TabBar (если потребуется)
    const hideTabBarRoutes = ['/onboarding', '/payment-success'];
    const showTabBar = !hideTabBarRoutes.includes(location.pathname);

    return (
        <div className="min-h-screen flex flex-col bg-tg-bg">
            {/* Контент страницы */}
            <main className="flex-1 pb-20">
                {children}
            </main>

            {/* Нижняя панель навигации */}
            {showTabBar && <TabBar />}
        </div>
    );
};

export default Layout;

