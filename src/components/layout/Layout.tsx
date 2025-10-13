// Основной layout приложения с навигацией

import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import TabBar from './TabBar';
import { useUIStore } from '@/store/uiStore';
import FloatingObjects from '../3d/FloatingObjects';
import ParticlesBackground from '../3d/ParticlesBackground';

interface LayoutProps {
    children: ReactNode;
}

/**
 * Главный layout приложения
 * Включает в себя контент страницы и нижнюю панель навигации
 */
const Layout = ({ children }: LayoutProps) => {
    const location = useLocation();
    const { enable3D, enableParticles } = useUIStore();


    // Страницы где не нужен TabBar (если потребуется)
    const hideTabBarRoutes = ['/onboarding', '/payment-success'];
    const showTabBar = !hideTabBarRoutes.includes(location.pathname);

    return (
        <div className="min-h-screen flex flex-col bg-tg-bg relative overflow-hidden">
            {/* Легкие фоновые эффекты */}
            {enable3D && <FloatingObjects />}
            {enableParticles && <ParticlesBackground />}

            {/* Контент страницы */}
            <main className="flex-1 pb-24 relative" style={{ zIndex: 5 }}>
                {children}
            </main>

            {/* Нижняя панель навигации */}
            {showTabBar && <TabBar />}
        </div>
    );
};

export default Layout;

