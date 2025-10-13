// Нижняя панель навигации

import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { useTelegram } from '@/hooks/useTelegram';

/**
 * Нижняя панель навигации с иконками
 */
const TabBar = () => {
    const { t } = useTranslation();
    const { hapticSelection } = useTelegram();
    const location = useLocation();

    // Навигационные элементы
    const navItems = [
        { path: '/', label: t('navigation.home'), icon: '🏠' },
        { path: '/subscribe', label: t('navigation.subscribe'), icon: '📦' },
        { path: '/balance', label: t('navigation.balance'), icon: '💰' },
        { path: '/referral', label: t('navigation.referral'), icon: '👥' },
        { path: '/profile', label: t('navigation.profile'), icon: '👤' },
    ];

    // Находим индекс активного элемента
    const activeIndex = navItems.findIndex(item => item.path === location.pathname);

    return (
        <nav className="fixed bottom-4 left-4 right-4 safe-area-inset-bottom z-50">
            {/* Liquid Glass Background */}
            <div className="liquid-glass rounded-3xl overflow-hidden">
                {/* Animated gradient overlay */}
                <div className="absolute inset-0 animate-liquidGlow opacity-50"></div>

                {/* Navigation items */}
                <div className="relative flex justify-around items-center h-16 px-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => hapticSelection()}
                            className={({ isActive }) =>
                                `relative flex flex-col items-center justify-center w-full h-full transition-all duration-300 rounded-2xl ${isActive
                                    ? 'text-white animate-float'
                                    : 'text-white/70 hover:text-white hover:animate-float'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {/* Active background with liquid glass effect */}
                                    {isActive && (
                                        <div className="liquid-glass-active absolute inset-1 rounded-xl"></div>
                                    )}

                                    {/* Icon with glow effect */}
                                    <span className={`relative text-2xl mb-0.5 transition-all duration-300 ${isActive ? 'drop-shadow-lg filter brightness-110' : ''}`}>
                                        {item.icon}
                                    </span>

                                    {/* Label */}
                                    <span className="relative text-xs font-medium transition-all duration-300">
                                        {item.label}
                                    </span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>
            </div>
        </nav>
    );
};

export default TabBar;

