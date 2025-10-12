// Основной layout приложения с навигацией

import { ReactNode, lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import TabBar from './TabBar';
import { useUIStore } from '@/store/uiStore';

// Lazy loading 3D компонентов для оптимизации
const FloatingObjects = lazy(() => import('../3d/FloatingObjects'));
const ParticlesBackground = lazy(() => import('../3d/ParticlesBackground'));

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
            {/* 3D фоновые эффекты */}
            <Suspense fallback={null}>
                {enable3D && <FloatingObjects />}
                {enableParticles && <ParticlesBackground />}
            </Suspense>

            {/* Контент страницы */}
            <main className="flex-1 pb-20 relative z-10">
                {children}
            </main>

            {/* Нижняя панель навигации */}
            {showTabBar && <TabBar />}
        </div>
    );
};

export default Layout;

